import { Router } from "express";
import { createRecipe, getAllRecipes, updateRecipe, deleteRecipe } from "./recipes.controller";

const router = Router();

router.post("/", createRecipe);
router.get("/", getAllRecipes);
router.put("/:id", updateRecipe);
router.delete("/:id", deleteRecipe);

export default router;