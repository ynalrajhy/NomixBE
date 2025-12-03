import { Request, Response, NextFunction } from "express";
import recipes from "../../models/recipes";
import categories from "../../models/categories";
import ingredientsModel from "../../models/ingredients";
import mongoose from "mongoose";
import { userType } from "../../types/user";

const parseArray = (input: any) => {
  if (!input) return [];
  if (Array.isArray(input)) return input;
  if (typeof input === "string") return input.split(",").map((i) => i.trim());
  return [input];
};

export const createRecipe = async (
  req: userType,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      name,
      category,
      ingredients,
      instructions,
      calories,
      protein,
      carbohydrates,
      fat,
    } = req.body;
    const image = req.file?.path;

    if (!image) {
      return res
        .status(400)
        .json({ success: false, message: "Image is required" });
    }

    const categoryIds = parseArray(category);
    const ingredientIds = parseArray(ingredients);
    const instructionsList = parseArray(instructions);

    const newRecipe = await recipes.create({
      name,
      category: categoryIds,
      ingredients: ingredientIds,
      instructions: instructionsList,
      calories,
      protein,
      carbohydrates,
      fat,
      image,
      userId: req.user?._id,
    });

    if (!newRecipe) {
      return res
        .status(400)
        .json({ success: false, message: "Failed to create recipe" });
    }

    if (categoryIds.length > 0) {
      await categories.updateMany(
        { _id: { $in: categoryIds } },
        { $push: { recipes: newRecipe._id } }
      );
    }

    if (ingredientIds.length > 0) {
      await ingredientsModel.updateMany(
        { _id: { $in: ingredientIds } },
        { $push: { Recipe: newRecipe._id } }
      );
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
    const recipesList = await recipes
      .find()
      .populate("category", "name")
      .populate("ingredients", "name")
      .populate("userId", "username");

    res.status(200).json({
      success: true,
      data: recipesList,
    });
  } catch (error) {
    next(error);
  }
};

export const getOneRecipe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const recipe = await recipes
      .findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true })
      .populate("category", "name")
      .populate("ingredients", "name")
      .populate("userId", "username")
      .populate("comments.user", "username image profilePicture");

    if (!recipe) {
      return res
        .status(404)
        .json({ success: false, message: "Recipe not found" });
    }

    res.status(200).json({
      success: true,
      data: recipe,
    });
  } catch (error) {
    next(error);
  }
};

export const updateRecipe = async (
  req: userType,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const {
      name,
      category,
      ingredients,
      instructions,
      calories,
      protein,
      carbohydrates,
      fat,
    } = req.body;
    const image = req.file?.path;

    const recipe = await recipes.findById(id);
    if (!recipe) {
      return res
        .status(404)
        .json({ success: false, message: "Recipe not found" });
    }

    if (recipe.userId.toString() !== req.user?._id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (instructions) updateData.instructions = parseArray(instructions);
    if (category) updateData.category = parseArray(category);
    if (ingredients) updateData.ingredients = parseArray(ingredients);
    if (calories) updateData.calories = calories;
    if (protein) updateData.protein = protein;
    if (carbohydrates) updateData.carbohydrates = carbohydrates;
    if (fat) updateData.fat = fat;
    if (image) updateData.image = image;

    const updatedRecipe = await recipes.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    res.status(200).json({
      success: true,
      data: updatedRecipe,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteRecipe = async (
  req: userType,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const recipe = await recipes.findById(id);

    if (!recipe) {
      return res
        .status(404)
        .json({ success: false, message: "Recipe not found" });
    }

    if (recipe.userId.toString() !== req.user?._id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await recipes.findByIdAndDelete(id);

    await categories.updateMany(
      { recipes: new mongoose.Types.ObjectId(id) as any },
      { $pull: { recipes: new mongoose.Types.ObjectId(id) } }
    );
    await ingredientsModel.updateMany(
      { Recipe: new mongoose.Types.ObjectId(id) as any },
      { $pull: { Recipe: new mongoose.Types.ObjectId(id) } }
    );

    res.status(200).json({
      success: true,
      message: "Recipe deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getRecipesByCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { categoryId } = req.params;
    const recipesList = await recipes.find({
      category: new mongoose.Types.ObjectId(categoryId),
    });
    res.status(200).json({
      success: true,
      data: recipesList,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleLikeRecipe = async (
  req: userType,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const recipe = await recipes.findById(id);

    if (!recipe) {
      return res
        .status(404)
        .json({ success: false, message: "Recipe not found" });
    }

    const userId = new mongoose.Types.ObjectId(req.user?._id);
    const isLiked = recipe.likes.includes(userId);

    if (isLiked) {
      await recipes.findByIdAndUpdate(id, { $pull: { likes: userId } });
    } else {
      await recipes.findByIdAndUpdate(id, { $push: { likes: userId } });
    }

    const updatedRecipe = await recipes.findById(id);

    res.status(200).json({
      success: true,
      data: updatedRecipe,
      message: isLiked ? "Recipe unliked" : "Recipe liked",
    });
  } catch (error) {
    next(error);
  }
};

export const addComment = async (
  req: userType,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    const recipe = await recipes.findById(id);
    if (!recipe) {
      return res
        .status(404)
        .json({ success: false, message: "Recipe not found" });
    }

    const newComment = {
      user: req.user?._id,
      text,
      createdAt: new Date(),
    };

    const updatedRecipe = await recipes
      .findByIdAndUpdate(
        id,
        { $push: { comments: newComment } },
        { new: true }
      )
      .populate("comments.user", "username image profilePicture");

    res.status(200).json({
      success: true,
      data: updatedRecipe,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (
  req: userType,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id, commentId } = req.params;

    const recipe = await recipes.findById(id);
    if (!recipe) {
      return res
        .status(404)
        .json({ success: false, message: "Recipe not found" });
    }

    const updatedRecipe = await recipes
      .findByIdAndUpdate(
        id,
        { $pull: { comments: { _id: commentId } } },
        { new: true }
      )
      .populate("comments.user", "username image profilePicture");

    res.status(200).json({
      success: true,
      data: updatedRecipe,
    });
  } catch (error) {
    next(error);
  }
};
