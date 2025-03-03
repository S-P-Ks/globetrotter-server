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
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
const city_model_1 = require("../../src/models/city.model");
describe('City Model', () => {
    let mongoServer;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        mongoServer = yield mongodb_memory_server_1.MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        yield mongoose_1.default.connect(mongoUri);
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield mongoose_1.default.disconnect();
        yield mongoServer.stop();
    }));
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield city_model_1.City.deleteMany({});
    }));
    it('should create a valid city', () => __awaiter(void 0, void 0, void 0, function* () {
        const validCity = {
            city: 'Paris',
            country: 'France',
            clues: ['Eiffel Tower', 'Louvre Museum'],
            fun_fact: ['City of Light', 'Founded in 3rd century BC'],
            trivia: ['Most visited city in the world', 'Has 130 museums'],
            difficulty: 2
        };
        const city = yield city_model_1.City.create(validCity);
        expect(city.city).toBe(validCity.city);
        expect(city.country).toBe(validCity.country);
        expect(city.clues).toEqual(expect.arrayContaining(validCity.clues));
        expect(city.fun_fact).toEqual(expect.arrayContaining(validCity.fun_fact));
        expect(city.trivia).toEqual(expect.arrayContaining(validCity.trivia));
        expect(city.difficulty).toBe(validCity.difficulty);
    }));
    it('should fail without required fields', () => __awaiter(void 0, void 0, void 0, function* () {
        const invalidCity = {
            city: 'Paris'
        };
        yield expect(city_model_1.City.create(invalidCity)).rejects.toThrow(mongoose_1.default.Error.ValidationError);
    }));
    it('should only allow valid difficulty levels', () => __awaiter(void 0, void 0, void 0, function* () {
        const invalidCity = {
            city: 'Tokyo',
            country: 'Japan',
            clues: ['Mount Fuji', 'Shibuya Crossing'],
            fun_fact: ['Largest metropolitan area'],
            trivia: ['Has over 13 million people'],
            difficulty: 4 // Invalid difficulty
        };
        yield expect(city_model_1.City.create(invalidCity)).rejects.toThrow(mongoose_1.default.Error.ValidationError);
    }));
    it('should set default difficulty if not provided', () => __awaiter(void 0, void 0, void 0, function* () {
        const cityWithoutDifficulty = {
            city: 'Berlin',
            country: 'Germany',
            clues: ['Brandenburg Gate', 'East Side Gallery'],
            fun_fact: ['Divided by wall until 1989'],
            trivia: ['Has 175 museums']
        };
        const city = yield city_model_1.City.create(cityWithoutDifficulty);
        expect(city.difficulty).toBe(2);
    }));
    it('should successfully update a city', () => __awaiter(void 0, void 0, void 0, function* () {
        const city = yield city_model_1.City.create({
            city: 'Madrid',
            country: 'Spain',
            clues: ['Royal Palace', 'Plaza Mayor'],
            fun_fact: ['Capital since 1606'],
            trivia: ['Has many art museums'],
            difficulty: 1
        });
        const updatedCity = yield city_model_1.City.findByIdAndUpdate(city._id, { difficulty: 3 }, { new: true });
        expect(updatedCity === null || updatedCity === void 0 ? void 0 : updatedCity.difficulty).toBe(3);
    }));
    it('should find city by name', () => __awaiter(void 0, void 0, void 0, function* () {
        const cityData = {
            city: 'Amsterdam',
            country: 'Netherlands',
            clues: ['Canals', 'Bicycles'],
            fun_fact: ['Built on poles'],
            trivia: ['Has 165 canals'],
            difficulty: 2
        };
        yield city_model_1.City.create(cityData);
        const foundCity = yield city_model_1.City.findOne({ city: 'Amsterdam' });
        expect(foundCity).toBeDefined();
        expect(foundCity === null || foundCity === void 0 ? void 0 : foundCity.city).toBe('Amsterdam');
    }));
});
