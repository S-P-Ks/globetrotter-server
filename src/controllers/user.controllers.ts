import { Request, Response } from "express"

const getRandomCity = (req: Request, res: Response) => {

}router.post("/validate", async (req: Request, res: Response) => {
    const { cityId, guess } = req.body;
    const city = await City.findById(cityId);

    res.json({
        correct: city?.city.toLowerCase() === guess.toLowerCase(),
        actualCity: city?.city
    });
});