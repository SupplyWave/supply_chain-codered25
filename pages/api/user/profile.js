import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    // Get user profile
    try {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      const user = await User.findByWalletAddress(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        data: user
      });

    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }

  } else if (req.method === 'PUT') {
    // Update user profile
    try {
      const { userId } = req.query;
      const updateData = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      const user = await User.findByWalletAddress(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Update basic profile fields
      if (updateData.profile) {
        user.profile = {
          ...user.profile,
          ...updateData.profile
        };
      }

      // Update company profile fields
      if (updateData.companyProfile) {
        user.companyProfile = {
          ...user.companyProfile,
          ...updateData.companyProfile
        };
      }

      // Update preferences
      if (updateData.preferences) {
        user.preferences = {
          ...user.preferences,
          ...updateData.preferences
        };
      }

      // Update other allowed fields
      const allowedFields = ['email', 'username'];
      allowedFields.forEach(field => {
        if (updateData[field] && updateData[field] !== user[field]) {
          user[field] = updateData[field];
        }
      });

      await user.save();

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: user
      });

    } catch (error) {
      console.error('Error updating user profile:', error);
      
      if (error.code === 11000) {
        // Duplicate key error
        const field = Object.keys(error.keyPattern)[0];
        return res.status(400).json({
          success: false,
          message: `${field} already exists`
        });
      }

      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: Object.values(error.errors).map(err => err.message)
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }

  } else {
    res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }
}
