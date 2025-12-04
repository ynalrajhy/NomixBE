import { Request, Response, NextFunction } from "express";
import recipes from "../../models/recipes";
import categories from "../../models/categories";
import ingredientsModel from "../../models/ingredients";
import Report from "../../models/reports";
import mongoose from "mongoose";
import { userType } from "../../types/user";

const parseArray = (input: any) => {
  if (!input) return [];
  if (Array.isArray(input)) return input;
  if (typeof input === "string") return input.split(",").map((i) => i.trim());
  return [input];
};

const createRecipe = async (
  req: userType,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      name,
      description,
      category,
      ingredients,
      instructions,
      calories,
      protein,
      carbohydrates,
      fat,
      isPublic,
    } = req.body;
    const files = req.files as Express.Multer.File[];
    const images = files?.map((file) => file.path) || [];

    if (images.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "At least one image is required" });
    }

    const categoryIds = parseArray(category);
    const ingredientIds = parseArray(ingredients);
    const instructionsList = parseArray(instructions);

    const newRecipe = await recipes.create({
      name,
      description,
      category: categoryIds,
      ingredients: ingredientIds,
      instructions: instructionsList,
      calories,
      protein,
      carbohydrates,
      fat,
      isPublic: isPublic !== undefined ? isPublic : true,
      images,
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

const getAllRecipes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const recipesList = await recipes
      .find({ isPublic: true })
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

const getOneRecipe = async (
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
      .populate("comments.user", "username image profilePicture")
      .populate("comments.replies.user", "username image profilePicture");

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

const updateRecipe = async (
  req: userType,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      category,
      ingredients,
      instructions,
      calories,
      protein,
      carbohydrates,
      fat,
      isPublic,
      removeImages,
      replaceImages,
    } = req.body;
    const files = req.files as Express.Multer.File[];
    const newImages = files?.map((file) => file.path) || [];

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
    if (description !== undefined) updateData.description = description;
    if (instructions) updateData.instructions = parseArray(instructions);
    if (category) updateData.category = parseArray(category);
    if (ingredients) updateData.ingredients = parseArray(ingredients);
    if (calories) updateData.calories = calories;
    if (protein) updateData.protein = protein;
    if (carbohydrates) updateData.carbohydrates = carbohydrates;
    if (fat) updateData.fat = fat;
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    // Handle images update
    if (newImages.length > 0) {
      if (replaceImages === "true" || replaceImages === true) {
        // Replace all images with new ones
        updateData.images = newImages;
      } else {
        // Add new images to existing ones
        updateData.images = [...recipe.images, ...newImages];
      }
    }

    // Remove specific images
    if (removeImages) {
      const imagesToRemove = parseArray(removeImages);
      const currentImages = updateData.images || recipe.images;
      updateData.images = currentImages.filter(
        (img: string) => !imagesToRemove.includes(img)
      );
    }

    // Ensure at least one image remains
    if (updateData.images !== undefined && updateData.images.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "At least one image is required" });
    }

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

const addImagesToRecipe = async (
  req: userType,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const files = req.files as Express.Multer.File[];
    const newImages = files?.map((file) => file.path) || [];

    if (newImages.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "At least one image is required" });
    }

    const recipe = await recipes.findById(id);
    if (!recipe) {
      return res
        .status(404)
        .json({ success: false, message: "Recipe not found" });
    }

    if (recipe.userId.toString() !== req.user?._id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const updatedRecipe = await recipes.findByIdAndUpdate(
      id,
      { $push: { images: { $each: newImages } } },
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

const removeImageFromRecipe = async (
  req: userType,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res
        .status(400)
        .json({ success: false, message: "Image URL is required" });
    }

    const recipe = await recipes.findById(id);
    if (!recipe) {
      return res
        .status(404)
        .json({ success: false, message: "Recipe not found" });
    }

    if (recipe.userId.toString() !== req.user?._id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // Ensure at least one image remains
    if (recipe.images.length <= 1) {
      return res
        .status(400)
        .json({ success: false, message: "Cannot remove the last image. At least one image is required" });
    }

    const updatedRecipe = await recipes.findByIdAndUpdate(
      id,
      { $pull: { images: imageUrl } },
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

const deleteRecipe = async (
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

const getRecipesByCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { categoryId } = req.params;
    const recipesList = await recipes.find({
      category: new mongoose.Types.ObjectId(categoryId),
      isPublic: true,
    });
    res.status(200).json({
      success: true,
      data: recipesList,
    });
  } catch (error) {
    next(error);
  }
};

const getRecipesByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const recipesList = await recipes
      .find({ userId: new mongoose.Types.ObjectId(userId) })
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

const getRandomRecipe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const randomRecipe = await recipes.aggregate([
      { $match: { isPublic: true } },
      { $sample: { size: 1 } },
    ]);

    if (!randomRecipe || randomRecipe.length === 0) {
      return res.status(404).json({ success: false, message: "No recipes found" });
    }

    const populatedRecipe = await recipes
      .findById(randomRecipe[0]._id)
      .populate("category", "name")
      .populate("ingredients", "name")
      .populate("userId", "username");

    res.status(200).json({
      success: true,
      data: populatedRecipe,
    });
  } catch (error) {
    next(error);
  }
};

const toggleLikeRecipe = async (
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

const addComment = async (
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
      likes: [],
      replies: [],
      createdAt: new Date(),
    };

    const updatedRecipe = await recipes
      .findByIdAndUpdate(
        id,
        { $push: { comments: newComment } },
        { new: true }
      )
      .populate("comments.user", "username image profilePicture")
      .populate("comments.replies.user", "username image profilePicture");

    res.status(200).json({
      success: true,
      data: updatedRecipe,
    });
  } catch (error) {
    next(error);
  }
};

