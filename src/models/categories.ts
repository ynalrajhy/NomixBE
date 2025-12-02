import mongoose, { Model, Schema } from "mongoose";

export interface ICategory {
  name: string;
  recipes: mongoose.Schema.Types.ObjectId[];
}

const categorySchema = new mongoose.Schema<ICategory>({
  name: { type: String, required: true },
  recipes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }],
});
const categories: Model<ICategory> = mongoose.model<ICategory>(
  "categories",
  categorySchema
);
export default categories;
