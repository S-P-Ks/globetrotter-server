import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { City } from '../../src/models/city.model';

describe('City Model', () => {
    let mongoServer: MongoMemoryServer;

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
        await City.deleteMany({});
    });

    it('should create a valid city', async () => {
        const validCity = {
            city: 'Paris',
            country: 'France',
            clues: ['Eiffel Tower', 'Louvre Museum'],
            fun_fact: ['City of Light', 'Founded in 3rd century BC'],
            trivia: ['Most visited city in the world', 'Has 130 museums'],
            difficulty: 2
        };

        const city = await City.create(validCity);
        expect(city.city).toBe(validCity.city);
        expect(city.country).toBe(validCity.country);
        expect(city.clues).toEqual(expect.arrayContaining(validCity.clues));
        expect(city.fun_fact).toEqual(expect.arrayContaining(validCity.fun_fact));
        expect(city.trivia).toEqual(expect.arrayContaining(validCity.trivia));
        expect(city.difficulty).toBe(validCity.difficulty);
    });

    it('should fail without required fields', async () => {
        const invalidCity = {
            city: 'Paris'
        };

        await expect(City.create(invalidCity)).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should only allow valid difficulty levels', async () => {
        const invalidCity = {
            city: 'Tokyo',
            country: 'Japan',
            clues: ['Mount Fuji', 'Shibuya Crossing'],
            fun_fact: ['Largest metropolitan area'],
            trivia: ['Has over 13 million people'],
            difficulty: 4 // Invalid difficulty
        };

        await expect(City.create(invalidCity)).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should set default difficulty if not provided', async () => {
        const cityWithoutDifficulty = {
            city: 'Berlin',
            country: 'Germany',
            clues: ['Brandenburg Gate', 'East Side Gallery'],
            fun_fact: ['Divided by wall until 1989'],
            trivia: ['Has 175 museums']
        };

        const city = await City.create(cityWithoutDifficulty);
        expect(city.difficulty).toBe(2);
    });

    it('should successfully update a city', async () => {
        const city = await City.create({
            city: 'Madrid',
            country: 'Spain',
            clues: ['Royal Palace', 'Plaza Mayor'],
            fun_fact: ['Capital since 1606'],
            trivia: ['Has many art museums'],
            difficulty: 1
        });

        const updatedCity = await City.findByIdAndUpdate(
            city._id,
            { difficulty: 3 },
            { new: true }
        );

        expect(updatedCity?.difficulty).toBe(3);
    });

    it('should find city by name', async () => {
        const cityData = {
            city: 'Amsterdam',
            country: 'Netherlands',
            clues: ['Canals', 'Bicycles'],
            fun_fact: ['Built on poles'],
            trivia: ['Has 165 canals'],
            difficulty: 2
        };

        await City.create(cityData);
        const foundCity = await City.findOne({ city: 'Amsterdam' });

        expect(foundCity).toBeDefined();
        expect(foundCity?.city).toBe('Amsterdam');
    });
});
