import { Schema, model, Model, Document } from "mongoose";
import { City } from "./city.model";

interface IProgress {
    city: Schema.Types.ObjectId;
    attempts: number;
    correct: boolean;
    hintsUsed: string[];
    score: number;
    lastAttempt: Date;
}

interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    progress: IProgress[];
    currentGame?: {
        city?: Schema.Types.ObjectId;
        attempts: number;
        hintsUsed: string[];
        startTime?: Date;
    };
    totalScore: number;
    completedAllCities: boolean;
    createdAt: Date;
    completedCount: number;
    updateCityProgress: (
        cityId: any,
        isCorrect: boolean
    ) => Promise<void>;
}

interface UserModel extends Model<IUser> {
    resetProgress(userId: string): Promise<IUser>;
}

const progressSchema = new Schema<IProgress>({
    city: {
        type: Schema.Types.ObjectId,
        ref: 'City',
        required: true,
        unique: true
    },
    correct: { type: Boolean, default: false },
});

const userSchema = new Schema<IUser, UserModel>({
    username: { type: String, required: true, unique: true },
    progress: [progressSchema],
    currentGame: {
        city: { type: Schema.Types.ObjectId, ref: 'City' },
        attempts: { type: Number, default: 0 },
        hintsUsed: { type: [String], default: [] },
        startTime: { type: Date }
    },
    totalScore: { type: Number, default: 0 },
    completedAllCities: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

userSchema.methods.updateCityProgress = async function (
    cityId: Schema.Types.ObjectId,
    isCorrect: boolean,
) {
    const progressIndex = this.progress.findIndex((p: any) =>
        p.city.equals(cityId)
    );

    if (progressIndex === -1) {
        this.progress.push({
            city: cityId,
            correct: isCorrect,
        });
    } else {
        const progress = this.progress[progressIndex];

        if (isCorrect && !progress.correct) {
            progress.correct = true;
        }
    }

    await this.save();
};

userSchema.virtual('completedCount').get(function () {
    return this.progress.filter(p => p.correct).length;
});

userSchema.post('save', async function () {
    if (this.completedCount === await City.countDocuments() && !this.completedAllCities) {
        this.completedAllCities = true;
        await this.save();
    }
});

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

export const User = model('User', userSchema);