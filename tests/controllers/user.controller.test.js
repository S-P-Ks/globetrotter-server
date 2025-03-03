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
Object.defineProperty(exports, "__esModule", { value: true });
const user_controllers_1 = require("../../src/controllers/user.controllers");
const user_model_1 = require("../../src/models/user.model");
jest.mock('../../src/models/user.model');
describe('User Controllers', () => {
    let mockRequest;
    let mockResponse;
    beforeEach(() => {
        jest.clearAllMocks();
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            cookie: jest.fn().mockReturnThis(),
        };
    });
    describe('createUser', () => {
        beforeEach(() => {
            mockRequest = {
                body: { username: 'testuser' }
            };
        });
        it('should return 400 if username is missing', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.body = {};
            yield (0, user_controllers_1.createUser)(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Username is required' });
        }));
        it('should return 400 if username is empty', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.body = { username: '   ' };
            yield (0, user_controllers_1.createUser)(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Username is required' });
        }));
        it('should create new user if username does not exist', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockUser = { _id: 'user123', username: 'testuser' };
            user_model_1.User.findOne.mockResolvedValueOnce(null);
            user_model_1.User.create.mockResolvedValueOnce(mockUser);
            yield (0, user_controllers_1.createUser)(mockRequest, mockResponse);
            expect(mockResponse.cookie).toHaveBeenCalledWith('userId', 'user123', expect.any(Object));
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                userId: 'user123'
            });
        }));
        it('should return existing user if username exists', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockUser = { _id: 'user123', username: 'testuser' };
            user_model_1.User.findOne.mockResolvedValueOnce(mockUser);
            yield (0, user_controllers_1.createUser)(mockRequest, mockResponse);
            expect(user_model_1.User.create).not.toHaveBeenCalled();
            expect(mockResponse.cookie).toHaveBeenCalledWith('userId', 'user123', expect.any(Object));
            expect(mockResponse.status).toHaveBeenCalledWith(201);
        }));
        it('should handle database errors', () => __awaiter(void 0, void 0, void 0, function* () {
            user_model_1.User.findOne.mockRejectedValueOnce(new Error('DB Error'));
            yield (0, user_controllers_1.createUser)(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Failed to create user' });
        }));
    });
    describe('getCurrentUser', () => {
        beforeEach(() => {
            mockRequest = {
                cookies: { userId: 'user123' }
            };
        });
        it('should return 401 if userId cookie is missing', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.cookies = {};
            yield (0, user_controllers_1.getCurrentUser)(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Not authenticated' });
        }));
        it('should return 404 if user is not found', () => __awaiter(void 0, void 0, void 0, function* () {
            user_model_1.User.findById.mockResolvedValueOnce(null);
            yield (0, user_controllers_1.getCurrentUser)(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'User not found' });
        }));
        it('should return user with correct and incorrect scores', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockUser = {
                _id: 'user123',
                username: 'testuser',
                progress: [
                    { correct: true },
                    { correct: true },
                    { correct: false }
                ]
            };
            user_model_1.User.findById.mockResolvedValueOnce(mockUser);
            yield (0, user_controllers_1.getCurrentUser)(mockRequest, mockResponse);
            expect(mockResponse.json).toHaveBeenCalledWith({
                user: mockUser,
                correctScore: 2,
                incorrectScore: 1
            });
        }));
        it('should handle database errors', () => __awaiter(void 0, void 0, void 0, function* () {
            user_model_1.User.findById.mockRejectedValueOnce(new Error('DB Error'));
            yield (0, user_controllers_1.getCurrentUser)(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Failed to get any user' });
        }));
    });
    describe('getUserById', () => {
        beforeEach(() => {
            mockRequest = {
                params: { id: 'user123' }
            };
        });
        it('should return 401 if userId is missing', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.params = {};
            yield (0, user_controllers_1.getUserById)(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Not authenticated' });
        }));
        it('should return 404 if user is not found', () => __awaiter(void 0, void 0, void 0, function* () {
            user_model_1.User.findById.mockResolvedValueOnce(null);
            yield (0, user_controllers_1.getUserById)(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'User not found' });
        }));
        it('should return user with correct and incorrect scores', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockUser = {
                _id: 'user123',
                username: 'testuser',
                progress: [
                    { correct: true },
                    { correct: false },
                    { correct: true }
                ]
            };
            user_model_1.User.findById.mockResolvedValueOnce(mockUser);
            yield (0, user_controllers_1.getUserById)(mockRequest, mockResponse);
            expect(mockResponse.json).toHaveBeenCalledWith({
                user: mockUser,
                correctScore: 2,
                incorrectScore: 1
            });
        }));
        it('should handle database errors', () => __awaiter(void 0, void 0, void 0, function* () {
            user_model_1.User.findById.mockRejectedValueOnce(new Error('DB Error'));
            yield (0, user_controllers_1.getUserById)(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Failed to get any user' });
        }));
    });
});
