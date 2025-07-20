import dbConnect from "../../lib/dbConnect"; // Assuming you have this helper to connect to DB
import RawMaterial from "../../models/RawMaterial"; // Import the RawMaterial model

export default async function handler(req, res) {
  await dbConnect();

  const { method } = req;

  switch (method) {
    case "POST":
      try {
        const {
          name, price, location, addedBy, manufacturerName, amountPaid, t_id,
          // New comprehensive fields
          category, description, technicalSpecs, materialType,
          currency, availableStock, productImages,
          unit, quantity, isAvailable
        } = req.body;

        // Ensure the required fields are provided
        if (!name || !price || !location || !addedBy) {
          return res.status(400).json({
            success: false,
            message: "All fields are required, including MetaMask address.",
          });
        }

        // Add approved payment data (if provided)
        const approvedPayments = manufacturerName && amountPaid ? [{
          manufacturerName,
          amountPaid,
        }] : [];

        // Create a new raw material entry with comprehensive data
        const rawMaterial = await RawMaterial.create({
          // Basic fields
          name,
          price,
          location,
          addedBy,
          approvedPayments,

          // Comprehensive product details
          category: category || 'Raw Material',
          description: description || '',
          technicalSpecs: technicalSpecs || '',
          materialType: materialType || '',

          // Pricing & availability
          currency: currency || 'ETH',
          availableStock: parseInt(availableStock) || 0,
          quantity: parseInt(quantity) || parseInt(availableStock) || 0,

          // Additional info
          productImages: productImages || '',
          unit: unit || 'kg',
          isAvailable: isAvailable !== undefined ? isAvailable : (parseInt(availableStock) > 0)
        });

        res.status(201).json({ success: true, data: rawMaterial });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case "GET":
      try {
        // Fetch all raw materials from the database, excluding those with 0 stock
        const rawMaterials = await RawMaterial.find({
          $or: [
            { quantity: { $gt: 0 } },
            { availableStock: { $gt: 0 } },
            { quantity: { $exists: false } },
            { availableStock: { $exists: false } }
          ]
        });

        // Return raw materials data
        res.status(200).json({ success: true, data: rawMaterials });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case "PUT":
      try {
        // Get ID from query parameter or request body
        const materialId = req.query.id || req.body.id;
        const { availableStock, quantity, isAvailable, ...updateData } = req.body;

        if (!materialId) {
          return res.status(400).json({
            success: false,
            message: "Material ID is required for updates.",
          });
        }

        // If stock is being updated to 0, delete the material
        if ((availableStock === 0 || quantity === 0) && isAvailable === false) {
          await RawMaterial.findByIdAndDelete(materialId);
          return res.status(200).json({
            success: true,
            message: "Material deleted due to zero stock.",
            deleted: true
          });
        }

        // Update the material
        const updatedMaterial = await RawMaterial.findByIdAndUpdate(
          materialId,
          {
            ...updateData,
            availableStock: availableStock !== undefined ? availableStock : undefined,
            quantity: quantity !== undefined ? quantity : availableStock,
            isAvailable: isAvailable !== undefined ? isAvailable : (availableStock > 0),
            updatedAt: new Date()
          },
          { new: true, runValidators: true }
        );

        if (!updatedMaterial) {
          return res.status(404).json({
            success: false,
            message: "Material not found.",
          });
        }

        res.status(200).json({ success: true, data: updatedMaterial });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.status(405).json({ success: false, message: "Method not allowed" });
      break;
  }
}
