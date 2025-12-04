import { Request, Response, NextFunction } from "express";
import categories from "../../models/categories";
import recipes from "../../models/recipes";
import Report from "../../models/reports";
import mongoose from "mongoose";

const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Category name is required" });
    }

    const existingCategory = await categories.findOne({ name });
    if (existingCategory) {
      return res
        .status(400)
        .json({ success: false, message: "Category already exists" });
    }

    const category = await categories.create({ name });

    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

const getAllCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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

const getOneCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const category = await categories.findById(id).populate("recipes", "name");

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const category = await categories.findByIdAndUpdate(
      id,
      { name },
      { new: true }
    );

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const category = await categories.findByIdAndDelete(id);

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    // Remove this category from all recipes that use it
    await recipes.updateMany(
      { category: id },
      { $pull: { category: id } }
    );

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

const getRandomCategoriesWithRecipes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get 10 random categories
    const randomCategories = await categories.aggregate([
      { $sample: { size: 10 } },
    ]);

    // For each category, get a random public recipe
    const result = await Promise.all(
      randomCategories.map(async (category) => {
        const randomRecipe = await recipes.aggregate([
          {
            $match: {
              category: category._id,
              isPublic: true,
            },
          },
          { $sample: { size: 1 } },
        ]);

        return {
          category: {
            _id: category._id,
            name: category.name,
          },
          recipe: randomRecipe.length > 0 ? randomRecipe[0] : null,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};


// Admin functions
const getAllCategoriesAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categoriesList = await categories
      .find()
      .populate("recipes", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: categoriesList,
      total: categoriesList.length,
    });
  } catch (error) {
    next(error);
  }
};

const adminDeleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const category = await categories.findByIdAndDelete(id);

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    // Remove this category from all recipes that use it
    await recipes.updateMany(
      { category: id },
      { $pull: { category: id } }
    );

    res.status(200).json({
      success: true,
      message: "Category deleted successfully by admin",
    });
  } catch (error) {
    next(error);
  }
};

const getReportsForCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const category = await categories.findById(id);

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    const reportsForCategory = await Report.find({
      targetType: "category",
      targetId: new mongoose.Types.ObjectId(id),
    })
      .populate("reporter", "username email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: reportsForCategory,
      total: reportsForCategory.length,
    });
  } catch (error) {
    next(error);
  }
};

export {
  createCategory,
  getAllCategories,
  getOneCategory,
  updateCategory,
  deleteCategory,
  getRandomCategoriesWithRecipes,
  getAllCategoriesAdmin,
  adminDeleteCategory,
  getReportsForCategory,
};
