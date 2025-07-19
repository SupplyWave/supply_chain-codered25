import dbConnect from "../../lib/dbConnect"; // Assuming you have this helper to connect to DB
import RawMaterial from "../../models/RawMaterial"; // Import the RawMaterial model

export default async function handler(req, res) {
  await dbConnect();

  const { method } = req;

  switch (method) {
    case "POST":
      try {
        const { name, price, location, addedBy, manufacturerName, amountPaid,t_id} = req.body;

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

        // Create a new raw material entry with addedBy field (MetaMask address)
        const rawMaterial = await RawMaterial.create({
          name,
          price,
          location,
          addedBy,
          approvedPayments,
        });

        res.status(201).json({ success: true, data: rawMaterial });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case "GET":
      try {
        // Fetch all raw materials from the database
        const rawMaterials = await RawMaterial.find({});

        // Return raw materials data
        res.status(200).json({ success: true, data: rawMaterials });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.status(405).json({ success: false, message: "Method not allowed" });
      break;
  }
}
