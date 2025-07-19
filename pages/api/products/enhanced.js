import dbConnect from '../../../lib/dbConnect';
import Product from '../../../models/productSchema'; // Use existing product model for now
import User from '../../../models/User';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const { 
        category, 
        search, 
        minPrice, 
        maxPrice, 
        rating, 
        brand, 
        featured, 
        recommended,
        userId,
        limit = 50,
        page = 1
      } = req.query;

      // Build query - simplified for existing product schema
      const query = {};

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
      }

      // Get user profile for personalized recommendations
      let userProfile = null;
      if (userId) {
        const user = await User.findByWalletAddress(userId);
        if (user && user.companyProfile) {
          userProfile = user.companyProfile;
        }
      }

      // Execute query
      let productsQuery = Product.find(query);

      // Sort logic - simplified
      productsQuery = productsQuery.sort({ createdAt: -1 });

      // Pagination
      const skip = (Number(page) - 1) * Number(limit);
      productsQuery = productsQuery.skip(skip).limit(Number(limit));

      const products = await productsQuery.exec();

      // Get total count for pagination
      const totalProducts = await Product.countDocuments(query);

      // For now, just use the products found
      const allProducts = products;

      res.status(200).json({
        success: true,
        data: allProducts,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(totalProducts / Number(limit)),
          totalProducts,
          hasMore: skip + allProducts.length < totalProducts
        }
      });

    } catch (error) {
      console.error('Enhanced products fetch error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  } 
  
  else if (req.method === 'POST') {
    try {
      const {
        name,
        description,
        price,
        category,
        subcategory,
        brand,
        specifications,
        customizable,
        customizationOptions,
        stock,
        targetIndustries,
        companySize,
        businessType,
        images,
        tags,
        addedBy
      } = req.body;

      // Validation
      if (!name || !description || !price || !category || !addedBy) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: name, description, price, category, addedBy'
        });
      }

      // Verify producer exists
      const producer = await User.findByWalletAddress(addedBy);
      if (!producer || producer.role !== 'producer') {
        return res.status(400).json({
          success: false,
          message: 'Invalid producer'
        });
      }

      // Create product with existing schema
      const productData = {
        name,
        description,
        price: Number(price),
        location: producer.profile.address || 'Not specified',
        addedBy
      };

      const product = new Product(productData);
      await product.save();

      res.status(201).json({
        success: true,
        message: 'Enhanced product created successfully',
        data: product
      });

    } catch (error) {
      console.error('Enhanced product creation error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
  else {
    res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }
}
