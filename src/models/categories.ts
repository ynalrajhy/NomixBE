import mongoose, { Model, Schema } from "mongoose";

export interface ICategory {
  name: string;
  recipes: mongoose.Schema.Types.ObjectId[];

  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new mongoose.Schema<ICategory>({
  name: { type: String, required: true },
  recipes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }],

  createdAt: { type: Date, default: Date.now, required: true },
  updatedAt: { type: Date, default: Date.now, required: true },
});

const categories: Model<ICategory> = mongoose.model<ICategory>(
  "categories",
  categorySchema
);

export default categories;
