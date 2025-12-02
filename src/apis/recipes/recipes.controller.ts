import { Request, Response, NextFunction } from "express";
import recipes from "../../models/recipes";
import multer from "multer";
import upload from "../../middlewares/multer";

const createRecipe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    const { name, category, ingredients, instructions } = req.body;
    const image = req.file?.path;

    const recipe = await recipes.create({
      name,
      category,
      ingredients,
      instructions,
      image,
    });

    res.status(201).json({
      success: true,
      data: recipe,
    });

  } catch (error) {
    next(error);
  }
};

const getAllRecipes = async (req: Request, res: Response, next: NextFunction) => {
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

const updateRecipe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, category, ingredients, instructions } = req.body;
    const image = req.file?.path;

    const recipe = await recipes.findByIdAndUpdate(
      id, 
      { 
        name,
        category,
        ingredients,
        instructions,
        image
      }, { new: true });

    res.status(200).json({
      success: true,
      data: recipe,
    });

  } catch (error) {
    next(error);
  }
};

const deleteRecipe = async (req: Request, res: Response, next: NextFunction) => {
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

const getRecsipesbyCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const { category } = req.params;
    const recipesList = await recipes.find({ category });

    res.status(200).json({
      success: true,
      data: recipesList,
    });

  } catch (error) {
    next(error);
  }
};

export { createRecipe, getAllRecipes, updateRecipe, deleteRecipe, getRecsipesbyCategory };