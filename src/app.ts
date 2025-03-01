import express, { Request, Response } from "express";
import { connect } from "mongoose";
import dotenv from "dotenv"

dotenv.config()

const app = express();
const port = process.env.PORT;
const MONGO_URL = process.env.MONGO_DB_URL

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req: Request, res: Response) => {
    res.send("Hello World!");
});

connect(
    "mongodb+srv://haris2iftikhar:GClTzr15XhkjvN6k@backenddb.nrurtot.mongodb.net/Node-API?retryWrites=true&w=majority"
)
    .then(() => {
        console.log("Connected to database!");
        app.listen(3000, () => {
            console.log("Server is running on port 3000");
        });
    })
    .catch(() => {
        console.log("Connection failed!");
    });

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});