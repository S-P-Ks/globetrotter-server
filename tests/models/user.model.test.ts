import mongoose, { Model } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User } from '../../src/models/user.model';
import { City } from '../../src/models/city.model';

export interface IUser extends Document {

}

interface UserModel extends Model<IUser> {
    resetProgress(userId: string): Promise<IUser | null>;  // Add return type
}

describe('User Model', () => {
    let mongoServer: MongoMemoryServer;
    let testCity: any;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    beforeEach(async () => {
        await User.deleteMany({});
        await City.deleteMany({});

        // Create a test city
        testCity = await City.create({
            city: 'Test City',
            country: 'Test Country',
            clues: ['Clue 1', 'Clue 2'],
            fun_fact: ['Fact 1'],
            trivia: ['Trivia 1']
        });
    });

    it('should create a user with valid data', async () => {
        const userData = {
            username: 'testuser',
            progress: [],
            totalScore: 0
        };

        const user = await User.create(userData);
        expect(user.username).toBe(userData.username);
        expect(user.progress).toHaveLength(0);
        expect(user.totalScore).toBe(0);
        expect(user.completedAllCities).toBe(false);
        expect(user.createdAt).toBeDefined();
    });

    it('should require username', async () => {
        const userData = {};
        await expect(User.create(userData)).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should enforce unique usernames', async () => {
        const userData = {
            username: 'testuser'
        };

        await User.create(userData);
        await expect(User.create(userData)).rejects.toThrow();
    });

    describe('updateCityProgress', () => {
        let user: any;

        beforeEach(async () => {
            user = await User.create({
                username: 'testuser',
                progress: []
            });
        });

        it('should add new progress when city is attempted first time', async () => {
            await user.updateCityProgress(testCity._id, true);

            expect(user.progress).toHaveLength(1);
            expect(user.progress[0].city.toString()).toBe(testCity._id.toString());
            expect(user.progress[0].correct).toBe(true);
        });

        it('should update existing progress when city is attempted again', async () => {
            // First attempt - incorrect
            await user.updateCityProgress(testCity._id, false);
            // Second attempt - correct
            await user.updateCityProgress(testCity._id, true);

            expect(user.progress).toHaveLength(1);
            expect(user.progress[0].correct).toBe(true);
        });

        it('should not change correct status if already correct', async () => {
            // First attempt - correct
            await user.updateCityProgress(testCity._id, true);
            // Second attempt - incorrect
            await user.updateCityProgress(testCity._id, false);

            expect(user.progress[0].correct).toBe(true);
        });
    });

    describe('completedCount virtual', () => {
        it('should return correct count of completed cities', async () => {
            const user = await User.create({
                username: 'testuser',
                progress: [
                    { city: new mongoose.Types.ObjectId(), correct: true },
                    { city: new mongoose.Types.ObjectId(), correct: false },
                    { city: new mongoose.Types.ObjectId(), correct: true }
                ]
            });

            expect(user.completedCount).toBe(2);
        });
    });

    describe('completedAllCities post save hook', () => {
        it('should update completedAllCities when all cities are completed', async () => {
            const user = await User.create({
                username: 'testuser',
                progress: [{ city: testCity._id, correct: true }]
            });

            expect(user.completedAllCities).toBe(true);
        });

        it('should not update completedAllCities when not all cities are completed', async () => {
            // Create another city
            await City.create({
                city: 'Another City',
                country: 'Test Country',
                clues: ['Clue 1'],
                fun_fact: ['Fact 1'],
                trivia: ['Trivia 1']
            });

            const user = await User.create({
                username: 'testuser',
                progress: [{ city: testCity._id, correct: true }]
            });

            expect(user.completedAllCities).toBe(false);
        });
    });

    describe('currentGame', () => {
        it('should initialize with default values', async () => {
            const user = await User.create({
                username: 'testuser'
            });

            expect(user.currentGame?.attempts).toBe(0);
            expect(user.currentGame?.hintsUsed).toHaveLength(0);
        });

        it('should store game state correctly', async () => {
            const gameState = {
                city: testCity._id,
                attempts: 2,
                hintsUsed: ['hint1', 'hint2'],
                startTime: new Date()
            };

            const user = await User.create({
                username: 'testuser',
                currentGame: gameState
            });

            expect(user.currentGame?.city?.toString()).toBe(testCity._id.toString());
            expect(user.currentGame?.attempts).toBe(2);
            expect(user.currentGame?.hintsUsed).toEqual(['hint1', 'hint2']);
            expect(user.currentGame?.startTime).toBeDefined();
        });
    });
});
