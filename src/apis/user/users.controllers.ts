import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import users from "../../models/users";
import User from "../../models/users";

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, email, password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    const findUser = await User.findOne({ username: username });
    if (findUser) {
      return res.status(400).json({ message: "User already exists" });
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        username,
        email,
        password: hashedPassword,
      });
      if (!user) {
        return res.status(400).json({ message: "Failed to create user" });
      }
      const token = jwt.sign(
        { _id: user._id, username: user.username, email: user.email },
        process.env.JWT_SECRET as string,
        { expiresIn: "1h" }
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

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username: username });
    if (!user) {
      return res
        .status(400)
        .json({ message: "User not found, please sign up" });
    } else {
      const ismatch = await bcrypt.compare(password, user.password);
      if (!ismatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      } else {
        const token = jwt.sign(
          { _id: user._id, username: user.username, email: user.email },
          process.env.JWT_SECRET as string,
          { expiresIn: "1h" }
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

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const usersList = await users.find();
    res.status(200).json({
      success: true,
      data: usersList,
    });
  } catch (error) {
    next(error);
  }
};
