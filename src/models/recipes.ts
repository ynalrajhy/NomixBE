import mongoose, { Model, Schema, Document } from "mongoose";

export interface IRecipe {
  name: string;
  category: mongoose.Schema.Types.ObjectId[];
  ingredients: mongoose.Schema.Types.ObjectId[];
  instructions: string[];
  image: string;
  userId: mongoose.Schema.Types.ObjectId;
}
const RecipeSchema = new Schema({
  name: String,
  category: [{ type: mongoose.Schema.Types.ObjectId, ref: "categories" }],
  ingredients: [{ type: mongoose.Schema.Types.ObjectId, ref: "ingredients" }],
  instructions: [{ type: String, required: true }],
  image: { type: String, required: true },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const recipes = mongoose.model("Recipe", RecipeSchema);

export default recipes;
