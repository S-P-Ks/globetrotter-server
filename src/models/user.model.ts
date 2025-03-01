import { Schema, model } from "mongoose";
import { City } from "./city.model";

const progressSchema = new Schema({
    city: {
        type: Schema.Types.ObjectId,
        ref: 'City',
        required: true,
        unique: true // Ensures one entry per city
    },
    attempts: { type: Number, default: 0 },
    correct: { type: Boolean, default: false },
    hintsUsed: { type: [String], default: [] },
    score: { type: Number, default: 0 },
    lastAttempt: { type: Date, default: Date.now }
});

// Enhanced User Schema with completion tracking
const userSchema = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    progress: [progressSchema],
    currentGame: {
        city: { type: Schema.Types.ObjectId, ref: 'City' },
        attempts: { type: Number, default: 0 },
        hintsUsed: { type: [String], default: [] },
        startTime: { type: Date }
    },
    totalScore: { type: Number, default: 0 },
    completedCount: { type: Number, default: 0 },
    completedAllCities: { type: Boolean, default: false }, // New flag
    createdAt: { type: Date, default: Date.now }
});

// Virtual for completed cities count
userSchema.virtual('completedCount').get(function () {
    return this.progress.filter(p => p.correct).length;
});

// Middleware to check completion status
userSchema.post('save', async function () {
    if (this.completedCount === await City.countDocuments() && !this.completedAllCities) {
        this.completedAllCities = true;
        await this.save();
    }
});

// Static method for resetting progress
userSchema.statics.resetProgress = async function (userId) {
    return this.findByIdAndUpdate(userId, {
        $set: {
            progress: [],
            totalScore: 0,
            currentGame: null,
            completedAllCities: false
        }
    });
};

const User = model('User', userSchema);