import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  // Authentication fields
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },

  // Blockchain fields
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  role: {
    type: String,
    required: true,
    enum: ['supplier', 'producer', 'customer']
  },

  // Profile fields
  profile: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    company: { type: String, trim: true },
    phone: { type: String, trim: true },
    bio: { type: String, trim: true }
  },

  // Company profile for recommendations and business logic
  companyProfile: {
    companyName: { type: String },
    industry: {
      type: String,
      enum: ['Manufacturing', 'Retail', 'Healthcare', 'Technology', 'Automotive', 'Food', 'Construction', 'Education', 'Government', 'Other']
    },
    companySize: {
      type: String,
      enum: ['Startup', 'Small', 'Medium', 'Large', 'Enterprise']
    },
    businessType: {
      type: String,
      enum: ['B2B', 'B2C', 'B2G', 'Wholesale', 'Retail']
    },
    annualRevenue: {
      type: String,
      enum: ['Under $1M', '$1M-$10M', '$10M-$50M', '$50M-$100M', 'Over $100M']
    },
    employeeCount: { type: Number },
    website: { type: String },
    description: { type: String },
    specializations: [{ type: String }], // What they specialize in
    certifications: [{ type: String }], // ISO, FDA, etc.
    preferredCategories: [{ type: String }], // Product categories they're interested in
    budget: {
      min: { type: Number },
      max: { type: Number },
      currency: { type: String, default: 'USD' }
    }
  },

  // Customer preferences for ecommerce
  preferences: {
    favoriteCategories: [{ type: String }],
    priceRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 10000 }
    },
    preferredBrands: [{ type: String }],
    wishlist: [{
      productId: { type: String },
      addedDate: { type: Date, default: Date.now }
    }],
    cart: [{
      productId: { type: String },
      quantity: { type: Number, default: 1 },
      customizations: { type: Object },
      addedDate: { type: Date, default: Date.now }
    }]
  },

  // Status fields
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  suppressReservedKeysWarning: true
});

// Indexes for better query performance (unique fields already have indexes)
UserSchema.index({ walletAddress: 1, role: 1 });
UserSchema.index({ role: 1, isActive: 1 });
UserSchema.index({ createdAt: -1 });

// Pre-save middleware to hash password and update timestamp
UserSchema.pre('save', async function(next) {
  this.updatedAt = new Date();

  // Hash password if it's modified
  if (this.isModified('password')) {
    const bcrypt = require('bcryptjs');
    this.password = await bcrypt.hash(this.password, 12);
  }

  next();
});

// Instance methods
UserSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

UserSchema.methods.updateProfile = function(profileData) {
  this.profile = { ...this.profile, ...profileData };
  return this.save();
};

UserSchema.methods.comparePassword = async function(candidatePassword) {
  const bcrypt = require('bcryptjs');
  return await bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password; // Remove password from JSON output
  return userObject;
};

// Static methods
UserSchema.statics.findByWalletAddress = function(walletAddress) {
  return this.findOne({ walletAddress: walletAddress.toLowerCase() });
};

UserSchema.statics.findByUsername = function(username) {
  return this.findOne({ username: username.toLowerCase() });
};

UserSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

UserSchema.statics.findByRole = function(role) {
  return this.find({ role, isActive: true });
};

UserSchema.statics.authenticate = async function(identifier, password) {
  // Find user by username or email
  const user = await this.findOne({
    $or: [
      { username: identifier.toLowerCase() },
      { email: identifier.toLowerCase() }
    ],
    isActive: true
  });

  if (!user) {
    return null;
  }

  const isMatch = await user.comparePassword(password);
  return isMatch ? user : null;
};

export default mongoose.models.User || mongoose.model("User", UserSchema);
