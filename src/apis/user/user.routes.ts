import { Router } from "express";
import { register, login, getAllUsers, getAllUsersAdmin, updateUser, deleteUser, getUserById, changePassword, toggleFavorite, toggleFollow, toggleUserActive, toggleUserAdmin, banUser, unbanUser, getReportsForUser } from "./users.controller";
import { auth, admin } from "../../middlewares/auth";

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
router.post("/follow/:userId", auth, toggleFollow);

// Admin routes
router.get("/admin/all", auth, admin, getAllUsersAdmin);
router.put("/:id/active", auth, admin, toggleUserActive);
router.put("/:id/admin", auth, admin, toggleUserAdmin);
router.post("/:id/ban", auth, admin, banUser);
router.post("/:id/unban", auth, admin, unbanUser);
router.get("/:id/reports", auth, admin, getReportsForUser);

export default router;
