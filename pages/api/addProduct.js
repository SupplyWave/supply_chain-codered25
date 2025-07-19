import dbConnect from "../../lib/dbConnect";
import Product from "../../models/productSchema";

export default async function handler(req, res) {
  await dbConnect();
  if (req.method === "POST") {
    const {
      name,
      description,
      price,
      location,
      addedBy,
      productId,
      buyer,
      transactionHash,
      amountPaid,
      customerName,
      customerWalletAddress,
    } = req.body;

    try {
      // Handle adding a new product
      if (name && description && price && location && addedBy) {
        const newProduct = new Product({
          name,
          description,
          price: Number(price),
          location,
          addedBy, // Manufacturer's MetaMask address
          category: 'Other', // Default category
          isAvailable: true,
          stock: 1,
          averageRating: 0,
          totalReviews: 0,
          viewCount: 0,
          purchaseCount: 0,
          approvedPayments: []
        });

        await newProduct.save();
        return res.status(201).json({
          success: true,
          message: "Product added successfully.",
          data: newProduct
        });
      }

      // Handle payment update
      if (productId && buyer && amountPaid) {
        // Fetch the product by ID
        const product = await Product.findById(productId);
        if (!product) {
          return res.status(404).json({ success: false, message: "Product not found." });
        }

        // Add payment details to the approvedPayments array
        product.approvedPayments.push({
          manufacturerName: customerName || "Unknown", // Use customerName or a fallback
          amountPaid,
          manufacturerWalletAddress: product.addedBy, // Manufacturer's MetaMask address
        });

        await product.save();
        return res.status(201).json({ success: true, message: "Payment updated successfully." });
      }

      return res.status(400).json({ success: false, message: "Invalid request body." });
    } catch (error) {
      console.error("Error in POST handler:", error);
      res.status(500).json({ success: false, message: "An error occurred." });
    }
  } else if (req.method === "GET") {
    try {
      const products = await Product.find();
      res.status(200).json({ success: true, data: products });
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ success: false, message: "Failed to fetch products." });
    }
  } else {
    res.status(405).json({ success: false, message: "Method not allowed." });
  }
}
