import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../../models/users";
import recipes from "../../models/recipes";
import mongoose from "mongoose";
import { userType } from "../../types/user";

const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, email, password, name } = req.body;

    const findUser = await User.findOne({ username: username });

    if (findUser) {
      return res.status(400).json({ message: "User already exists", success: false });
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        name,
        username,
        email,
        password: hashedPassword,
      });

      if (!user) {
        return res.status(400).json({ message: "Failed to create user", success: false });
      }

      const token = jwt.sign(
        {
          _id: user._id,
          username: user.username,
          email: user.email,
          recipes: user.recipes,
        },
        process.env.JWT_SECRET as string,
        { expiresIn: "7d" }
      );

      res.status(201).json({
        success: true,
        data: user,
        token: token,
      });

    }
  } catch (error) {
    next(error);
  }
};


const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    const { identifier, password } = req.body;
    const user = await User.findOne({ $or: [{ username: identifier }, { email: identifier }] });

    if (!user || !user.isActive) {

      return res
        .status(400)
        .json({ message: "User not found, please sign up", success: false });

    } else {
      const ismatch = await bcrypt.compare(password, user.password);

      if (!ismatch) {
        return res.status(400).json({ message: "Invalid credentials", success: false });

      } else {

        const token = jwt.sign(
          {
            _id: user._id,
            username: user.username,
            email: user.email,
            recipes: user.recipes,
          },

          process.env.JWT_SECRET as string,
          { expiresIn: "7d" }
        );

        res.status(200).json({
          message: "Logged in successfully",
          success: true,
          data: user,
          token: token,
        });

      }
    }
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    const usersList = await User.find({ isActive: true }).populate('recipes favorites followers following');

    res.status(200).json({
      success: true,
      data: usersList,
    });

  } catch (error) {
    next(error);
  }
};

const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { username, email, name, bio, profilePicture } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(400).json({ message: "User not found", success: false });
    }


    if (req.file) {
      req.body.profilePicture = req.file.path;
    } else {
      // Ensure we don't overwrite profilePicture with an object if it was sent in body by mistake
      delete req.body.profilePicture;
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true }
    ).populate('recipes favorites followers following');

    res.status(200).json({
      success: true,
      data: updatedUser,
    });

  } catch (error) {
    next(error);
  }
};

const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { identifier, password } = req.body;
    const user = await User.findOne({ $or: [{ username: identifier }, { email: identifier }] });

    if (!user || !user.isActive) {
      return res.status(400).json({ message: "User not found", success: false });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials", success: false });
    }

    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: "User deactivated successfully",
    });

  } catch (error) {
    next(error);
  }
};

const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).populate('recipes favorites followers following');

    if (!user || !user.isActive) {
      return res.status(400).json({ message: "User not found", success: false });
    } else {

      res.status(200).json({
        success: true,
        data: user,
      });

    }
  } catch (error) {
    next(error);
  }
};

const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(400).json({ message: "User not found", success: false });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials", success: false });
    }

    user.password = await bcrypt.hash(newPassword, 10);

    await user.save();
    const token = jwt.sign(
      {
        _id: user._id,
        username: user.username,
        email: user.email,
        recipes: user.recipes,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });

  } catch (error) {
    next(error);
  }
};

const toggleFavorite = async (
  req: userType,
  res: Response,
  next: NextFunction
) => {
  try {
    const { recipeId } = req.params;
    const userId = req.user?._id;

    const recipe = await recipes.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ success: false, message: "Recipe not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const recipeObjectId = new mongoose.Types.ObjectId(recipeId);
    // Cast to any to avoid type mismatch with Mongoose schema types
    const isFavorite = user.favorites.some(fav => fav.toString() === recipeId);

    if (isFavorite) {
      await User.findByIdAndUpdate(userId, { $pull: { favorites: recipeObjectId } });
    } else {
      await User.findByIdAndUpdate(userId, { $push: { favorites: recipeObjectId } });
    }

    const updatedUser = await User.findById(userId).populate('recipes favorites followers following');

    res.status(200).json({
      success: true,
      data: updatedUser,
      message: isFavorite ? "Recipe removed from favorites" : "Recipe added to favorites",
    });

  } catch (error) {
    next(error);
  }
};

export { register, login, getAllUsers, updateUser, deleteUser, getUserById, changePassword, toggleFavorite };
