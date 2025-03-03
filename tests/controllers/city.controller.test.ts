import { Request, Response } from 'express';
import { getRandomCity, validate } from '../../src/controllers/city.controllers';
import { City } from '../../src/models/city.model';
import { User } from '../../src/models/user.model';

// Mock the models
jest.mock('../../src/models/city.model');
jest.mock('../../src/models/user.model');

describe('City Controllers', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;

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

        it('should return 403 when user is not logged in', async () => {
            // Setup request without userId
            mockRequest.cookies = {};

            await getRandomCity(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: "User should loggedin"
            });
        });

        it('should return 403 when user is not found', async () => {
            // Mock User.findById to return null
            (User.findById as jest.Mock).mockResolvedValueOnce(null);

            await getRandomCity(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: "User does not exists"
            });
        });

        it('should handle database errors', async () => {
            const error = new Error('Database error');
            (User.findById as jest.Mock).mockRejectedValueOnce(error);

            await getRandomCity(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: "Failed to get random city",
                error: "Database error",
                success: false
            });
        });
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

        it('should return 403 when user is not logged in', async () => {
            mockRequest.cookies = {};

            await validate(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: "User should loggedin"
            });
        });

        it('should return 404 when city is not found', async () => {
            (City.findById as jest.Mock).mockResolvedValueOnce(null);
            (User.findById as jest.Mock).mockResolvedValueOnce({});

            await validate(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: "City or user not found"
            });
        });

        it('should return 404 when user is not found', async () => {
            (City.findById as jest.Mock).mockResolvedValueOnce({});
            (User.findById as jest.Mock).mockResolvedValueOnce(null);

            await validate(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: "City or user not found"
            });
        });

        it('should correctly validate a correct guess', async () => {
            const mockCity = {
                _id: 'test-city-id',
                city: 'Test City'
            };
            const mockUser = {
                updateCityProgress: jest.fn().mockResolvedValueOnce(undefined)
            };

            (City.findById as jest.Mock).mockResolvedValueOnce(mockCity);
            (User.findById as jest.Mock).mockResolvedValueOnce(mockUser);

            await validate(mockRequest as Request, mockResponse as Response);

            expect(mockUser.updateCityProgress).toHaveBeenCalledWith('test-city-id', true);
            expect(mockResponse.json).toHaveBeenCalledWith({
                correct: true,
                actualCity: 'Test City'
            });
        });

        it('should correctly validate an incorrect guess', async () => {
            const mockCity = {
                _id: 'test-city-id',
                city: 'Correct City'
            };
            const mockUser = {
                updateCityProgress: jest.fn().mockResolvedValueOnce(undefined)
            };

            mockRequest.body.guess = 'Wrong City';
            (City.findById as jest.Mock).mockResolvedValueOnce(mockCity);
            (User.findById as jest.Mock).mockResolvedValueOnce(mockUser);

            await validate(mockRequest as Request, mockResponse as Response);

            expect(mockUser.updateCityProgress).toHaveBeenCalledWith('test-city-id', false);
            expect(mockResponse.json).toHaveBeenCalledWith({
                correct: false,
                actualCity: 'Correct City'
            });
        });

        it('should handle case-insensitive validation', async () => {
            const mockCity = {
                _id: 'test-city-id',
                city: 'Test City'
            };
            const mockUser = {
                updateCityProgress: jest.fn().mockResolvedValueOnce(undefined)
            };

            mockRequest.body.guess = 'test CITY';
            (City.findById as jest.Mock).mockResolvedValueOnce(mockCity);
            (User.findById as jest.Mock).mockResolvedValueOnce(mockUser);

            await validate(mockRequest as Request, mockResponse as Response);

            expect(mockUser.updateCityProgress).toHaveBeenCalledWith('test-city-id', true);
            expect(mockResponse.json).toHaveBeenCalledWith({
                correct: true,
                actualCity: 'Test City'
            });
        });

        it('should handle database errors', async () => {
            const error = new Error('Database error');
            (City.findById as jest.Mock).mockRejectedValueOnce(error);

            await validate(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: "Failed to validate",
                error: "Database error",
                success: false
            });
        });
    });
});