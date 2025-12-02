import { Request, Response, NextFunction } from "express";
import recipes from "../../models/recipes";
import multer from "multer";
import upload from "../../middlewares/multer";
import recipe from "../../models/recipes";
import mongoose from "mongoose";

export const createRecipe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, category, ingredients, instructions } = req.body;
    const image = req.file?.path;
    const newRecipe = await recipes.create({
      name: name,
      category: [new mongoose.Types.ObjectId(category)],
      ingredients: [new mongoose.Types.ObjectId(ingredients)],
      instructions: [instructions],
      image: image,
    });
    if (!newRecipe) {
      return res
        .status(400)
        .json({ success: false, message: "Failed to create recipe" });
    }
    if (category) {
      category.recipes.push(newRecipe._id);
      await category.save();
    }
    if (ingredients) {
      ingredients.Recipe.push(newRecipe._id);
      await ingredients.save();
    }
    return res.status(201).json({ success: true, data: newRecipe });
  } catch (error) {
    next(error);
  }
};

export const getAllRecipes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const recipesList = await recipes.find();
    res.status(200).json({
      success: true,
      data: recipesList,
    });
  } catch (error) {
    next(error);
  }
};

export const updateRecipe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { name, category, ingredients, instructions } = req.body;
    const image = req.file?.path;
    const updatedRecipe = await recipes.findByIdAndUpdate(
      id,
      { name, category, ingredients, instructions, image },
      { new: true }
    );
    res.status(200).json({
      success: true,
      data: updatedRecipe,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteRecipe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    await recipes.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: "Recipe deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getRecsipesbyCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { category } = req.params;
    const recipesList = await recipes.find({
      categories: new mongoose.Types.ObjectId(category),
    });
    res.status(200).json({
      success: true,
      data: recipesList,
    });
  } catch (error) {
    next(error);
  }
};
