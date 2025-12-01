import { Router } from "express";
import { createUser, loginUser, getAllUsers } from "./users.controllers";
import { auth } from "../../middlewares/auth";

const router = Router();

router.post("/", createUser);
router.post("/login", loginUser);
router.get("/", auth, getAllUsers);

export default router;