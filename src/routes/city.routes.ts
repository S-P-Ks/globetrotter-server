import { Router, Request, Response } from "express"
import { getRandomCity, validate } from "../controllers/city.controllers";

const router = Router()

router.get("/randomCity", getRandomCity)
router.post("/validate", validate);


export default router