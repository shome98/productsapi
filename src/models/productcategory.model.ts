import mongoose, { Document, models, Schema } from "mongoose";

export interface IProductCategory extends Document{
  name: string;
  userId: string | Schema.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const productCategorySchema = new Schema<IProductCategory>({
  name: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

function capitalizeFirstLetter(str:string) {
    return str.replace(/\b\w/g, char => char.toUpperCase());
}

productCategorySchema.pre('save', function (next) {
    if (this.isModified("name")) {
        this.name = capitalizeFirstLetter(this.name);
    }
    next();
});

const ProductCategory = models?.ProductCategory || mongoose.model<IProductCategory>("ProductCategory", productCategorySchema);
export default ProductCategory;