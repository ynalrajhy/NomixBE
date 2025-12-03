import { Router } from "express";
import {
    createCategory,
    getAllCategories,
    getOneCategory,
    updateCategory,
    deleteCategory,
} from "./categories.controller";
import { auth } from "../../middlewares/auth";

const router = Router();

router.post("/", auth, createCategory);
router.get("/", getAllCategories);
router.get("/:id", getOneCategory);
router.put("/:id", auth, updateCategory);
router.delete("/:id", auth, deleteCategory);

export default router;
