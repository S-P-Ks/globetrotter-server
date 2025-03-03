import request from 'supertest';
import express, { Express } from 'express';
import shareImageRoutes from '../../src/routes/share-image.route';
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

describe('Share Image Routes', () => {
    let app: Express;

    beforeAll(() => {
        app = express();
        app.use('/api/share-image', shareImageRoutes);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /', () => {
        it('should generate image with default values', async () => {
            const response = await request(app)
                .get('/api/share-image');

            expect(response.status).toBe(200);
            expect(response.headers['content-type']).toBe('image/png');
            expect(response.headers['cache-control']).toBe('public, max-age=31536000, immutable');
            expect(response.body).toBeInstanceOf(Buffer);
        });

        it('should generate image with provided parameters', async () => {
            const response = await request(app)
                .get('/api/share-image')
                .query({
                    username: 'TestPlayer',
                    correct: '5',
                    incorrect: '3'
                });

            expect(response.status).toBe(200);
            expect(response.headers['content-type']).toBe('image/png');
            expect(createCanvas).toHaveBeenCalledWith(600, 315);
        });

        it('should handle invalid number inputs', async () => {
            const response = await request(app)
                .get('/api/share-image')
                .query({
                    username: 'TestPlayer',
                    correct: 'invalid',
                    incorrect: 'invalid'
                });

            expect(response.status).toBe(200);
            expect(response.headers['content-type']).toBe('image/png');
        });

        it('should handle special characters in username', async () => {
            const response = await request(app)
                .get('/api/share-image')
                .query({
                    username: 'Test@Player#123',
                    correct: '5',
                    incorrect: '3'
                });

            expect(response.status).toBe(200);
            expect(response.headers['content-type']).toBe('image/png');
        });

        it('should handle missing parameters', async () => {
            const response = await request(app)
                .get('/api/share-image')
                .query({});

            expect(response.status).toBe(200);
            expect(response.headers['content-type']).toBe('image/png');
        });

        it('should handle large numbers', async () => {
            const response = await request(app)
                .get('/api/share-image')
                .query({
                    username: 'TestPlayer',
                    correct: '999999',
                    incorrect: '999999'
                });

            expect(response.status).toBe(200);
            expect(response.headers['content-type']).toBe('image/png');
        });

        it('should handle error in image generation', async () => {
            // Mock canvas to throw error
            (createCanvas as jest.Mock).mockImplementationOnce(() => {
                throw new Error('Canvas error');
            });

            const response = await request(app)
                .get('/api/share-image')
                .query({
                    username: 'TestPlayer',
                    correct: '5',
                    incorrect: '3'
                });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({
                error: 'Failed to generate share image'
            });
        });

        it('should set correct cache headers', async () => {
            const response = await request(app)
                .get('/api/share-image');

            expect(response.headers['cache-control']).toBe('public, max-age=31536000, immutable');
        });
    });
});
