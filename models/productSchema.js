import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  type: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
