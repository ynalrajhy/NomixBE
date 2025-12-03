import express from "express";
import connectDB from "./database";
import morgan from "morgan";
import { notFound } from "./middlewares/notFound";
import { errorHandler } from "./middlewares/errorHandler";
import cors from "cors";
import recipesRoutes from "./apis/recipes/recipes.routes";
import userRoutes from "./apis/user/user.routes";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const app = express();
const HOST = process.env.HOST || "127.0.0.1";
const PORT = process.env.PORT || 8000;
const MONGO_URI = process.env.MONGO_URI || "";


app.use(express.json());
app.use(morgan("dev"));
app.use(cors());

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use("/api/recipes", recipesRoutes);
app.use("/api/auth", userRoutes);


app.use(notFound);
app.use(errorHandler);

connectDB();

app.listen(PORT, () => {
  console.log(`
    Nomix Backend Server.

    Server is running on http://${HOST}:${PORT}
    `);
});
