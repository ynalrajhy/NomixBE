import mongoose, { Model, Schema, Document, Types } from "mongoose";

export interface IReport extends Document {
    reporter: Types.ObjectId;
    targetType: "recipe" | "ingredient" | "category" | "user" | "comment";
    targetId: Types.ObjectId;
    targetModel: "Recipe" | "ingredients" | "categories" | "User" | "Comment";
    recipeId?: Types.ObjectId;
    reason: string;
    description: string;
    status: "pending" | "reviewed" | "resolved" | "dismissed";
    createdAt: Date;
    updatedAt: Date;
}

const ReportSchema = new Schema({
    reporter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    targetType: {
        type: String,
        enum: ["recipe", "ingredient", "category", "user", "comment"],
        required: true,
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: "targetModel",
    },
    targetModel: {
        type: String,
        required: true,
        enum: ["Recipe", "ingredients", "categories", "User", "Comment"],
    },
    recipeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Recipe",
    },
    reason: {
        type: String,
        required: true,
        enum: [
            "inappropriate",
            "spam",
            "misleading",
            "copyright",
            "harassment",
            "other",
        ],
    },
    description: {
        type: String,
        default: "",
    },
    status: {
        type: String,
        enum: ["pending", "reviewed", "resolved", "dismissed"],
        default: "pending",
    },
    createdAt: { type: Date, default: Date.now, required: true },
    updatedAt: { type: Date, default: Date.now, required: true },
});

const Report: Model<IReport> = mongoose.model<IReport>("Report", ReportSchema);

export default Report;

