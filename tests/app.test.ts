import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import cityRoutes from '../src/routes/city.routes';
import userRoutes from '../src/routes/user.routes';
import shareImageRoutes from '../src/routes/share-image.route';

describe('App Configuration', () => {
    let app: express.Application;
    let mongoServer: MongoMemoryServer;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        process.env.CLIENT_BASE_URL = 'http://localhost:3000';

        // Create a fresh app instance for testing
        app = express();

        // Configure middleware
        app.use(cors({
            origin: process.env.CLIENT_BASE_URL,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
            exposedHeaders: ['Content-Length', 'X-Custom-Header'],
            credentials: true
        }));
        app.use(express.json());
        app.use(express.urlencoded({ extended: false }));
        app.use(cookieParser());

        // Configure routes
        app.use('/city', cityRoutes);
        app.use('/user', userRoutes);
        app.use('/share-image', shareImageRoutes);

        // Connect to in-memory database
        await mongoose.connect(mongoServer.getUri());
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    describe('Basic Configuration', () => {
        it('should have JSON parsing middleware', async () => {
            const response = await request(app)
                .post('/user')
                .send({ test: 'data' })
                .set('Content-Type', 'application/json');

            expect(response.status).not.toBe(415); // Should not return unsupported media type
        });

        it('should have URL-encoded parsing middleware', async () => {
            const response = await request(app)
                .post('/user')
                .send('test=data')
                .set('Content-Type', 'application/x-www-form-urlencoded');

            expect(response.status).not.toBe(415);
        });
    });

    describe('CORS Configuration', () => {
        it('should allow requests from configured origin', async () => {
            const response = await request(app)
                .get('/')

            expect(response.headers['access-control-allow-origin']).toBe(process.env.CLIENT_BASE_URL);
        });

        it('should include correct CORS headers', async () => {
            const response = await request(app)
                .options('/')
                .set('Access-Control-Request-Method', 'POST');

            expect(response.headers['access-control-allow-credentials']).toBe('true');
            expect(response.headers['access-control-allow-methods']).toContain('POST');
            expect(response.headers['access-control-allow-headers']).toContain('Content-Type');
            expect(response.headers['access-control-allow-headers']).toContain('Authorization');
        });

        it('should handle preflight requests', async () => {
            const response = await request(app)
                .options('/')
                .set('Access-Control-Request-Method', 'POST');

            expect(response.status).toBe(204);
        });
    });

    describe('Routes Configuration', () => {
        it('should mount share-image routes', async () => {
            const response = await request(app).get('/share-image');
            expect(response.status).not.toBe(404);
        });

        it('should return 404 for non-existent routes', async () => {
            const response = await request(app).get('/non-existent-route');
            expect(response.status).toBe(404);
        });
    });

    describe('Database Connection', () => {
        it('should connect to database successfully', () => {
            expect(mongoose.connection.readyState).toBe(1); // 1 = connected
        });

        it('should handle database operations', async () => {
            const TestModel = mongoose.model('Test', new mongoose.Schema({ name: String }));
            const testDoc = new TestModel({ name: 'test' });
            await testDoc.save();

            const found = await TestModel.findOne({ name: 'test' });
            expect(found?.name).toBe('test');
        });
    });

    describe('Error Handling', () => {
        it('should handle invalid JSON', async () => {
            const response = await request(app)
                .post('/user')
                .set('Content-Type', 'application/json')
                .send('{"invalid": json}');

            expect(response.status).toBe(400);
        });
    });
});
