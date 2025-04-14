import express from "express";
import { getCategoriesController, createCategoryController, getCategoryByIdController, updateCategoryController, deleteCategoryController, } from "../controllers/category.controller";
import { auth } from "../middleware/auth.middleware";
import { asyncHandler } from "../utils/promiseHandler";

const router = express.Router();

router.use(asyncHandler(auth));

router.get("/", asyncHandler(getCategoriesController));
router.post("/", asyncHandler(createCategoryController));
router.get("/:id", asyncHandler(getCategoryByIdController));
router.put("/:id", asyncHandler(updateCategoryController));
router.delete("/:id", asyncHandler(deleteCategoryController));

export default router;