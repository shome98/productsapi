// src/controllers/product.controller.ts
import { Request, Response } from "express";
import Product from "../models/product.model";
import ImageKit from "imagekit";
import dotenv from "dotenv";

dotenv.config();
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || 'YOUR_PUBLIC_KEY',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || 'YOUR_PRIVATE_KEY',
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || 'YOUR_URL_ENDPOINT'
});

export const getProductsController = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: "🚫 Unauthorized. Please log in to retrieve products." });
    }

    const products = await Product.find({ userId }).populate('category').lean();

    if (!products) {
      return res.status(404).json({ error: "🚫 Failed to retrieve products." });
    }

    return res.status(200).json({ message: "✅ Successfully fetched the products.", products });

  } catch (error) {
    console.error("❌ Error retrieving the products:", error);
    return res.status(500).json({ error: "⚠️ Oops! Failed to retrieve the products. Please try again." });
  }
};

export const createProductController = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: "🚫 Unauthorized. Please log in to add products." });
        }

        const { name, description, category, sku, price, quantityInStock, supplier } = req.body;
        const files = req.files as Express.Multer.File[];

        if (!name || !category || !sku || price === undefined || quantityInStock === undefined) {
            return res.status(400).json({ error: "😠 Please provide all required product fields (name, category, sku, price, quantityInStock)." });
        }

        const uploadedImages: { fileId: string; url: string }[] = [];
        if (files && files.length > 0) {
            for (const file of files) {
                try {
                    const uploadResponse = await imagekit.upload({
                        file: file.buffer.toString('base64'),
                        fileName: file.originalname,
                    });
                    uploadedImages.push({ fileId: uploadResponse.fileId, url: uploadResponse.url });
                } catch (error) {
                    console.error("❌ Error uploading image to ImageKit:", error);
                    return res.status(500).json({ error: "⚠️ Failed to upload one or more images." });
                }
            }
        }

        const newProduct = await Product.create({
            name,
            description,
            category,
            sku,
            price,
            quantityInStock,
            images: uploadedImages,
            supplier,
            userId,
        });

        return res.status(201).json({ message: "✅ Product created successfully.", product: newProduct });

    } catch (error: any) {
        console.error("❌ Error creating product:", error);
        if (error.code === 11000 && error.keyPattern && error.keyPattern.sku) {
            return res.status(409).json({ error: `⚠️ Product with SKU "${req.body.sku}" already exists.` });
        }
        return res.status(500).json({ error: "⚠️ Failed to create product." });
    }
};

export const getProductByIdController = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        if (!userId) {
            return res.status(401).json({ error: "🚫 Unauthorized. Please log in to retrieve the product." });
        }

        if (!id) {
            return res.status(400).json({ error: "🚫 Not a valid param!" });
        }

        const product = await Product.findOne({ userId, _id: id }).populate('category').lean();

        if (!product) {
            return res.status(404).json({ error: "🚫 Failed to retrieve the product." });
        }

        return res.status(200).json({ message: "✅ Successfully fetched the product.", product });

    } catch (error) {
        console.error("❌ Error retrieving the product:", error);
        return res.status(500).json({ error: "⚠️ Oops! Failed to retrieve the product. Please try again." });
    }
};


export const updateProductController = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        const { name, description, category, sku, price, quantityInStock, supplier, removedImages } = req.body;
        const files = req.files as Express.Multer.File[];

        if (!userId) {
            return res.status(401).json({ error: "🚫 Unauthorized. Please log in to update products." });
        }

        if (!id) {
            return res.status(400).json({ error: "🚫 Not a valid param!" });
        }

        const existingProduct = await Product.findById(id);
        if (!existingProduct || existingProduct.userId.toString() !== userId) {
            return res.status(404).json({ error: "🚫 Product not found." });
        }

        const updatedFields: any = {
            name,
            description,
            category,
            sku,
            price,
            quantityInStock,
            supplier,
        };

        const newImages: { fileId: string; url: string }[] = [];
        if (files && files.length > 0) {
            for (const file of files) {
                try {
                    const uploadResponse = await imagekit.upload({
                        file: file.buffer.toString('base64'),
                        fileName: file.originalname,
                    });
                    newImages.push({ fileId: uploadResponse.fileId, url: uploadResponse.url });
                } catch (error: any) {
                    console.error("❌ Error uploading image to ImageKit:", error.message);
                    return res.status(500).json({ error: `⚠️ Failed to upload one or more new images: ${error.message}` });
                }
            }
            updatedFields.images = [...existingProduct.images, ...newImages];
        } else if (existingProduct.images) {
            updatedFields.images = existingProduct.images;
        }

        if (removedImages && Array.isArray(removedImages) && removedImages.length > 0) {
            const removedFileIds = removedImages.map((img: any) => img?.fileId).filter(Boolean);
            if (removedFileIds.length > 0) {
                if (updatedFields.images) {
                    updatedFields.images = updatedFields.images.filter(
                        (img: any) => !removedFileIds.includes(img.fileId)
                    );
                }
                try {
                    const bulkDeleteResult = await imagekit.bulkDeleteFiles(removedFileIds);
                    console.log("✅ Images deleted from ImageKit:", bulkDeleteResult);
                } catch (error: any) {
                    console.error("❌ Error deleting images from ImageKit:", error.message);
                }
            }
        }

        const updatedProduct = await Product.findOneAndUpdate(
            { _id: id, userId },
            updatedFields,
            { new: true, runValidators: true }
        ).populate('category');

        if (!updatedProduct) {
            return res.status(404).json({ error: "🚫 Product not found or unauthorized." });
        }

        return res.status(200).json({ message: "✅ Product updated successfully.", product: updatedProduct });

    } catch (error: any) {
        console.error("❌ Error updating product:", error);
        if (error.code === 11000 && error.keyPattern && error.keyPattern.sku) {
            return res.status(409).json({ error: `⚠️ Product with SKU "${req.body.sku}" already exists.` });
        }
        return res.status(500).json({ error: "⚠️ Failed to update product." });
    }
};


export const deleteProductController = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        if (!userId) {
            return res.status(401).json({ error: "🚫 Unauthorized." });
        }

        if (!id) {
            return res.status(400).json({ error: "🚫 Invalid product ID." });
        }

        const productToDelete = await Product.findOne({ _id: id, userId });
        if (!productToDelete) {
            return res.status(404).json({ error: "🚫 Product not found or unauthorized." });
        }

        const fileIdsToDelete = productToDelete.images.map((img: any) => (img.fileId)).filter(Boolean);
        if (fileIdsToDelete.length > 0) {
            try {
                const bulkDeleteResult = await imagekit.bulkDeleteFiles(fileIdsToDelete);
                console.log("✅ Images deleted from ImageKit:", bulkDeleteResult);
            } catch (error: any) {
                console.error("❌ Error deleting images from ImageKit:", error.message);
            }
        }

        const deletedProduct = await Product.findOneAndDelete({ _id: id, userId });

        if (!deletedProduct) {
            return res.status(404).json({ error: "🚫 Failed to delete the product." });
        }

        return res.status(200).json({ message: "✅ Product deleted successfully.", product: deletedProduct });

    } catch (error: any) {
        console.error("❌ Error deleting product:", error);
        return res.status(500).json({ error: "⚠️ Failed to delete product." });
    }
};