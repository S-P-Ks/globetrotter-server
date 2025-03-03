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
const city_controllers_1 = require("../../src/controllers/city.controllers");
const city_model_1 = require("../../src/models/city.model");
const user_model_1 = require("../../src/models/user.model");
// Mock the models
jest.mock('../../src/models/city.model');
jest.mock('../../src/models/user.model');
describe('City Controllers', () => {
    let mockRequest;
    let mockResponse;
    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();
        // Setup response mock
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
    });
    describe('getRandomCity', () => {
        beforeEach(() => {
            // Setup default request mock with authenticated user
            mockRequest = {
                cookies: {
                    userId: 'test-user-id'
                }
            };
        });
        it('should return 403 when user is not logged in', () => __awaiter(void 0, void 0, void 0, function* () {
            // Setup request without userId
            mockRequest.cookies = {};
            yield (0, city_controllers_1.getRandomCity)(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: "User should loggedin"
            });
        }));
        it('should return 403 when user is not found', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock User.findById to return null
            user_model_1.User.findById.mockResolvedValueOnce(null);
            yield (0, city_controllers_1.getRandomCity)(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: "User does not exists"
            });
        }));
        it('should handle database errors', () => __awaiter(void 0, void 0, void 0, function* () {
            const error = new Error('Database error');
            user_model_1.User.findById.mockRejectedValueOnce(error);
            yield (0, city_controllers_1.getRandomCity)(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: "Failed to get random city",
                error: "Database error",
                success: false
            });
        }));
    });
    describe('validate', () => {
        beforeEach(() => {
            // Setup default request mock
            mockRequest = {
                cookies: {
                    userId: 'test-user-id'
                },
                body: {
                    cityId: 'test-city-id',
                    guess: 'Test City'
                }
            };
        });
        it('should return 403 when user is not logged in', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.cookies = {};
            yield (0, city_controllers_1.validate)(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: "User should loggedin"
            });
        }));
        it('should return 404 when city is not found', () => __awaiter(void 0, void 0, void 0, function* () {
            city_model_1.City.findById.mockResolvedValueOnce(null);
            user_model_1.User.findById.mockResolvedValueOnce({});
            yield (0, city_controllers_1.validate)(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: "City or user not found"
            });
        }));
        it('should return 404 when user is not found', () => __awaiter(void 0, void 0, void 0, function* () {
            city_model_1.City.findById.mockResolvedValueOnce({});
            user_model_1.User.findById.mockResolvedValueOnce(null);
            yield (0, city_controllers_1.validate)(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: "City or user not found"
            });
        }));
        it('should correctly validate a correct guess', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockCity = {
                _id: 'test-city-id',
                city: 'Test City'
            };
            const mockUser = {
                updateCityProgress: jest.fn().mockResolvedValueOnce(undefined)
            };
            city_model_1.City.findById.mockResolvedValueOnce(mockCity);
            user_model_1.User.findById.mockResolvedValueOnce(mockUser);
            yield (0, city_controllers_1.validate)(mockRequest, mockResponse);
            expect(mockUser.updateCityProgress).toHaveBeenCalledWith('test-city-id', true);
            expect(mockResponse.json).toHaveBeenCalledWith({
                correct: true,
                actualCity: 'Test City'
            });
        }));
        it('should correctly validate an incorrect guess', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockCity = {
                _id: 'test-city-id',
                city: 'Correct City'
            };
            const mockUser = {
                updateCityProgress: jest.fn().mockResolvedValueOnce(undefined)
            };
            mockRequest.body.guess = 'Wrong City';
            city_model_1.City.findById.mockResolvedValueOnce(mockCity);
            user_model_1.User.findById.mockResolvedValueOnce(mockUser);
            yield (0, city_controllers_1.validate)(mockRequest, mockResponse);
            expect(mockUser.updateCityProgress).toHaveBeenCalledWith('test-city-id', false);
            expect(mockResponse.json).toHaveBeenCalledWith({
                correct: false,
                actualCity: 'Correct City'
            });
        }));
        it('should handle case-insensitive validation', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockCity = {
                _id: 'test-city-id',
                city: 'Test City'
            };
            const mockUser = {
                updateCityProgress: jest.fn().mockResolvedValueOnce(undefined)
            };
            mockRequest.body.guess = 'test CITY';
            city_model_1.City.findById.mockResolvedValueOnce(mockCity);
            user_model_1.User.findById.mockResolvedValueOnce(mockUser);
            yield (0, city_controllers_1.validate)(mockRequest, mockResponse);
            expect(mockUser.updateCityProgress).toHaveBeenCalledWith('test-city-id', true);
            expect(mockResponse.json).toHaveBeenCalledWith({
                correct: true,
                actualCity: 'Test City'
            });
        }));
        it('should handle database errors', () => __awaiter(void 0, void 0, void 0, function* () {
            const error = new Error('Database error');
            city_model_1.City.findById.mockRejectedValueOnce(error);
            yield (0, city_controllers_1.validate)(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: "Failed to validate",
                error: "Database error",
                success: false
            });
        }));
    });
});
