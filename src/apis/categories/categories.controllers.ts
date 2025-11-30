import { Request, Response, NextFunction } from "express";
import categories from "../../models/categories";

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body;
    const category = await categories.create({ name });
    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

export const addRecipeToCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { categoryId, recipeId } = req.params;
    const category = await categories.findByIdAndUpdate(categoryId, { $push: { recipes: recipeId } }, { new: true });
    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categoriesList = await categories.find();
    res.status(200).json({
      success: true,
      data: categoriesList,
    });
  } catch (error) {
    next(error);
  }
};