const deleteComment = async (
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
      .populate("comments.user", "username image profilePicture")
      .populate("comments.replies.user", "username image profilePicture");

    res.status(200).json({
      success: true,
      data: updatedRecipe,
    });
  } catch (error) {
    next(error);
  }
};

const toggleLikeComment = async (
  req: userType,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id, commentId } = req.params;
    const userId = new mongoose.Types.ObjectId(req.user?._id);

    const recipe = await recipes.findById(id);
    if (!recipe) {
      return res
        .status(404)
        .json({ success: false, message: "Recipe not found" });
    }

    const comment = recipe.comments.find(
      (c: any) => c._id.toString() === commentId
    );
    if (!comment) {
      return res
        .status(404)
        .json({ success: false, message: "Comment not found" });
    }

    const isLiked = comment.likes.some(
      (likeId: any) => likeId.toString() === req.user?._id
    );

    if (isLiked) {
      await recipes.updateOne(
        { _id: id, "comments._id": commentId },
        { $pull: { "comments.$.likes": userId } }
      );
    } else {
      await recipes.updateOne(
        { _id: id, "comments._id": commentId },
        { $push: { "comments.$.likes": userId } }
      );
    }

    const updatedRecipe = await recipes
      .findById(id)
      .populate("comments.user", "username image profilePicture")
      .populate("comments.replies.user", "username image profilePicture");

    res.status(200).json({
      success: true,
      data: updatedRecipe,
      message: isLiked ? "Comment unliked" : "Comment liked",
    });
  } catch (error) {
    next(error);
  }
};

const addReplyToComment = async (
  req: userType,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id, commentId } = req.params;
    const { text } = req.body;

    const recipe = await recipes.findById(id);
    if (!recipe) {
      return res
        .status(404)
        .json({ success: false, message: "Recipe not found" });
    }

    const comment = recipe.comments.find(
      (c: any) => c._id.toString() === commentId
    );
    if (!comment) {
      return res
        .status(404)
        .json({ success: false, message: "Comment not found" });
    }

    const newReply = {
      user: req.user?._id,
      text,
      likes: [],
      createdAt: new Date(),
    };

    await recipes.updateOne(
      { _id: id, "comments._id": commentId },
      { $push: { "comments.$.replies": newReply } }
    );

    const updatedRecipe = await recipes
      .findById(id)
      .populate("comments.user", "username image profilePicture")
      .populate("comments.replies.user", "username image profilePicture");

    res.status(200).json({
      success: true,
      data: updatedRecipe,
    });
  } catch (error) {
    next(error);
  }
};

