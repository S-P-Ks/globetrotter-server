"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const city_routes_1 = __importDefault(require("../../src/routes/city.routes"));
const city_model_1 = require("../../src/models/city.model");
const user_model_1 = require("../../src/models/user.model");
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
describe('City Routes', () => {
    let app;
    let mongoServer;
    let testUser;
    let testCity;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        mongoServer = yield mongodb_memory_server_1.MongoMemoryServer.create();
        yield mongoose_1.default.connect(mongoServer.getUri());
        app = (0, express_1.default)();
        app.use(express_1.default.json());
        app.use((0, cookie_parser_1.default)());
        app.use('/api/cities', city_routes_1.default);
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield mongoose_1.default.disconnect();
        yield mongoServer.stop();
    }));
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield city_model_1.City.deleteMany({});
        yield user_model_1.User.deleteMany({});
        // Create test user
        testUser = yield user_model_1.User.create({
            username: 'testuser',
            progress: []
        });
        // Create test city
        testCity = yield city_model_1.City.create({
            city: 'Test City',
            country: 'Test Country',
            clues: ['Clue 1', 'Clue 2'],
            fun_fact: ['Fact 1'],
            trivia: ['Trivia 1']
        });
    }));
    describe('GET /randomCity', () => {
        it('should return 403 when user is not logged in', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/api/cities/randomCity');
            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty('message', 'User should loggedin');
        }));
        it('should not return previously answered cities', () => __awaiter(void 0, void 0, void 0, function* () {
            // Update user progress with answered city
            yield user_model_1.User.findByIdAndUpdate(testUser._id, {
                progress: [{ city: testCity._id, correct: true }]
            });
            // Create another city for testing
            const anotherCity = yield city_model_1.City.create({
                city: 'Another City',
                country: 'Another Country',
                clues: ['Clue A', 'Clue B'],
                fun_fact: ['Fact A'],
                trivia: ['Trivia A']
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/cities/randomCity')
                .set('Cookie', [`userId=${testUser._id}`]);
            expect(response.status).toBe(200);
            expect(response.body.data._id).not.toBe(testCity._id.toString());
        }));
        it('should return empty data when all cities are answered', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mark the only test city as answered
            yield user_model_1.User.findByIdAndUpdate(testUser._id, {
                progress: [{ city: testCity._id, correct: true }]
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/cities/randomCity')
                .set('Cookie', [`userId=${testUser._id}`]);
            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                data: {},
                options: []
            });
        }));
    });
    describe('POST /validate', () => {
        it('should return 403 when user is not logged in', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post('/api/cities/validate')
                .send({
                cityId: testCity._id,
                guess: 'Test City'
            });
            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty('message', 'User should loggedin');
        }));
        it('should validate correct guess', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post('/api/cities/validate')
                .set('Cookie', [`userId=${testUser._id}`])
                .send({
                cityId: testCity._id,
                guess: 'Test City'
            });
            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                correct: true,
                actualCity: 'Test City'
            });
            // Verify user progress was updated
            const updatedUser = yield user_model_1.User.findById(testUser._id);
            expect(updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.progress).toHaveLength(1);
            expect(updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.progress[0].correct).toBe(true);
        }));
        it('should validate incorrect guess', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post('/api/cities/validate')
                .set('Cookie', [`userId=${testUser._id}`])
                .send({
                cityId: testCity._id,
                guess: 'Wrong City'
            });
            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                correct: false,
                actualCity: 'Test City'
            });
            // Verify user progress was updated
            const updatedUser = yield user_model_1.User.findById(testUser._id);
            expect(updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.progress).toHaveLength(1);
            expect(updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.progress[0].correct).toBe(false);
        }));
        it('should handle case-insensitive validation', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post('/api/cities/validate')
                .set('Cookie', [`userId=${testUser._id}`])
                .send({
                cityId: testCity._id,
                guess: 'test CITY'
            });
            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                correct: true,
                actualCity: 'Test City'
            });
        }));
        it('should return 404 for non-existent city', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post('/api/cities/validate')
                .set('Cookie', [`userId=${testUser._id}`])
                .send({
                cityId: new mongoose_1.default.Types.ObjectId(),
                guess: 'Test City'
            });
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('message', 'City or user not found');
        }));
    });
});
