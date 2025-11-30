import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  urls: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Url",
    },
  ],
});

const User = mongoose.model("User", UserSchema);

export default User;
