import { Request, Response } from "express";
import { User } from "../models/user.model";

export const createUser = async (req: Request, res: Response) => {
    try {
        const { username } = req.body;

        if (!username || typeof username !== "string" || username.trim() === "") {
            res.status(400).json({ error: "Username is required" });
            return
        }

        let existingUser = await User.findOne({ username });

        if (!existingUser) {
            existingUser = await User.create({
                username,
                score: { correct: 0, incorrect: 0 },
            });
        }

        res.cookie("userId", existingUser._id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 30 * 1000,
            path: "/",
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        });

        res.status(201).json({
            success: true,
            userId: existingUser._id
        });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ error: "Failed to create user" });
    }
};

export const getCurrentUser = async (req: Request, res: Response) => {
    try {
        const userId = req.cookies.userId; // 👈 Access cookie value

        if (!userId) {
            res.status(401).json({ error: "Not authenticated" });
            return
        }

        const user = await User.findById(userId);

        if (!user) {
            res.status(404).json({ error: "User not found" });
            return
        }

        const correctAnswers = user.progress
            .filter(p => p.correct)

        const wrongAnswers = user.progress
            .filter(p => !p.correct)

        res.json({ user, correctScore: correctAnswers.length, incorrectScore: wrongAnswers.length });
    } catch (error) {
        console.error("Error getting user:", error);
        res.status(500).json({ error: "Failed to get any user" });
    }
}

export const getUserById = async (req: Request, res: Response) => {
    try {
        const userId = req.params.id;

        if (!userId) {
            res.status(401).json({ error: "Not authenticated" });
            return
        }

        const user = await User.findById(userId);

        if (!user) {
            res.status(404).json({ error: "User not found" });
            return
        }


        const correctAnswers = user.progress
            .filter(p => p.correct)

        const wrongAnswers = user.progress
            .filter(p => !p.correct)

        res.json({ user, correctScore: correctAnswers.length, incorrectScore: wrongAnswers.length });
    } catch (error) {
        console.error("Error getting user:", error);
        res.status(500).json({ error: "Failed to get any user" });
    }
}