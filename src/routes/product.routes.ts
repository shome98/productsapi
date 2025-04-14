import express from "express";
import { auth } from "../middleware/auth.middleware";
import { asyncHandler } from "../utils/promiseHandler";
import { getProductsController, createProductController, getProductByIdController, updateProductController, deleteProductController, } from "../controllers/product.controller";
import multer from "multer";

const router = express.Router();
const upload = multer();

router.use(asyncHandler(auth));

router.get("/", asyncHandler(getProductsController));
router.post("/", upload.array('images', 5), asyncHandler(createProductController));
router.get("/:id", asyncHandler(getProductByIdController));
router.put("/:id", upload.array('images', 5), asyncHandler(updateProductController));
router.delete("/:id", asyncHandler(deleteProductController));

export default router;