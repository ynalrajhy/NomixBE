import { Router } from "express";
import {
    createReport,
    getAllReports,
    getReportById,
    updateReportStatus,
    deleteReport,
    getMyReports,
} from "./reports.controller";
import { auth, admin } from "../../middlewares/auth";

const router = Router();

// User routes
router.post("/", auth, createReport);
router.get("/my-reports", auth, getMyReports);

// Admin routes
router.get("/", auth, admin, getAllReports);
router.get("/:id", auth, admin, getReportById);
router.put("/:id/status", auth, admin, updateReportStatus);
router.delete("/:id", auth, admin, deleteReport);

export default router;

