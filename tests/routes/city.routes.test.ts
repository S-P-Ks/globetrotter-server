import request from 'supertest';
import express, { Express } from 'express';
import cookieParser from 'cookie-parser';
import cityRoutes from '../../src/routes/city.routes';
import { City } from '../../src/models/city.model';
import { User } from '../../src/models/user.model';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

describe('City Routes', () => {
    let app: Express;
    let mongoServer: MongoMemoryServer;
    let testUser: any;
    let testCity: any;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        await mongoose.connect(mongoServer.getUri());

        app = express();
        app.use(express.json());
        app.use(cookieParser());
        app.use('/api/cities', cityRoutes);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    beforeEach(async () => {
        await City.deleteMany({});
        await User.deleteMany({});

        // Create test user
        testUser = await User.create({
            username: 'testuser',
            progress: []
        });

        // Create test city
        testCity = await City.create({
            city: 'Test City',
            country: 'Test Country',
            clues: ['Clue 1', 'Clue 2'],
            fun_fact: ['Fact 1'],
            trivia: ['Trivia 1']
        });
    });

    describe('GET /randomCity', () => {
        it('should return 403 when user is not logged in', async () => {
            const response = await request(app)
                .get('/api/cities/randomCity');

            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty('message', 'User should loggedin');
        });

        it('should not return previously answered cities', async () => {
            // Update user progress with answered city
            await User.findByIdAndUpdate(testUser._id, {
                progress: [{ city: testCity._id, correct: true }]
            });

            // Create another city for testing
            const anotherCity = await City.create({
                city: 'Another City',
                country: 'Another Country',
                clues: ['Clue A', 'Clue B'],
                fun_fact: ['Fact A'],
                trivia: ['Trivia A']
            });

            const response = await request(app)
                .get('/api/cities/randomCity')
                .set('Cookie', [`userId=${testUser._id}`]);

            expect(response.status).toBe(200);
            expect(response.body.data._id).not.toBe(testCity._id.toString());
        });

        it('should return empty data when all cities are answered', async () => {
            // Mark the only test city as answered
            await User.findByIdAndUpdate(testUser._id, {
                progress: [{ city: testCity._id, correct: true }]
            });

            const response = await request(app)
                .get('/api/cities/randomCity')
                .set('Cookie', [`userId=${testUser._id}`]);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                data: {},
                options: []
            });
        });
    });

    describe('POST /validate', () => {
        it('should return 403 when user is not logged in', async () => {
            const response = await request(app)
                .post('/api/cities/validate')
                .send({
                    cityId: testCity._id,
                    guess: 'Test City'
                });

            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty('message', 'User should loggedin');
        });

        it('should validate correct guess', async () => {
            const response = await request(app)
                .post('/api/cities/validate')
                .set('Cookie', [`userId=${testUser._id}`])
                .send({
                    cityId: testCity._id,
                    guess: 'Test City'
                });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                correct: true,
                actualCity: 'Test City'
            });

            // Verify user progress was updated
            const updatedUser = await User.findById(testUser._id);
            expect(updatedUser?.progress).toHaveLength(1);
            expect(updatedUser?.progress[0].correct).toBe(true);
        });

        it('should validate incorrect guess', async () => {
            const response = await request(app)
                .post('/api/cities/validate')
                .set('Cookie', [`userId=${testUser._id}`])
                .send({
                    cityId: testCity._id,
                    guess: 'Wrong City'
                });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                correct: false,
                actualCity: 'Test City'
            });

            // Verify user progress was updated
            const updatedUser = await User.findById(testUser._id);
            expect(updatedUser?.progress).toHaveLength(1);
            expect(updatedUser?.progress[0].correct).toBe(false);
        });

        it('should handle case-insensitive validation', async () => {
            const response = await request(app)
                .post('/api/cities/validate')
                .set('Cookie', [`userId=${testUser._id}`])
                .send({
                    cityId: testCity._id,
                    guess: 'test CITY'
                });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                correct: true,
                actualCity: 'Test City'
            });
        });

        it('should return 404 for non-existent city', async () => {
            const response = await request(app)
                .post('/api/cities/validate')
                .set('Cookie', [`userId=${testUser._id}`])
                .send({
                    cityId: new mongoose.Types.ObjectId(),
                    guess: 'Test City'
                });

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('message', 'City or user not found');
        });
    });
});
