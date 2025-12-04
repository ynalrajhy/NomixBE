import { Router } from "express";
import {
  createRecipe,
  getAllRecipes,
  getOneRecipe,
  updateRecipe,
  deleteRecipe,
  getRecipesByCategory,
  getRecipesByUser,
  getRandomRecipe,
  toggleLikeRecipe,
  addComment,
  deleteComment,
  toggleLikeComment,
  addReplyToComment,
  toggleLikeReply,
  addImagesToRecipe,
  removeImageFromRecipe,
  getAllRecipesAdmin,
  adminDeleteRecipe,
  getReportsForRecipe,
} from "./recipes.controller";
import { auth, admin } from "../../middlewares/auth";
import upload from "../../middlewares/multer";

const router = Router();

router.post("/", auth, upload.array("images", 10), createRecipe);
router.get("/", getAllRecipes);
router.get("/random", getRandomRecipe);
router.get("/:id", getOneRecipe);
router.put("/:id", auth, upload.array("images", 10), updateRecipe);
router.post("/:id/images", auth, upload.array("images", 10), addImagesToRecipe);
router.delete("/:id/images", auth, removeImageFromRecipe);
router.delete("/:id", auth, deleteRecipe);
router.get("/category/:categoryId", getRecipesByCategory);
router.get("/user/:userId", getRecipesByUser);

// Social features
router.post("/:id/like", auth, toggleLikeRecipe);
router.post("/:id/comments", auth, addComment);
router.delete("/:id/comments/:commentId", auth, deleteComment);
router.post("/:id/comments/:commentId/like", auth, toggleLikeComment);
router.post("/:id/comments/:commentId/replies", auth, addReplyToComment);
router.post("/:id/comments/:commentId/replies/:replyId/like", auth, toggleLikeReply);

// Admin routes
router.get("/admin/all", auth, admin, getAllRecipesAdmin);
router.delete("/admin/:id", auth, admin, adminDeleteRecipe);
router.get("/admin/:id/reports", auth, admin, getReportsForRecipe);

export default router;
