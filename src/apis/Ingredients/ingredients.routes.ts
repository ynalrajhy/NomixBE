import { Router } from "express";
import {
    createIngredient,
    getAllIngredients,
    getOneIngredient,
    updateIngredient,
    deleteIngredient,
    getAllIngredientsAdmin,
    adminDeleteIngredient,
    getReportsForIngredient,
} from "./ingredients.controller";
import { auth, admin } from "../../middlewares/auth";

const router = Router();

router.post("/", auth, createIngredient);
router.get("/", getAllIngredients);
router.get("/:id", getOneIngredient);
router.put("/:id", auth, updateIngredient);
router.delete("/:id", auth, deleteIngredient);

// Admin routes
router.get("/admin/all", auth, admin, getAllIngredientsAdmin);
router.delete("/admin/:id", auth, admin, adminDeleteIngredient);
router.get("/admin/:id/reports", auth, admin, getReportsForIngredient);

export default router;
