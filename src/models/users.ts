import mongoose, { Model, Schema, Document } from "mongoose";

export interface IUser {
  name: string;
  username: string;
  email: string;
  password: string;
  recipes: mongoose.Schema.Types.ObjectId[];
  favorites: mongoose.Schema.Types.ObjectId[];
  profilePicture: string;
  bio: string;
  followers: mongoose.Schema.Types.ObjectId[];
  following: mongoose.Schema.Types.ObjectId[];

  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new mongoose.Schema<IUser>({
  name: { type: String, required: true },
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  recipes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }],
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }],

  profilePicture: { type: String, default: null },
  bio: { type: String, default: null },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now, required: true },
  updatedAt: { type: Date, default: Date.now, required: true },
});

const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);

export default User;
