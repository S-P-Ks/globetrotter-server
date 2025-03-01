import { Router, Request, Response } from "express"
import { getRandomCity } from "../controllers/city.controllers";

export const router = Router()

router.get("/randomCity", getRandomCity)

router.post("/validate", async (req: Request, res: Response) => {
    const { cityId, guess } = req.body;
    const city = await City.findById(cityId);

    res.json({
        correct: city?.city.toLowerCase() === guess.toLowerCase(),
        actualCity: city?.city
    });
});