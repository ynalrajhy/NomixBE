import { Request, Response, NextFunction } from "express";
import ingredients from "../../models/ingredients";

export const createIngredient = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name } = req.body;
    const ingredient = await ingredients.create({ name });
    res.status(201).json({
      success: true,
      data: ingredient,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllIngredients = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const ingredientsList = await ingredients.find();
    res.status(200).json({
      success: true,
      data: ingredientsList,
    });
  } catch (error) {
    next(error);
  }
};
