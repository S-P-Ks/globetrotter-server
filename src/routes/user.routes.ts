import { Router } from "express"
import { createUser, getCurrentUser, getUserById } from "../controllers/user.controllers"

const router = Router()

router.post("/", createUser)
router.get("/me", getCurrentUser)
router.get("/:id", getUserById)

export default router