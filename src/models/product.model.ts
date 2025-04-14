import mongoose, { Document, models, Schema } from "mongoose";
import { IProductCategory } from "./productcategory.model";

export interface IProduct extends Document {
  name: string;
  slug: string;
  description?: string;
  category: string | Schema.Types.ObjectId | IProductCategory;
  sku: string;
  price: number;
  quantityInStock: number;
  images: {
    fileId: string; // ImageKit file ID
    url: string;    // Public URL of the image
  }[];
  supplier?: string;
  userId: string | Schema.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const productSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  slug: { type: String, unique: true, lowercase: true, index: true },
  description: { type: String },
  category: { type: Schema.Types.ObjectId, ref: "ProductCategory", required: true },
  sku: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  quantityInStock: { type: Number, required: true, default: 0 },
  images: [{
    fileId: { type: String, required: true },
    url: { type: String, required: true }
  }],
  supplier: { type: String },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

productSchema.pre('save', function(next) {
  if (!this.isModified('name') && this.isNew) {
    this.slug = generateSlug(this.name);
    next();
    return;
  }
  if (this.isModified('name')) {
    this.slug = generateSlug(this.name);
  }
  next();
});

function generateSlug(name: string): string {
  const now = new Date();
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const timePart = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
  const baseSlug = `${name}-${datePart}-${timePart}`;
  return baseSlug.substring(0, 10).toLowerCase().replace(/\s+/g, '-');
}

const Product = models?.Product || mongoose.model<IProduct>("Product", productSchema);
export default Product;