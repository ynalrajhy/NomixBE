import { Router } from "express";
import {
  createRecipe,
  getAllRecipes,
  getOneRecipe,
  updateRecipe,
  deleteRecipe,
  getRecipesByCategory,
  toggleLikeRecipe,
  addComment,
  deleteComment,
} from "./recipes.controller";
import { auth } from "../../middlewares/auth";
import upload from "../../middlewares/multer";

const router = Router();

router.post("/", auth, upload.single("image"), createRecipe);
router.get("/", getAllRecipes);
router.get("/:id", getOneRecipe);
router.put("/:id", auth, upload.single("image"), updateRecipe);
router.delete("/:id", auth, deleteRecipe);
router.get("/category/:categoryId", getRecipesByCategory);

// Social features
router.post("/:id/like", auth, toggleLikeRecipe);
router.post("/:id/comments", auth, addComment);
router.delete("/:id/comments/:commentId", auth, deleteComment);

export default router;
