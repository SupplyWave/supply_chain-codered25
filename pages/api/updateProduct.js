// pages/api/updateRawMaterial.js
import db from "../../lib/dbConnect"; // Replace with your actual DB connection
import Product from "../../models/productSchema"; // Import the Product model

export default async function handle(req, res) {
  if (req.method === "POST") {
    const { 
      productId, 
      buyer, 
      transactionHash, 
      amountPaid, 
      manufacturerName, 
      manufacturerWalletAddress 
    } = req.body;

    try {
      // Validate the request data
      if (!productId || !buyer || !transactionHash || !amountPaid) {
        return res.status(400).json({ success: false, message: "Missing required fields." });
      }

      // Find the product by its ID
      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({ success: false, message: "Product not found." });
      }

      // Add the approved payment to the product's approvedPayments array
      product.approvedPayments.push({
        manufacturerName,
        amountPaid,
        manufacturerWalletAddress,
        date: new Date(),
      });

      // Mark the product as sold and save the buyer and transaction hash
      product.sold = true;
      product.buyer = buyer;
      product.transactionHash = transactionHash;

      // Save the updated product
      await product.save();

      res.status(200).json({ success: true, message: "Transaction successful and product updated." });
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ success: false, message: "Server error." });
    }
  } else {
    res.status(405).json({ success: false, message: "Method not allowed." });
  }
}
