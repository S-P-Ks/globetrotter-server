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
const share_image_route_1 = __importDefault(require("../../src/routes/share-image.route"));
const canvas_1 = require("canvas");
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
    let app;
    beforeAll(() => {
        app = (0, express_1.default)();
        app.use('/api/share-image', share_image_route_1.default);
    });
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('GET /', () => {
        it('should generate image with default values', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/api/share-image');
            expect(response.status).toBe(200);
            expect(response.headers['content-type']).toBe('image/png');
            expect(response.headers['cache-control']).toBe('public, max-age=31536000, immutable');
            expect(response.body).toBeInstanceOf(Buffer);
        }));
        it('should generate image with provided parameters', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/api/share-image')
                .query({
                username: 'TestPlayer',
                correct: '5',
                incorrect: '3'
            });
            expect(response.status).toBe(200);
            expect(response.headers['content-type']).toBe('image/png');
            expect(canvas_1.createCanvas).toHaveBeenCalledWith(600, 315);
        }));
        it('should handle invalid number inputs', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/api/share-image')
                .query({
                username: 'TestPlayer',
                correct: 'invalid',
                incorrect: 'invalid'
            });
            expect(response.status).toBe(200);
            expect(response.headers['content-type']).toBe('image/png');
        }));
        it('should handle special characters in username', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/api/share-image')
                .query({
                username: 'Test@Player#123',
                correct: '5',
                incorrect: '3'
            });
            expect(response.status).toBe(200);
            expect(response.headers['content-type']).toBe('image/png');
        }));
        it('should handle missing parameters', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/api/share-image')
                .query({});
            expect(response.status).toBe(200);
            expect(response.headers['content-type']).toBe('image/png');
        }));
        it('should handle large numbers', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/api/share-image')
                .query({
                username: 'TestPlayer',
                correct: '999999',
                incorrect: '999999'
            });
            expect(response.status).toBe(200);
            expect(response.headers['content-type']).toBe('image/png');
        }));
        it('should handle error in image generation', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock canvas to throw error
            canvas_1.createCanvas.mockImplementationOnce(() => {
                throw new Error('Canvas error');
            });
            const response = yield (0, supertest_1.default)(app)
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
        }));
        it('should set correct cache headers', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/api/share-image');
            expect(response.headers['cache-control']).toBe('public, max-age=31536000, immutable');
        }));
    });
});
