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
const user_routes_1 = __importDefault(require("../../src/routes/user.routes"));
const user_model_1 = require("../../src/models/user.model");
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
describe('User Routes', () => {
    let app;
    let mongoServer;
    let testUser;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        mongoServer = yield mongodb_memory_server_1.MongoMemoryServer.create();
        yield mongoose_1.default.connect(mongoServer.getUri());
        app = (0, express_1.default)();
        app.use(express_1.default.json());
        app.use((0, cookie_parser_1.default)());
        app.use('/api/users', user_routes_1.default);
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield mongoose_1.default.disconnect();
        yield mongoServer.stop();
    }));
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield user_model_1.User.deleteMany({});
        testUser = yield user_model_1.User.create({
            username: 'testuser',
            progress: []
        });
    }));
    describe('POST /', () => {
        it('should return existing user if username exists', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post('/api/users')
                .send({ username: 'testuser' });
            expect(response.status).toBe(201);
            expect(response.body.userId).toBe(testUser._id.toString());
        }));
        it('should return 400 if username is missing', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post('/api/users')
                .send({});
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Username is required');
        }));
        it('should return 400 if username is empty', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post('/api/users')
                .send({ username: '' });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Username is required');
        }));
    });
    describe('GET /me', () => {
        it('should return current user', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/api/users/me')
                .set('Cookie', [`userId=${testUser._id}`]);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('user');
            expect(response.body.user.username).toBe('testuser');
            expect(response.body).toHaveProperty('correctScore');
            expect(response.body).toHaveProperty('incorrectScore');
        }));
        it('should return 404 if user not found', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/api/users/me')
                .set('Cookie', [`userId=${new mongoose_1.default.Types.ObjectId()}`]);
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'User not found');
        }));
        it('should return correct progress scores', () => __awaiter(void 0, void 0, void 0, function* () {
            // Update user with some progress
            yield user_model_1.User.findByIdAndUpdate(testUser._id, {
                progress: [
                    { city: new mongoose_1.default.Types.ObjectId(), correct: true },
                    { city: new mongoose_1.default.Types.ObjectId(), correct: false },
                    { city: new mongoose_1.default.Types.ObjectId(), correct: true }
                ]
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/users/me')
                .set('Cookie', [`userId=${testUser._id}`]);
            expect(response.body.correctScore).toBe(2);
            expect(response.body.incorrectScore).toBe(1);
        }));
    });
    describe('GET /:id', () => {
        it('should return user by id', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get(`/api/users/${testUser._id}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('user');
            expect(response.body.user.username).toBe('testuser');
            expect(response.body).toHaveProperty('correctScore');
            expect(response.body).toHaveProperty('incorrectScore');
        }));
        it('should return 404 if user not found', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get(`/api/users/${new mongoose_1.default.Types.ObjectId()}`);
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'User not found');
        }));
        it('should return 401 if id is invalid', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/api/users/invalid-id');
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'Not authenticated');
        }));
        it('should return correct progress scores', () => __awaiter(void 0, void 0, void 0, function* () {
            // Update user with some progress
            yield user_model_1.User.findByIdAndUpdate(testUser._id, {
                progress: [
                    { city: new mongoose_1.default.Types.ObjectId(), correct: true },
                    { city: new mongoose_1.default.Types.ObjectId(), correct: false }
                ]
            });
            const response = yield (0, supertest_1.default)(app)
                .get(`/api/users/${testUser._id}`);
            expect(response.body.correctScore).toBe(1);
            expect(response.body.incorrectScore).toBe(1);
        }));
    });
    describe('Error Handling', () => {
        it('should handle database errors gracefully', () => __awaiter(void 0, void 0, void 0, function* () {
            // Force a database error
            jest.spyOn(user_model_1.User, 'findById').mockRejectedValueOnce(new Error('Database error'));
            const response = yield (0, supertest_1.default)(app)
                .get('/api/users/me')
                .set('Cookie', [`userId=${testUser._id}`]);
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to get any user');
        }));
    });
});
