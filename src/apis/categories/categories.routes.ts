import { Router } from "express";
import { createCategory, addRecipeToCategory, getAllCategories } from "./categories.controller";

const router = Router();

router.post("/", createCategory);
router.post("/:categoryId/recipes/:recipeId", addRecipeToCategory);
router.get("/", getAllCategories);

export default router;