import mongoose, { Schema, Document, Model } from "mongoose";

export interface ingredient {
  name: string;
  quantity: number;

  createdAt: Date;
  updatedAt: Date;
}
const ingredientSchema = new Schema({
  name: String,
  quantity: Number,
  Recipe: [{ type: mongoose.Schema.Types.ObjectId, ref: "recipes" }],

  createdAt: { type: Date, default: Date.now, required: true },
  updatedAt: { type: Date, default: Date.now, required: true },
});

const ingredients = mongoose.model("ingredients", ingredientSchema);

export default ingredients;
