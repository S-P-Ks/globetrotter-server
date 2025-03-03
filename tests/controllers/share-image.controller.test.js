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
const share_image_controllers_1 = require("../../src/controllers/share-image.controllers");
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
describe('Share Image Controller', () => {
    let mockRequest;
    let mockResponse;
    beforeEach(() => {
        jest.clearAllMocks();
        mockResponse = {
            set: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
    });
    it('should generate image with default values', () => __awaiter(void 0, void 0, void 0, function* () {
        mockRequest = {
            query: {}
        };
        yield (0, share_image_controllers_1.shareImage)(mockRequest, mockResponse);
        expect(canvas_1.createCanvas).toHaveBeenCalledWith(600, 315);
        expect(mockResponse.set).toHaveBeenCalledWith({
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=31536000, immutable'
        });
        expect(mockResponse.send).toHaveBeenCalled();
    }));
    it('should generate image with provided values', () => __awaiter(void 0, void 0, void 0, function* () {
        mockRequest = {
            query: {
                username: 'TestUser',
                correct: '5',
                incorrect: '3'
            }
        };
        yield (0, share_image_controllers_1.shareImage)(mockRequest, mockResponse);
        expect(canvas_1.createCanvas).toHaveBeenCalledWith(600, 315);
        expect(mockResponse.set).toHaveBeenCalledWith({
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=31536000, immutable'
        });
        expect(mockResponse.send).toHaveBeenCalled();
    }));
    it('should handle invalid number inputs', () => __awaiter(void 0, void 0, void 0, function* () {
        mockRequest = {
            query: {
                username: 'TestUser',
                correct: 'invalid',
                incorrect: 'invalid'
            }
        };
        yield (0, share_image_controllers_1.shareImage)(mockRequest, mockResponse);
        expect(canvas_1.createCanvas).toHaveBeenCalledWith(600, 315);
        expect(mockResponse.send).toHaveBeenCalled();
    }));
    it('should handle errors', () => __awaiter(void 0, void 0, void 0, function* () {
        mockRequest = {
            query: {}
        };
        const error = new Error('Canvas error');
        canvas_1.createCanvas.mockImplementationOnce(() => {
            throw error;
        });
        yield (0, share_image_controllers_1.shareImage)(mockRequest, mockResponse);
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
            error: 'Failed to generate share image'
        });
    }));
});
