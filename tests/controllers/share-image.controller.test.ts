import { Request, Response } from 'express';
import { shareImage } from '../../src/controllers/share-image.controllers';
import { createCanvas } from 'canvas';

// Mock canvas module
jest.mock('canvas', () => ({
    createCanvas: jest.fn(() => ({
        getContext: jest.fn(() => ({
            fillStyle: '',
            fillRect: jest.fn(),
            strokeStyle: '',
            lineWidth: 0,
            strokeRect: jest.fn(),
            font: '',
            textAlign: '',
            fillText: jest.fn()
        })),
        toBuffer: jest.fn(() => Buffer.from('mock-image'))
    }))
}));

describe('Share Image Controller', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockResponse = {
            set: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
    });

    it('should generate image with default values', async () => {
        mockRequest = {
            query: {}
        };

        await shareImage(mockRequest as Request, mockResponse as Response);

        expect(createCanvas).toHaveBeenCalledWith(600, 315);
        expect(mockResponse.set).toHaveBeenCalledWith({
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=31536000, immutable'
        });
        expect(mockResponse.send).toHaveBeenCalled();
    });

    it('should generate image with provided values', async () => {
        mockRequest = {
            query: {
                username: 'TestUser',
                correct: '5',
                incorrect: '3'
            }
        };

        await shareImage(mockRequest as Request, mockResponse as Response);

        expect(createCanvas).toHaveBeenCalledWith(600, 315);
        expect(mockResponse.set).toHaveBeenCalledWith({
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=31536000, immutable'
        });
        expect(mockResponse.send).toHaveBeenCalled();
    });

    it('should handle invalid number inputs', async () => {
        mockRequest = {
            query: {
                username: 'TestUser',
                correct: 'invalid',
                incorrect: 'invalid'
            }
        };

        await shareImage(mockRequest as Request, mockResponse as Response);

        expect(createCanvas).toHaveBeenCalledWith(600, 315);
        expect(mockResponse.send).toHaveBeenCalled();
    });

    it('should handle errors', async () => {
        mockRequest = {
            query: {}
        };

        const error = new Error('Canvas error');
        (createCanvas as jest.Mock).mockImplementationOnce(() => {
            throw error;
        });

        await shareImage(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
            error: 'Failed to generate share image'
        });
    });
});
