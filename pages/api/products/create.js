import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';

// Simple product creation without complex schema validation
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const {
      name,
      description,
      price,
      location,
      addedBy,
      category = 'Other',
      brand = '',
      stock = 1
    } = req.body;

    // Validation
    if (!name || !description || !price || !addedBy) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, description, price, addedBy'
      });
    }

    // Verify producer exists
    const producer = await User.findByWalletAddress(addedBy);
    if (!producer || producer.role !== 'producer') {
      return res.status(400).json({
        success: false,
        message: 'Invalid producer or user is not a producer'
      });
    }

    // Use the existing Product model with proper schema
    const Product = require('../../../models/productSchema').default;

    const productData = {
      name,
      description,
      price: Number(price),
      location: location || producer.profile?.address || 'Not specified',
      addedBy,
      category,
      brand,
      stock: Number(stock),
      isAvailable: true,
      isFeatured: false,
      averageRating: 0,
      totalReviews: 0,
      viewCount: 0,
      purchaseCount: 0,
      approvedPayments: []
    };

    const newProduct = new Product(productData);
    const result = await newProduct.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: result
    });

  } catch (error) {
    console.error('Product creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during product creation'
    });
  }
}
