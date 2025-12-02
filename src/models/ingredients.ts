import mongoose, { Schema, Document, Model } from "mongoose";

export interface ingredient {
  name: string;
  quantity: number;
}
const ingredientSchema = new Schema({
  name: String,
  quantity: Number,
  Recipe: [{ type: mongoose.Schema.Types.ObjectId, ref: "recipes" }],
});
const ingredients = mongoose.model("ingredients", ingredientSchema);
export default ingredients;
