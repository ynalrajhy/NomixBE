import mongoose, { Model, Schema, Document} from "mongoose";

export interface IUser {
  username: string;
  email: string;
  password: string;
  recipes: mongoose.Schema.Types.ObjectId[];
}

const UserSchema = new mongoose.Schema<IUser>({
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
 recipes: [{ type: mongoose.Schema.Types.ObjectId, ref: "recipes" }],
  
});

const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);

export default User;
