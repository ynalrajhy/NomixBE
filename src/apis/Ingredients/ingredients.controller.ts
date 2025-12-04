import { Request, Response, NextFunction } from "express";
import ingredients from "../../models/ingredients";
import recipes from "../../models/recipes";
import Report from "../../models/reports";
import mongoose from "mongoose";

export const createIngredient = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, quantity } = req.body;
    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Ingredient name is required" });
    }

    const existingIngredient = await ingredients.findOne({ name });
    if (existingIngredient) {
      return res.status(400).json({
        success: false,
        message: "Ingredient already exists",
      });
    }

    const ingredient = await ingredients.create({ name, quantity });
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

export const getOneIngredient = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const ingredient = await ingredients.findById(id).populate("Recipe", "name");
    if (!ingredient) {
      return res
        .status(404)
        .json({ success: false, message: "Ingredient not found" });
    }
    res.status(200).json({
      success: true,
      data: ingredient,
    });
  } catch (error) {
    next(error);
  }
};

export const updateIngredient = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { name, quantity } = req.body;

    const ingredient = await ingredients.findByIdAndUpdate(
      id,
      { name, quantity },
      { new: true }
    );

    if (!ingredient) {
      return res
        .status(404)
        .json({ success: false, message: "Ingredient not found" });
    }

    res.status(200).json({
      success: true,
      data: ingredient,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteIngredient = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const ingredient = await ingredients.findByIdAndDelete(id);

    if (!ingredient) {
      return res
        .status(404)
        .json({ success: false, message: "Ingredient not found" });
    }

    // Remove this ingredient from all recipes that use it
    await recipes.updateMany(
      { ingredients: id },
      { $pull: { ingredients: id } }
    );

    res.status(200).json({
      success: true,
      message: "Ingredient deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Admin functions
export const getAllIngredientsAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const ingredientsList = await ingredients
      .find()
      .populate("Recipe", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: ingredientsList,
      total: ingredientsList.length,
    });
  } catch (error) {
    next(error);
  }
};

export const adminDeleteIngredient = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const ingredient = await ingredients.findByIdAndDelete(id);

    if (!ingredient) {
      return res
        .status(404)
        .json({ success: false, message: "Ingredient not found" });
    }

    // Remove this ingredient from all recipes that use it
    await recipes.updateMany(
      { ingredients: id },
      { $pull: { ingredients: id } }
    );

    res.status(200).json({
      success: true,
      message: "Ingredient deleted successfully by admin",
    });
  } catch (error) {
    next(error);
  }
};

export const getReportsForIngredient = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const ingredient = await ingredients.findById(id);

    if (!ingredient) {
      return res
        .status(404)
        .json({ success: false, message: "Ingredient not found" });
    }

    const reportsForIngredient = await Report.find({
      targetType: "ingredient",
      targetId: new mongoose.Types.ObjectId(id),
    })
      .populate("reporter", "username email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: reportsForIngredient,
      total: reportsForIngredient.length,
    });
  } catch (error) {
    next(error);
  }
};
