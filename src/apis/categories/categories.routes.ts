import { Router } from "express";
import { createCategory, getAllCategories } from "./categories.controller";
import { auth } from "../../middlewares/auth";

const router = Router();

router.post("/", auth, createCategory);
router.get("/", getAllCategories);

export default router;
