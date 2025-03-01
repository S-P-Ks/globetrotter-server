import express, { Request, Response } from "express";
import { connect } from "mongoose";
import cookieParser from "cookie-parser"
import cityRoutes from "./routes/city.routes";
import userRoutes from "./routes/user.routes";
import shareImageRoutes from "./routes/share-image.route";
import { MONGO_URL, port } from "./config";
import cors from "cors"

const app = express();

app.use(cors({
    origin: `${process.env.CLIENT_BASE_URL}`,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Length", "X-Custom-Header"],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/city", cityRoutes);
app.use("/user", userRoutes);
app.use("/share-image", shareImageRoutes);

app.get("/", async (req: Request, res: Response) => {
    res.send("Hello World!");
});

connect(`${MONGO_URL}`)
    .then(() => {
        console.log("Connected to database!");
        app.listen(port, () => {
            console.log("Server is running on port 3000");
        });
    })
    .catch(() => {
        console.log("Connection failed!");
    });