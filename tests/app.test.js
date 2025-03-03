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
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const city_routes_1 = __importDefault(require("../src/routes/city.routes"));
const user_routes_1 = __importDefault(require("../src/routes/user.routes"));
const share_image_route_1 = __importDefault(require("../src/routes/share-image.route"));
describe('App Configuration', () => {
    let app;
    let mongoServer;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        mongoServer = yield mongodb_memory_server_1.MongoMemoryServer.create();
        process.env.CLIENT_BASE_URL = 'http://localhost:3000';
        // Create a fresh app instance for testing
        app = (0, express_1.default)();
        // Configure middleware
        app.use((0, cors_1.default)({
            origin: process.env.CLIENT_BASE_URL,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
            exposedHeaders: ['Content-Length', 'X-Custom-Header'],
            credentials: true
        }));
        app.use(express_1.default.json());
        app.use(express_1.default.urlencoded({ extended: false }));
        app.use((0, cookie_parser_1.default)());
        // Configure routes
        app.use('/city', city_routes_1.default);
        app.use('/user', user_routes_1.default);
        app.use('/share-image', share_image_route_1.default);
        // Connect to in-memory database
        yield mongoose_1.default.connect(mongoServer.getUri());
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield mongoose_1.default.disconnect();
        yield mongoServer.stop();
    }));
    describe('Basic Configuration', () => {
        it('should have JSON parsing middleware', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post('/user')
                .send({ test: 'data' })
                .set('Content-Type', 'application/json');
            expect(response.status).not.toBe(415); // Should not return unsupported media type
        }));
        it('should have URL-encoded parsing middleware', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post('/user')
                .send('test=data')
                .set('Content-Type', 'application/x-www-form-urlencoded');
            expect(response.status).not.toBe(415);
        }));
    });
    describe('CORS Configuration', () => {
        it('should allow requests from configured origin', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/');
            expect(response.headers['access-control-allow-origin']).toBe(process.env.CLIENT_BASE_URL);
        }));
        it('should include correct CORS headers', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .options('/')
                .set('Access-Control-Request-Method', 'POST');
            expect(response.headers['access-control-allow-credentials']).toBe('true');
            expect(response.headers['access-control-allow-methods']).toContain('POST');
            expect(response.headers['access-control-allow-headers']).toContain('Content-Type');
            expect(response.headers['access-control-allow-headers']).toContain('Authorization');
        }));
        it('should handle preflight requests', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .options('/')
                .set('Access-Control-Request-Method', 'POST');
            expect(response.status).toBe(204);
        }));
    });
    describe('Routes Configuration', () => {
        it('should mount share-image routes', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app).get('/share-image');
            expect(response.status).not.toBe(404);
        }));
        it('should return 404 for non-existent routes', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app).get('/non-existent-route');
            expect(response.status).toBe(404);
        }));
    });
    describe('Database Connection', () => {
        it('should connect to database successfully', () => {
            expect(mongoose_1.default.connection.readyState).toBe(1); // 1 = connected
        });
        it('should handle database operations', () => __awaiter(void 0, void 0, void 0, function* () {
            const TestModel = mongoose_1.default.model('Test', new mongoose_1.default.Schema({ name: String }));
            const testDoc = new TestModel({ name: 'test' });
            yield testDoc.save();
            const found = yield TestModel.findOne({ name: 'test' });
            expect(found === null || found === void 0 ? void 0 : found.name).toBe('test');
        }));
    });
    describe('Error Handling', () => {
        it('should handle invalid JSON', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post('/user')
                .set('Content-Type', 'application/json')
                .send('{"invalid": json}');
            expect(response.status).toBe(400);
        }));
    });
});
