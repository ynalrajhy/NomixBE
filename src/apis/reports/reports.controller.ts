import { Request, Response, NextFunction } from "express";
import Report from "../../models/reports";
import { userType } from "../../types/user";
import mongoose from "mongoose";

const getTargetModel = (targetType: string): string => {
    switch (targetType) {
        case "recipe":
            return "Recipe";
        case "ingredient":
            return "ingredients";
        case "category":
            return "categories";
        case "user":
            return "User";
        case "comment":
            return "Comment";
        default:
            return "";
    }
};

const createReport = async (
    req: userType,
    res: Response,
    next: NextFunction
) => {
    try {
        const { targetType, targetId, reason, description, recipeId } = req.body;

        if (!targetType || !targetId || !reason) {
            return res.status(400).json({
                success: false,
                message: "targetType, targetId, and reason are required",
            });
        }

        const validTypes = ["recipe", "ingredient", "category", "user", "comment"];
        if (!validTypes.includes(targetType)) {
            return res.status(400).json({
                success: false,
                message: "Invalid target type. Must be: recipe, ingredient, category, user, or comment",
            });
        }

        // For comments, recipeId is required
        if (targetType === "comment" && !recipeId) {
            return res.status(400).json({
                success: false,
                message: "recipeId is required when reporting a comment",
            });
        }

        const targetModel = getTargetModel(targetType);

        const reporterId = new mongoose.Types.ObjectId(req.user?._id);

        const reportData: any = {
            reporter: reporterId,
            targetType,
            targetId,
            targetModel,
            reason,
            description: description || "",
        };

        if (targetType === "comment" && recipeId) {
            reportData.recipeId = new mongoose.Types.ObjectId(recipeId);
        }

        const report = await Report.create(reportData);

        res.status(201).json({
            success: true,
            data: report,
            message: "Report submitted successfully",
        });
    } catch (error) {
        next(error);
    }
};

const getAllReports = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { status, targetType } = req.query;

        const filter: any = {};
        if (status) filter.status = status;
        if (targetType) filter.targetType = targetType;

        const reports = await Report.find(filter)
            .populate("reporter", "username email profilePicture")
            .populate("targetId")
            .sort({ createdAt: -1 });

        // Transform reports to handle null values
        const transformedReports = reports.map((report: any) => ({
            ...report.toObject(),
            reporter: report.reporter || { username: "Deleted User", email: "N/A" },
            targetId: report.targetId || { name: "Deleted Item" },
        }));

        res.status(200).json({
            success: true,
            data: transformedReports,
            total: transformedReports.length,
        });
    } catch (error) {
        next(error);
    }
};

const getReportById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        const report = await Report.findById(id)
            .populate("reporter", "username email profilePicture")
            .populate("targetId");

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Report not found",
            });
        }

        // Transform report to handle null values
        const transformedReport = {
            ...report.toObject(),
            reporter: (report as any).reporter || { username: "Deleted User", email: "N/A" },
            targetId: (report as any).targetId || { name: "Deleted Item" },
        };

        res.status(200).json({
            success: true,
            data: transformedReport,
        });
    } catch (error) {
        next(error);
    }
};

const updateReportStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ["pending", "reviewed", "resolved", "dismissed"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status. Must be: pending, reviewed, resolved, or dismissed",
            });
        }

        const report = await Report.findByIdAndUpdate(
            id,
            { status, updatedAt: new Date() },
            { new: true }
        )
            .populate("reporter", "username email")
            .populate("targetId");

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Report not found",
            });
        }

        res.status(200).json({
            success: true,
            data: report,
            message: `Report status updated to ${status}`,
        });
    } catch (error) {
        next(error);
    }
};

const deleteReport = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        const report = await Report.findByIdAndDelete(id);

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Report not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Report deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};

const getMyReports = async (
    req: userType,
    res: Response,
    next: NextFunction
) => {
    try {
        const reporterId = new mongoose.Types.ObjectId(req.user?._id);
        const reports = await Report.find({ reporter: reporterId })
            .populate("targetId")
            .sort({ createdAt: -1 });

        // Transform reports to handle null values
        const transformedReports = reports.map((report: any) => ({
            ...report.toObject(),
            targetId: report.targetId || { name: "Deleted Item" },
        }));

        res.status(200).json({
            success: true,
            data: transformedReports,
            total: transformedReports.length,
        });
    } catch (error) {
        next(error);
    }
};

export {
    createReport,
    getAllReports,
    getReportById,
    updateReportStatus,
    deleteReport,
    getMyReports,
};

