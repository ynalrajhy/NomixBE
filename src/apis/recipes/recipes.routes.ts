import { Router } from "express";
import {
  createRecipe,
  getAllRecipes,
  updateRecipe,
  deleteRecipe,
} from "./recipes.controllers";
import { auth } from "../../middlewares/auth";

const router = Router();

router.post("/", auth, createRecipe);
router.get("/", getAllRecipes);
router.put("/:id", auth, updateRecipe);
router.delete("/:id", auth, deleteRecipe);

export default router;
