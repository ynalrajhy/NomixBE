import mongoose from "mongoose";

const RecipeSchema = new mongoose.Schema({
    name: String,
    category: String,
    ingredients: [String],
    instructions: [String],
    image: String , 
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        
    },
});
const recipes = mongoose.model("Recipe", RecipeSchema);
export default recipes;