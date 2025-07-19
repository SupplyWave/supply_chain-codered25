import mongoose from "mongoose";

const ApprovedPaymentSchema = new mongoose.Schema({
  manufacturerName: { type: String, required: true },
  amountPaid: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  manufacturerWalletAddress: { type: String }, // Added MetaMask ID
});

const RawMaterialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  location: { type: String, required: true },
  addedBy: { type: String, required: true }, 
  t_id:{type:String},// MetaMask address of the user
  approvedPayments: [ApprovedPaymentSchema],
});

export default mongoose.models.RawMaterial ||
  mongoose.model("RawMaterial", RawMaterialSchema);
