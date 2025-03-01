import dotenv from "dotenv"

dotenv.config()

export const port = process.env.PORT;
export const MONGO_URL = process.env.MONGO_DB_URL;