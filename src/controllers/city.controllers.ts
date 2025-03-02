import { Request, Response } from "express"
import { City } from "../models/city.model";
import { User } from "../models/user.model";
import mongoose from "mongoose";

export const getRandomCity = async (req: Request, res: Response) => {
    try {
        const userId = req.cookies.userId;

        if (!userId) {
            res.status(403).json({ message: "User should loggedin" });
            return
        }

        const user = await User.findById(userId);

        if (!user) {
            res.status(403).json({ message: "User does not exists" });
            return
        }

        const answeredCityIds = user.progress
            .filter(p => p.city)
            .map(p => p.city.toString());

        const randomCity = await City.aggregate([
            {
                $match: {
                    _id: { $nin: answeredCityIds.map(id => new mongoose.Types.ObjectId(id)) }
                }
            },
            { $sample: { size: 1 } },
            { $project: { clues: 1, _id: 1, city: 1 } }
        ]);

        if (!randomCity.length) {
            res.status(200).json({
                data: {
                },
                options: [],
            });
            return
        }

        const correctCityId = randomCity[0]._id;

        const wrongOptions = await City.aggregate([
            { $match: { _id: { $ne: correctCityId } } },
            { $sample: { size: 3 } },
            { $project: { city: 1, _id: 1 } }
        ]);

        const options = [...randomCity, ...wrongOptions].sort(() => Math.random() - 0.5).map(({ _id, city }) => ({ _id, name: city }));

        res.json({
            data: {
                _id: randomCity[0]._id,
                clues: randomCity[0].clues
            },
            options,
        });
    } catch (error) {
        console.error("Error fetching random city:", error);
        res.status(500).json({
            message: "Failed to get random city",
            error: error instanceof Error ? error.message : "Unknown error",
            success: false
        });
    }
}

export const validate = async (req: Request, res: Response) => {
    try {
        const userId = req.cookies.userId;

        if (!userId) {
            res.status(403).json({ message: "User should loggedin" });
            return
        }

        const { cityId, guess } = req.body;
        const city = await City.findById(cityId);
        const user = await User.findById(userId);

        if (!city || !user) {
            res.status(404).json({ message: "City or user not found" });
            return
        }

        const isCorrect = city.city.toLowerCase() === guess.toLowerCase();

        await user.updateCityProgress(city._id, isCorrect);

        res.json({
            correct: isCorrect,
            actualCity: city.city,
        });
    } catch (error) {
        console.error("Error validating:", error);
        res.status(500).json({
            message: "Failed to validate",
            error: error instanceof Error ? error.message : "Unknown error",
            success: false
        });
    }
}