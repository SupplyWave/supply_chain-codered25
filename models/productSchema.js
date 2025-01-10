import mongoose from "mongoose";

// Approved Payment Schema (Used by the Manufacturer to track payments)
const ApprovedPaymentSchema = new mongoose.Schema({
  manufacturerName: { type: String, required: true },
  amountPaid: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  manufacturerWalletAddress: { type: String }, // Added MetaMask ID
});

// Product Schema (Used by the Manufacturer to add new products)
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
    description: { type: String, required: true },
  price: { type: Number, required: true },
  location: { type: String, required: true },
  addedBy: { type: String, required: true }, // MetaMask address of the manufacturer
  approvedPayments: [ApprovedPaymentSchema],
});

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
