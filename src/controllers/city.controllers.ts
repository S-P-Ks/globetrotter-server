import { Request, Response } from "express"
import { City } from "../models/city.model";

export const getRandomCity = async (req: Request, res: Response) => {
    try {
        const randomCity = await City.aggregate([
            { $sample: { size: 1 } },
            { $project: { _id: 0, __v: 0 } }
        ]);

        if (!randomCity.length) {
            return res.status(404).json({ message: "No cities found" });
        }

        res.json({
            data: randomCity[0],
            success: true
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

    } catch (error) {

    }
}