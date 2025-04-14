import { Request, Response } from "express";
import ProductCategory from "../models/productcategory.model";

export const getCategoriesController = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ error: "🚫 Unauthorized. Please log in to retrieve the categories." });
        }

        const categories = await ProductCategory.find({ userId }).lean();

        if (!categories) {
            return res.status(404).json({ error: "🚫 Failed to retrieve the categories." });
        }

        return res.status(200).json({ message: "✅ Successfully fetched the categories.", categories });

    } catch (error) {
        console.error("❌ Error retrieving the categories:", error);
        return res.status(500).json({ error: "⚠️ Oops! Failed to retrieve the categories. Please try again." });
    }
};

export const createCategoryController = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ error: "🚫 Unauthorized. Please log in to add categories." });
        }

        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ error: "😠 Please enter a category name" });
        }
      
        const newCategory = await ProductCategory.create({ name, userId });

        return res.status(201).json({ message: "✅ Successfully added the new category.", category: newCategory });

    } catch (error) {
        console.error("❌ Error adding the category:", error);
        return res.status(500).json({ error: "⚠️ Oops! Failed to add the category. Please try again." });
    }
};

export const getCategoryByIdController = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        if (!userId) {
            return res.status(401).json({ error: "🚫 Unauthorized. Please log in to retrieve the category." });
        }

        if (!id) {
            return res.status(400).json({ error: "🚫 Not a valid param!" });
        }

        const category = await ProductCategory.findOne({ userId, _id: id }).lean();

        if (!category) {
            return res.status(404).json({ error: "🚫 Failed to retrieve the category." });
        }

        return res.status(200).json({ message: "✅ Successfully fetched the category.", category });

    } catch (error) {
        console.error("❌ Error retrieving the category:", error);
        return res.status(500).json({ error: "⚠️ Oops! Failed to retrieve the category. Please try again." });
    }
};

export const updateCategoryController = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        const { name } = req.body;

        if (!userId) {
            return res.status(401).json({ error: "🚫 Unauthorized. Please log in to update categories." });
        }

        if (!id) {
            return res.status(400).json({ error: "🚫 Not a valid param!" });
        }

        if (!name) {
            return res.status(400).json({ error: "😠 Please enter a category name to update" });
        }

        const category = await ProductCategory.findOneAndUpdate(
            { _id: id, userId },
            { name },
            { new: true, runValidators: true }
        );

        if (!category) {
            return res.status(404).json({ error: "🚫 Category not found or you may not have permission." });
        }

        return res.status(200).json({ message: "✅ Successfully updated the category.", category });

    } catch (error) {
        console.error("❌ Error updating the category:", error);
        return res.status(500).json({ error: "⚠️ Oops! Failed to update the category. Please try again." });
    }
};

export const deleteCategoryController = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        if (!userId) {
            return res.status(401).json({ error: "🚫 Unauthorized. Please log in to delete categories." });
        }

        if (!id) {
            return res.status(400).json({ error: "🚫 Not a valid param!" });
        }

        const deletedCategory = await ProductCategory.findOneAndDelete({ _id: id, userId });

        if (!deletedCategory) {
            return res.status(404).json({ error: "🚫 Failed to delete the category." });
        }

        return res.status(200).json({ message: "✅ Successfully deleted the category.", category: deletedCategory });

    } catch (error) {
        console.error("❌ Error deleting the category:", error);
        return res.status(500).json({ error: "⚠️ Oops! Failed to delete the category. Please try again." });
    }
};