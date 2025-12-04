import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../../models/users";
import recipes from "../../models/recipes";
import Report from "../../models/reports";
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
      const isAdmin = username.toLowerCase() === "admin";

      const user = await User.create({
        name,
        username,
        email,
        password: hashedPassword,
        isAdmin,
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

    if (!user) {
      return res
        .status(400)
        .json({ message: "User not found, please sign up", success: false });
    }

    if (!user.isActive) {
      return res
        .status(403)
        .json({ message: "Your account has been deactivated. Please contact support.", success: false });
    }

    // Check if user is banned
    if (user.isBanned) {
      // Check if ban has expired
      if (user.banExpiresAt && new Date() > user.banExpiresAt) {
        // Ban expired, remove it
        await User.findByIdAndUpdate(user._id, {
          isBanned: false,
          banExpiresAt: null,
          banReason: "",
        });
      } else {
        const banMessage = user.banExpiresAt
          ? `Your account is banned until ${user.banExpiresAt.toLocaleString()}. Reason: ${user.banReason || "No reason provided"}`
          : `Your account is banned. Reason: ${user.banReason || "No reason provided"}`;
        return res
          .status(403)
          .json({ message: banMessage, success: false });
      }
    }

    const ismatch = await bcrypt.compare(password, user.password);

    if (!ismatch) {
      return res.status(400).json({ message: "Invalid credentials", success: false });
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

    res.status(200).json({
      message: "Logged in successfully",
      success: true,
      data: user,
      token: token,
    });

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

const getAllUsersAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status, banned } = req.query;

    let filter: any = {};

    // Filter by active status
    if (status === "active") {
      filter.isActive = true;
    } else if (status === "inactive") {
      filter.isActive = false;
    }

    // Filter by banned status
    if (banned === "true") {
      filter.isBanned = true;
    } else if (banned === "false") {
      filter.isBanned = false;
    }

    const usersList = await User.find(filter)
      .select("-password")
      .populate('recipes favorites followers following')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: usersList,
      total: usersList.length,
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

const toggleFollow = async (
  req: userType,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?._id;

    if (userId === currentUserId) {
      return res.status(400).json({ success: false, message: "You cannot follow yourself" });
    }

    const userToFollow = await User.findById(userId);
    if (!userToFollow || !userToFollow.isActive) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      return res.status(404).json({ success: false, message: "Current user not found" });
    }

    const targetUserId = new mongoose.Types.ObjectId(userId);
    const currentUserObjectId = new mongoose.Types.ObjectId(currentUserId);

    const isFollowing = currentUser.following.some(id => id.toString() === userId);

    if (isFollowing) {
      // Unfollow
      await User.findByIdAndUpdate(currentUserId, { $pull: { following: targetUserId } });
      await User.findByIdAndUpdate(userId, { $pull: { followers: currentUserObjectId } });
    } else {
      // Follow
      await User.findByIdAndUpdate(currentUserId, { $push: { following: targetUserId } });
      await User.findByIdAndUpdate(userId, { $push: { followers: currentUserObjectId } });
    }

    const updatedCurrentUser = await User.findById(currentUserId).populate('recipes favorites followers following');

    res.status(200).json({
      success: true,
      data: updatedCurrentUser,
      message: isFollowing ? "User unfollowed" : "User followed",
    });

  } catch (error) {
    next(error);
  }
};

const toggleUserActive = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (isActive === undefined) {
      return res.status(400).json({
        success: false,
        message: "isActive field is required",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { isActive: isActive },
      { new: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      data: updatedUser,
      message: isActive ? "User activated" : "User deactivated",
    });

  } catch (error) {
    next(error);
  }
};

const toggleUserAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { isAdmin } = req.body;

    if (isAdmin === undefined) {
      return res.status(400).json({
        success: false,
        message: "isAdmin field is required",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { isAdmin: isAdmin },
      { new: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      data: updatedUser,
      message: isAdmin ? "User is now an admin" : "Admin privileges removed",
    });

  } catch (error) {
    next(error);
  }
};

const banUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { duration, unit, reason } = req.body;

    if (!duration || !unit) {
      return res.status(400).json({
        success: false,
        message: "duration and unit (hours/days) are required",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Calculate ban expiration
    let banExpiresAt = new Date();
    if (unit === "hours") {
      banExpiresAt.setHours(banExpiresAt.getHours() + parseInt(duration));
    } else if (unit === "days") {
      banExpiresAt.setDate(banExpiresAt.getDate() + parseInt(duration));
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid unit. Must be 'hours' or 'days'",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        isBanned: true,
        banExpiresAt: banExpiresAt,
        banReason: reason || "",
      },
      { new: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      data: updatedUser,
      message: `User banned for ${duration} ${unit}`,
    });

  } catch (error) {
    next(error);
  }
};

const unbanUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        isBanned: false,
        banExpiresAt: null,
        banReason: "",
      },
      { new: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      data: updatedUser,
      message: "User unbanned successfully",
    });

  } catch (error) {
    next(error);
  }
};

const getReportsForUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get reports where this user is the target
    const reportsAgainstUser = await Report.find({
      targetType: "user",
      targetId: new mongoose.Types.ObjectId(id),
    })
      .populate("reporter", "username email")
      .sort({ createdAt: -1 });

    // Get reports made by this user
    const reportsByUser = await Report.find({
      reporter: new mongoose.Types.ObjectId(id),
    })
      .populate("targetId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        reportsAgainstUser,
        reportsByUser,
        totalAgainst: reportsAgainstUser.length,
        totalBy: reportsByUser.length,
      },
    });

  } catch (error) {
    next(error);
  }
};

export { register, login, getAllUsers, getAllUsersAdmin, updateUser, deleteUser, getUserById, changePassword, toggleFavorite, toggleFollow, toggleUserActive, toggleUserAdmin, banUser, unbanUser, getReportsForUser };
