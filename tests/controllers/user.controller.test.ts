import { Request, Response } from 'express';
import { createUser, getCurrentUser, getUserById } from '../../src/controllers/user.controllers';
import { User } from '../../src/models/user.model';

jest.mock('../../src/models/user.model');

describe('User Controllers', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;

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

        it('should return 400 if username is missing', async () => {
            mockRequest.body = {};
            await createUser(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Username is required' });
        });

        it('should return 400 if username is empty', async () => {
            mockRequest.body = { username: '   ' };
            await createUser(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Username is required' });
        });

        it('should create new user if username does not exist', async () => {
            const mockUser = { _id: 'user123', username: 'testuser' };
            (User.findOne as jest.Mock).mockResolvedValueOnce(null);
            (User.create as jest.Mock).mockResolvedValueOnce(mockUser);

            await createUser(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.cookie).toHaveBeenCalledWith(
                'userId',
                'user123',
                expect.any(Object)
            );
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                userId: 'user123'
            });
        });

        it('should return existing user if username exists', async () => {
            const mockUser = { _id: 'user123', username: 'testuser' };
            (User.findOne as jest.Mock).mockResolvedValueOnce(mockUser);

            await createUser(mockRequest as Request, mockResponse as Response);

            expect(User.create).not.toHaveBeenCalled();
            expect(mockResponse.cookie).toHaveBeenCalledWith(
                'userId',
                'user123',
                expect.any(Object)
            );
            expect(mockResponse.status).toHaveBeenCalledWith(201);
        });

        it('should handle database errors', async () => {
            (User.findOne as jest.Mock).mockRejectedValueOnce(new Error('DB Error'));

            await createUser(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Failed to create user' });
        });
    });

    describe('getCurrentUser', () => {
        beforeEach(() => {
            mockRequest = {
                cookies: { userId: 'user123' }
            };
        });

        it('should return 401 if userId cookie is missing', async () => {
            mockRequest.cookies = {};
            await getCurrentUser(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Not authenticated' });
        });

        it('should return 404 if user is not found', async () => {
            (User.findById as jest.Mock).mockResolvedValueOnce(null);

            await getCurrentUser(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'User not found' });
        });

        it('should return user with correct and incorrect scores', async () => {
            const mockUser = {
                _id: 'user123',
                username: 'testuser',
                progress: [
                    { correct: true },
                    { correct: true },
                    { correct: false }
                ]
            };
            (User.findById as jest.Mock).mockResolvedValueOnce(mockUser);

            await getCurrentUser(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.json).toHaveBeenCalledWith({
                user: mockUser,
                correctScore: 2,
                incorrectScore: 1
            });
        });

        it('should handle database errors', async () => {
            (User.findById as jest.Mock).mockRejectedValueOnce(new Error('DB Error'));

            await getCurrentUser(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Failed to get any user' });
        });
    });

    describe('getUserById', () => {
        beforeEach(() => {
            mockRequest = {
                params: { id: 'user123' }
            };
        });

        it('should return 401 if userId is missing', async () => {
            mockRequest.params = {};
            await getUserById(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Not authenticated' });
        });

        it('should return 404 if user is not found', async () => {
            (User.findById as jest.Mock).mockResolvedValueOnce(null);

            await getUserById(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'User not found' });
        });

        it('should return user with correct and incorrect scores', async () => {
            const mockUser = {
                _id: 'user123',
                username: 'testuser',
                progress: [
                    { correct: true },
                    { correct: false },
                    { correct: true }
                ]
            };
            (User.findById as jest.Mock).mockResolvedValueOnce(mockUser);

            await getUserById(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.json).toHaveBeenCalledWith({
                user: mockUser,
                correctScore: 2,
                incorrectScore: 1
            });
        });

        it('should handle database errors', async () => {
            (User.findById as jest.Mock).mockRejectedValueOnce(new Error('DB Error'));

            await getUserById(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Failed to get any user' });
        });
    });
});
