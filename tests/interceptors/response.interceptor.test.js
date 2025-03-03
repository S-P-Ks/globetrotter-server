"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const response_interceptor_1 = require("../../src/interceptors/response.interceptor");
describe('Response Interceptor', () => {
    let mockRequest;
    let mockResponse;
    let mockNext;
    let consoleSpy;
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
        (0, response_interceptor_1.enhancedInterceptor)(mockRequest, mockResponse, mockNext);
        expect(mockResponse).toHaveProperty('sendResponse');
        expect(mockResponse).toHaveProperty('startTime');
        expect(mockResponse).toHaveProperty('originalSend');
        expect(mockNext).toHaveBeenCalled();
    });
    it('should format successful response correctly', () => {
        const testData = { message: 'success' };
        (0, response_interceptor_1.enhancedInterceptor)(mockRequest, mockResponse, mockNext);
        mockResponse.send(testData);
        expect(mockResponse.originalSend).toHaveBeenCalledWith({
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
        (0, response_interceptor_1.enhancedInterceptor)(mockRequest, mockResponse, mockNext);
        mockResponse.send(errorData);
        expect(mockResponse.originalSend).toHaveBeenCalledWith({
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
        (0, response_interceptor_1.enhancedInterceptor)(mockRequest, mockResponse, mockNext);
        mockResponse.send(errorData);
        expect(mockResponse.originalSend).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.objectContaining({
                stack: 'Error stack trace'
            })
        }));
        process.env.NODE_ENV = 'test';
    });
    it('should log response details', () => {
        (0, response_interceptor_1.enhancedInterceptor)(mockRequest, mockResponse, mockNext);
        jest.advanceTimersByTime(100); // Simulate 100ms response time
        mockResponse.send({ message: 'test' });
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
        (0, response_interceptor_1.enhancedInterceptor)(mockRequest, mockResponse, mockNext);
        mockResponse.send({ message: 'test' });
        expect(mockResponse.originalSend).toHaveBeenCalledWith(expect.objectContaining({
            meta: expect.objectContaining({
                requestId: undefined
            })
        }));
    });
    it('should handle undefined response body', () => {
        (0, response_interceptor_1.enhancedInterceptor)(mockRequest, mockResponse, mockNext);
        mockResponse.send();
        expect(mockResponse.originalSend).toHaveBeenCalledWith(expect.objectContaining({
            data: undefined
        }));
    });
});
