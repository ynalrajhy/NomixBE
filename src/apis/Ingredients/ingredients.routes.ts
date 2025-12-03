import { Router } from "express";
import {
    createIngredient,
    getAllIngredients,
    getOneIngredient,
    updateIngredient,
    deleteIngredient,
} from "./ingredients.controller";
import { auth } from "../../middlewares/auth";

const router = Router();

router.post("/", auth, createIngredient);
router.get("/", getAllIngredients);
router.get("/:id", getOneIngredient);
router.put("/:id", auth, updateIngredient);
router.delete("/:id", auth, deleteIngredient);

export default router;
