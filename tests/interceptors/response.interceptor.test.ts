import { Request, Response, NextFunction } from 'express';
import { enhancedInterceptor } from '../../src/interceptors/response.interceptor';

describe('Response Interceptor', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.useFakeTimers();
        consoleSpy = jest.spyOn(console, 'log').mockImplementation();

        mockRequest = {
            method: 'GET',
            originalUrl: '/test',
            headers: {
                'user-agent': 'test-agent',
                'x-request-id': 'test-request-id'
            }
        };

        mockResponse = {
            statusCode: 200,
            send: jest.fn().mockReturnThis(),
        };

        mockNext = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.useRealTimers();
    });

    it('should enhance response with sendResponse method', () => {
        enhancedInterceptor(
            mockRequest as Request,
            mockResponse as any,
            mockNext
        );

        expect(mockResponse).toHaveProperty('sendResponse');
        expect(mockResponse).toHaveProperty('startTime');
        expect(mockResponse).toHaveProperty('originalSend');
        expect(mockNext).toHaveBeenCalled();
    });

    it('should format successful response correctly', () => {
        const testData = { message: 'success' };
        enhancedInterceptor(
            mockRequest as Request,
            mockResponse as any,
            mockNext
        );

        (mockResponse as any).send(testData);

        expect((mockResponse as any).originalSend).toHaveBeenCalledWith({
            success: true,
            data: testData,
            error: undefined,
            meta: expect.objectContaining({
                timestamp: expect.any(String),
                duration: expect.any(Number),
                requestId: 'test-request-id'
            })
        });
    });

    it('should format error response correctly', () => {
        mockResponse.statusCode = 400;
        const errorData = { message: 'Bad Request' };

        enhancedInterceptor(
            mockRequest as Request,
            mockResponse as any,
            mockNext
        );

        (mockResponse as any).send(errorData);

        expect((mockResponse as any).originalSend).toHaveBeenCalledWith({
            success: false,
            data: undefined,
            error: {
                code: 400,
                message: 'Bad Request'
            },
            meta: expect.objectContaining({
                timestamp: expect.any(String),
                duration: expect.any(Number),
                requestId: 'test-request-id'
            })
        });
    });

    it('should include stack trace in development environment', () => {
        process.env.NODE_ENV = 'development';
        mockResponse.statusCode = 500;
        const errorData = {
            message: 'Server Error',
            stack: 'Error stack trace'
        };

        enhancedInterceptor(
            mockRequest as Request,
            mockResponse as any,
            mockNext
        );

        (mockResponse as any).send(errorData);

        expect((mockResponse as any).originalSend).toHaveBeenCalledWith(
            expect.objectContaining({
                error: expect.objectContaining({
                    stack: 'Error stack trace'
                })
            })
        );

        process.env.NODE_ENV = 'test';
    });

    it('should log response details', () => {
        enhancedInterceptor(
            mockRequest as Request,
            mockResponse as any,
            mockNext
        );

        jest.advanceTimersByTime(100); // Simulate 100ms response time
        (mockResponse as any).send({ message: 'test' });

        expect(consoleSpy).toHaveBeenCalledWith({
            method: 'GET',
            path: '/test',
            status: 200,
            responseTime: '100ms',
            userAgent: 'test-agent'
        });
    });

    it('should handle missing request headers', () => {
        mockRequest.headers = {};

        enhancedInterceptor(
            mockRequest as Request,
            mockResponse as any,
            mockNext
        );

        (mockResponse as any).send({ message: 'test' });

        expect((mockResponse as any).originalSend).toHaveBeenCalledWith(
            expect.objectContaining({
                meta: expect.objectContaining({
                    requestId: undefined
                })
            })
        );
    });

    it('should handle undefined response body', () => {
        enhancedInterceptor(
            mockRequest as Request,
            mockResponse as any,
            mockNext
        );

        (mockResponse as any).send();

        expect((mockResponse as any).originalSend).toHaveBeenCalledWith(
            expect.objectContaining({
                data: undefined
            })
        );
    });
});
