import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../models/users";
import dotenv from "dotenv";
import { userType } from "../types/user";

dotenv.config();

const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const mreq = req as userType;
    const header = mreq.header("authorization");
    const [scheme, token] = header?.split(" ") || [];

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    mreq.user = {
      _id: payload._id as string,
      username: payload.username as string,
      email: payload.email as string,
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export { auth };
