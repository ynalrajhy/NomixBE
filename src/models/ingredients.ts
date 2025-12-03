import mongoose, { Schema, Document, Model } from "mongoose";

export interface ingredient {
  name: string;
  quantity: number;
  Recipe: mongoose.Schema.Types.ObjectId[];

  createdAt: Date;
  updatedAt: Date;
}
const ingredientSchema = new Schema({
  name: { type: String, required: true },
  quantity: Number,
  Recipe: [{ type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }],

  createdAt: { type: Date, default: Date.now, required: true },
  updatedAt: { type: Date, default: Date.now, required: true },
});

const ingredients = mongoose.model("ingredients", ingredientSchema);

export default ingredients;
