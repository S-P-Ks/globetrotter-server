import mongoose from "mongoose";

export const citySchema = new mongoose.Schema({
    city: { type: String, required: true },
    country: { type: String, required: true },
    clues: { type: [String], required: true },
    fun_fact: { type: [String], required: true },
    trivia: { type: [String], required: true },
    difficulty: { type: Number, enum: [1, 2, 3], default: 2 }
});

export const City = mongoose.model('City', citySchema);
