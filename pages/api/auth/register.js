import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const {
      username,
      email,
      password,
      confirmPassword,
      walletAddress,
      role,
      profile
    } = req.body;

    // Validation
    if (!username || !email || !password || !confirmPassword || !walletAddress || !role || !profile?.name || !profile?.address) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: username, email, password, confirmPassword, walletAddress, role, name, and address'
      });
    }

    // Check password match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    // Check password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Validate role
    if (!['supplier', 'producer', 'customer'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be supplier, producer, or customer'
      });
    }

    // Validate wallet address format (basic check)
    if (!walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid wallet address format'
      });
    }

    // Check if username already exists
    const existingUsername = await User.findByUsername(username);
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists'
      });
    }

    // Check if email already exists
    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    // Check if wallet address already exists
    const existingWallet = await User.findByWalletAddress(walletAddress);
    if (existingWallet) {
      return res.status(400).json({
        success: false,
        message: 'Wallet address already registered'
      });
    }

    // Create new user
    const newUser = new User({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password,
      walletAddress: walletAddress.toLowerCase(),
      role,
      profile: {
        name: profile.name,
        address: profile.address,
        company: profile.company || '',
        phone: profile.phone || '',
        bio: profile.bio || ''
      }
    });

    await newUser.save();

    // Return success (without password)
    const userResponse = newUser.toJSON();
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: userResponse
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error during registration'
    });
  }
}
