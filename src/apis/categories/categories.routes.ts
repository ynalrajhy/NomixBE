import { Router } from "express";
import {
    createCategory,
    getAllCategories,
    getOneCategory,
    updateCategory,
    deleteCategory,
    getRandomCategoriesWithRecipes,
    getAllCategoriesAdmin,
    adminDeleteCategory,
    getReportsForCategory,
} from "./categories.controller";
import { auth, admin } from "../../middlewares/auth";

const router = Router();

router.post("/", auth, createCategory);
router.get("/", getAllCategories);
router.get("/random-with-recipes", getRandomCategoriesWithRecipes);
router.get("/:id", getOneCategory);
router.put("/:id", auth, updateCategory);
router.delete("/:id", auth, deleteCategory);

// Admin routes
router.get("/admin/all", auth, admin, getAllCategoriesAdmin);
router.delete("/admin/:id", auth, admin, adminDeleteCategory);
router.get("/admin/:id/reports", auth, admin, getReportsForCategory);

export default router;
