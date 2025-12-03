import { Router } from "express";
import { register, login, getAllUsers, updateUser, deleteUser, getUserById, changePassword, toggleFavorite } from "./users.controller";
import { auth } from "../../middlewares/auth";

import upload from "../../middlewares/multer";

const router = Router();

router.post("/", register);
router.post("/login", login);
router.get("/", auth, getAllUsers);
router.put("/:id", auth, upload.single('profilePicture'), updateUser);
router.delete("/", auth, deleteUser);
router.get("/:id", auth, getUserById);
router.put("/:id/change-password", auth, changePassword);
router.post("/favorites/:recipeId", auth, toggleFavorite);

export default router;
