import request from 'supertest';
import express, { Express } from 'express';
import userRoutes from '../../src/routes/user.routes';
import { User } from '../../src/models/user.model';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import cookieParser from 'cookie-parser';

describe('User Routes', () => {
    let app: Express;
    let mongoServer: MongoMemoryServer;
    let testUser: any;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        await mongoose.connect(mongoServer.getUri());

        app = express();
        app.use(express.json());
        app.use(cookieParser());
        app.use('/api/users', userRoutes);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    beforeEach(async () => {
        await User.deleteMany({});
        testUser = await User.create({
            username: 'testuser',
            progress: []
        });
    });

    describe('POST /', () => {

        it('should return existing user if username exists', async () => {
            const response = await request(app)
                .post('/api/users')
                .send({ username: 'testuser' });

            expect(response.status).toBe(201);
            expect(response.body.userId).toBe(testUser._id.toString());
        });

        it('should return 400 if username is missing', async () => {
            const response = await request(app)
                .post('/api/users')
                .send({});

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Username is required');
        });

        it('should return 400 if username is empty', async () => {
            const response = await request(app)
                .post('/api/users')
                .send({ username: '' });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Username is required');
        });
    });

    describe('GET /me', () => {
        it('should return current user', async () => {
            const response = await request(app)
                .get('/api/users/me')
                .set('Cookie', [`userId=${testUser._id}`]);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('user');
            expect(response.body.user.username).toBe('testuser');
            expect(response.body).toHaveProperty('correctScore');
            expect(response.body).toHaveProperty('incorrectScore');
        });

        it('should return 404 if user not found', async () => {
            const response = await request(app)
                .get('/api/users/me')
                .set('Cookie', [`userId=${new mongoose.Types.ObjectId()}`]);

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'User not found');
        });

        it('should return correct progress scores', async () => {
            // Update user with some progress
            await User.findByIdAndUpdate(testUser._id, {
                progress: [
                    { city: new mongoose.Types.ObjectId(), correct: true },
                    { city: new mongoose.Types.ObjectId(), correct: false },
                    { city: new mongoose.Types.ObjectId(), correct: true }
                ]
            });

            const response = await request(app)
                .get('/api/users/me')
                .set('Cookie', [`userId=${testUser._id}`]);

            expect(response.body.correctScore).toBe(2);
            expect(response.body.incorrectScore).toBe(1);
        });
    });

    describe('GET /:id', () => {
        it('should return user by id', async () => {
            const response = await request(app)
                .get(`/api/users/${testUser._id}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('user');
            expect(response.body.user.username).toBe('testuser');
            expect(response.body).toHaveProperty('correctScore');
            expect(response.body).toHaveProperty('incorrectScore');
        });

        it('should return 404 if user not found', async () => {
            const response = await request(app)
                .get(`/api/users/${new mongoose.Types.ObjectId()}`);

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'User not found');
        });

        it('should return 401 if id is invalid', async () => {
            const response = await request(app)
                .get('/api/users/invalid-id');

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'Not authenticated');
        });

        it('should return correct progress scores', async () => {
            // Update user with some progress
            await User.findByIdAndUpdate(testUser._id, {
                progress: [
                    { city: new mongoose.Types.ObjectId(), correct: true },
                    { city: new mongoose.Types.ObjectId(), correct: false }
                ]
            });

            const response = await request(app)
                .get(`/api/users/${testUser._id}`);

            expect(response.body.correctScore).toBe(1);
            expect(response.body.incorrectScore).toBe(1);
        });
    });

    describe('Error Handling', () => {
        it('should handle database errors gracefully', async () => {
            // Force a database error
            jest.spyOn(User, 'findById').mockRejectedValueOnce(new Error('Database error'));

            const response = await request(app)
                .get('/api/users/me')
                .set('Cookie', [`userId=${testUser._id}`]);

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to get any user');
        });
    });
}); 