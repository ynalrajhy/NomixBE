import express from "express";
import connectDB from "./database";
import morgan from "morgan";
import { notFound } from "./middlewares/notFound";
import { errorHandler } from "./middlewares/errorHandler";
import cors from "cors";
import recipesRoutes from "./apis/recipes/recipes.routes";

const app = express();
const PORT = 8000;



app.use(express.json());
app.use(morgan("dev"));
app.use(cors());
app.use("/api/recipes", recipesRoutes);











app.use(notFound);
app.use(errorHandler);
connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
