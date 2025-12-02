import { Router } from "express";
import { createIngredient, getAllIngredients } from "./ingredients.controller";
import { auth } from "../../middlewares/auth";

const router = Router();

router.post("/", auth, createIngredient);
router.get("/", getAllIngredients);

export default router;
