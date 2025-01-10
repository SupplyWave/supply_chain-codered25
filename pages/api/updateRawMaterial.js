// pages/api/updateRawMaterial.js
import db from '../../lib/dbConnect'; // Replace with your actual DB connection
import RawMaterial from '../../models/RawMaterial'; // Import the RawMaterial model

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { materialId, buyer, transactionHash, amountPaid, manufacturerName,manufacturerWalletAddress } = req.body;

    try {
      // Validate the request data
      if (!materialId || !buyer || !transactionHash || !amountPaid || !manufacturerName) {
        return res.status(400).json({ success: false, message: "Missing required fields." });
      }

      // Find the raw material by its ID
      const material = await RawMaterial.findById(materialId);

      if (!material) {
        return res.status(404).json({ success: false, message: "Raw material not found." });
      }

      // Check if the transaction is valid and the payment amount matches
      if (material.price !== amountPaid) {
        return res.status(400).json({ success: false, message: "Payment amount does not match the material price." });
      }

      // Add the approved payment to the raw material's approvedPayments array
      material.approvedPayments.push({
        manufacturerName,
        amountPaid,
        date: new Date(),
        manufacturerWalletAddress
      });

      // Update the material to mark it as sold and save the buyer and transaction hash
      material.sold = true;
      material.buyer = buyer;
      material.transactionHash = transactionHash;

      // Save the updated material
      await material.save();

      res.status(200).json({ success: true, message: "Transaction successful and material updated." });
    } catch (error) {
      console.error("Error updating raw material:", error);
      res.status(500).json({ success: false, message: "Server error." });
    }
  } else {
    res.status(405).json({ success: false, message: "Method not allowed." });
  }
}
