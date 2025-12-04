import mongoose, { Model, Schema, Document } from "mongoose";

export interface IReply {
  user: mongoose.Schema.Types.ObjectId;
  text: string;
  likes: mongoose.Schema.Types.ObjectId[];
  createdAt: Date;
}

export interface IComment {
  user: mongoose.Schema.Types.ObjectId;
  text: string;
  likes: mongoose.Schema.Types.ObjectId[];
  replies: IReply[];
  createdAt: Date;
}

export interface IRecipe extends Document {
  name: string;
  description: string;
  category: mongoose.Schema.Types.ObjectId[];
  ingredients: mongoose.Schema.Types.ObjectId[];
  instructions: string[];
  images: string[];
  likes: mongoose.Schema.Types.ObjectId[];
  comments: IComment[];
  views: number;
  shares: number;
  isPublic: boolean;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;

  userId: mongoose.Schema.Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const RecipeSchema = new Schema({
  name: String,
  description: { type: String, default: "" },
  category: [{ type: mongoose.Schema.Types.ObjectId, ref: "categories" }],
  ingredients: [{ type: mongoose.Schema.Types.ObjectId, ref: "ingredients" }],
  instructions: [{ type: String, required: true }],
  images: [{ type: String }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    text: { type: String, required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    replies: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      text: { type: String, required: true },
      likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      createdAt: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now }
  }],
  views: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  isPublic: { type: Boolean, default: true },
  calories: { type: Number, default: 0 },
  protein: { type: Number, default: 0 },
  carbohydrates: { type: Number, default: 0 },
  fat: { type: Number, default: 0 },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  createdAt: { type: Date, default: Date.now, required: true },
  updatedAt: { type: Date, default: Date.now, required: true },
});

const recipes = mongoose.model("Recipe", RecipeSchema);

export default recipes;
