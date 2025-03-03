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
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
const user_model_1 = require("../../src/models/user.model");
const city_model_1 = require("../../src/models/city.model");
describe('User Model', () => {
    let mongoServer;
    let testCity;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        mongoServer = yield mongodb_memory_server_1.MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        yield mongoose_1.default.connect(mongoUri);
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield mongoose_1.default.disconnect();
        yield mongoServer.stop();
    }));
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield user_model_1.User.deleteMany({});
        yield city_model_1.City.deleteMany({});
        // Create a test city
        testCity = yield city_model_1.City.create({
            city: 'Test City',
            country: 'Test Country',
            clues: ['Clue 1', 'Clue 2'],
            fun_fact: ['Fact 1'],
            trivia: ['Trivia 1']
        });
    }));
    it('should create a user with valid data', () => __awaiter(void 0, void 0, void 0, function* () {
        const userData = {
            username: 'testuser',
            progress: [],
            totalScore: 0
        };
        const user = yield user_model_1.User.create(userData);
        expect(user.username).toBe(userData.username);
        expect(user.progress).toHaveLength(0);
        expect(user.totalScore).toBe(0);
        expect(user.completedAllCities).toBe(false);
        expect(user.createdAt).toBeDefined();
    }));
    it('should require username', () => __awaiter(void 0, void 0, void 0, function* () {
        const userData = {};
        yield expect(user_model_1.User.create(userData)).rejects.toThrow(mongoose_1.default.Error.ValidationError);
    }));
    it('should enforce unique usernames', () => __awaiter(void 0, void 0, void 0, function* () {
        const userData = {
            username: 'testuser'
        };
        yield user_model_1.User.create(userData);
        yield expect(user_model_1.User.create(userData)).rejects.toThrow();
    }));
    describe('updateCityProgress', () => {
        let user;
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            user = yield user_model_1.User.create({
                username: 'testuser',
                progress: []
            });
        }));
        it('should add new progress when city is attempted first time', () => __awaiter(void 0, void 0, void 0, function* () {
            yield user.updateCityProgress(testCity._id, true);
            expect(user.progress).toHaveLength(1);
            expect(user.progress[0].city.toString()).toBe(testCity._id.toString());
            expect(user.progress[0].correct).toBe(true);
        }));
        it('should update existing progress when city is attempted again', () => __awaiter(void 0, void 0, void 0, function* () {
            // First attempt - incorrect
            yield user.updateCityProgress(testCity._id, false);
            // Second attempt - correct
            yield user.updateCityProgress(testCity._id, true);
            expect(user.progress).toHaveLength(1);
            expect(user.progress[0].correct).toBe(true);
        }));
        it('should not change correct status if already correct', () => __awaiter(void 0, void 0, void 0, function* () {
            // First attempt - correct
            yield user.updateCityProgress(testCity._id, true);
            // Second attempt - incorrect
            yield user.updateCityProgress(testCity._id, false);
            expect(user.progress[0].correct).toBe(true);
        }));
    });
    describe('completedCount virtual', () => {
        it('should return correct count of completed cities', () => __awaiter(void 0, void 0, void 0, function* () {
            const user = yield user_model_1.User.create({
                username: 'testuser',
                progress: [
                    { city: new mongoose_1.default.Types.ObjectId(), correct: true },
                    { city: new mongoose_1.default.Types.ObjectId(), correct: false },
                    { city: new mongoose_1.default.Types.ObjectId(), correct: true }
                ]
            });
            expect(user.completedCount).toBe(2);
        }));
    });
    describe('completedAllCities post save hook', () => {
        it('should update completedAllCities when all cities are completed', () => __awaiter(void 0, void 0, void 0, function* () {
            const user = yield user_model_1.User.create({
                username: 'testuser',
                progress: [{ city: testCity._id, correct: true }]
            });
            expect(user.completedAllCities).toBe(true);
        }));
        it('should not update completedAllCities when not all cities are completed', () => __awaiter(void 0, void 0, void 0, function* () {
            // Create another city
            yield city_model_1.City.create({
                city: 'Another City',
                country: 'Test Country',
                clues: ['Clue 1'],
                fun_fact: ['Fact 1'],
                trivia: ['Trivia 1']
            });
            const user = yield user_model_1.User.create({
                username: 'testuser',
                progress: [{ city: testCity._id, correct: true }]
            });
            expect(user.completedAllCities).toBe(false);
        }));
    });
    describe('currentGame', () => {
        it('should initialize with default values', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            const user = yield user_model_1.User.create({
                username: 'testuser'
            });
            expect((_a = user.currentGame) === null || _a === void 0 ? void 0 : _a.attempts).toBe(0);
            expect((_b = user.currentGame) === null || _b === void 0 ? void 0 : _b.hintsUsed).toHaveLength(0);
        }));
        it('should store game state correctly', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            const gameState = {
                city: testCity._id,
                attempts: 2,
                hintsUsed: ['hint1', 'hint2'],
                startTime: new Date()
            };
            const user = yield user_model_1.User.create({
                username: 'testuser',
                currentGame: gameState
            });
            expect((_b = (_a = user.currentGame) === null || _a === void 0 ? void 0 : _a.city) === null || _b === void 0 ? void 0 : _b.toString()).toBe(testCity._id.toString());
            expect((_c = user.currentGame) === null || _c === void 0 ? void 0 : _c.attempts).toBe(2);
            expect((_d = user.currentGame) === null || _d === void 0 ? void 0 : _d.hintsUsed).toEqual(['hint1', 'hint2']);
            expect((_e = user.currentGame) === null || _e === void 0 ? void 0 : _e.startTime).toBeDefined();
        }));
    });
});