const toggleLikeReply = async (
  req: userType,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id, commentId, replyId } = req.params;
    const userId = new mongoose.Types.ObjectId(req.user?._id);

    const recipe = await recipes.findById(id);
    if (!recipe) {
      return res
        .status(404)
        .json({ success: false, message: "Recipe not found" });
    }

    const comment = recipe.comments.find(
      (c: any) => c._id.toString() === commentId
    );
    if (!comment) {
      return res
        .status(404)
        .json({ success: false, message: "Comment not found" });
    }

    const reply = comment.replies.find(
      (r: any) => r._id.toString() === replyId
    );
    if (!reply) {
      return res
        .status(404)
        .json({ success: false, message: "Reply not found" });
    }

    const isLiked = reply.likes.some(
      (likeId: any) => likeId.toString() === req.user?._id
    );

    if (isLiked) {
      await recipes.updateOne(
        { _id: id },
        { $pull: { "comments.$[comment].replies.$[reply].likes": userId } },
        { arrayFilters: [{ "comment._id": commentId }, { "reply._id": replyId }] }
      );
    } else {
      await recipes.updateOne(
        { _id: id },
        { $push: { "comments.$[comment].replies.$[reply].likes": userId } },
        { arrayFilters: [{ "comment._id": commentId }, { "reply._id": replyId }] }
      );
    }

    const updatedRecipe = await recipes
      .findById(id)
      .populate("comments.user", "username image profilePicture")
      .populate("comments.replies.user", "username image profilePicture");

    res.status(200).json({
      success: true,
      data: updatedRecipe,
      message: isLiked ? "Reply unliked" : "Reply liked",
    });
  } catch (error) {
    next(error);
  }
};



// Admin functions
const getAllRecipesAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { isPublic, userId } = req.query;

    let filter: any = {};

    if (isPublic === "true") {
      filter.isPublic = true;
    } else if (isPublic === "false") {
      filter.isPublic = false;
    }

    if (userId) {
      filter.userId = new mongoose.Types.ObjectId(userId as string);
    }

    const recipesList = await recipes
      .find(filter)
      .populate("category", "name")
      .populate("ingredients", "name")
      .populate("userId", "username")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: recipesList,
      total: recipesList.length,
    });
  } catch (error) {
    next(error);
  }
};

const adminDeleteRecipe = async (
  req: Request,
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

    await recipes.findByIdAndDelete(id);

    // Remove recipe from categories
    await categories.updateMany(
      { recipes: new mongoose.Types.ObjectId(id) as any },
      { $pull: { recipes: new mongoose.Types.ObjectId(id) } }
    );

    // Remove recipe from ingredients
    await ingredientsModel.updateMany(
      { Recipe: new mongoose.Types.ObjectId(id) as any },
      { $pull: { Recipe: new mongoose.Types.ObjectId(id) } }
    );

    res.status(200).json({
      success: true,
      message: "Recipe deleted successfully by admin",
    });
  } catch (error) {
    next(error);
  }
};

const getReportsForRecipe = async (
  req: Request,
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

    const reportsForRecipe = await Report.find({
      targetType: "recipe",
      targetId: new mongoose.Types.ObjectId(id),
    })
      .populate("reporter", "username email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: reportsForRecipe,
      total: reportsForRecipe.length,
    });
  } catch (error) {
    next(error);
  }
};

export {
  createRecipe,
  getAllRecipes,
  getOneRecipe,
  updateRecipe,
  deleteRecipe,
  getRecipesByCategory,
  getRecipesByUser,
  getRandomRecipe,
  toggleLikeRecipe,
  addComment,
  deleteComment,
  toggleLikeComment,
  addReplyToComment,
  toggleLikeReply,
  addImagesToRecipe,
  removeImageFromRecipe,
  getAllRecipesAdmin,
  adminDeleteRecipe,
  getReportsForRecipe,
}