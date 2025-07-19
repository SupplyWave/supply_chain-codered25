import mongoose from "mongoose";

const ApprovedPaymentSchema = new mongoose.Schema({
  manufacturerName: { type: String, required: true },
  amountPaid: { type: Number, required: true },
  manufacturerWalletAddress: { type: String, required: true },
  transactionHash: { type: String },
  date: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed'],
    default: 'confirmed'
  }
}, {
  timestamps: true,
  suppressReservedKeysWarning: true
});

const ProductSchema = new mongoose.Schema({
  // Basic product information
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  location: { type: String, required: true },
  addedBy: { type: String, required: true }, // Producer's wallet address

  // Enhanced product details for ecommerce
  category: {
    type: String,
    default: 'Other',
    enum: ['Electronics', 'Clothing', 'Food', 'Automotive', 'Healthcare', 'Industrial', 'Home & Garden', 'Sports', 'Books', 'Other']
  },
  subcategory: { type: String },
  brand: { type: String },
  sku: { type: String },

  // Product specifications
  specifications: {
    weight: { type: Number }, // in kg
    dimensions: {
      length: { type: Number }, // in cm
      width: { type: Number },
      height: { type: Number }
    },
    color: { type: String },
    material: { type: String },
    warranty: { type: String }
  },

  // Inventory and availability
  stock: { type: Number, default: 1 },
  minOrderQuantity: { type: Number, default: 1 },
  maxOrderQuantity: { type: Number, default: 100 },

  // Media and presentation
  images: [{
    url: { type: String },
    alt: { type: String },
    isPrimary: { type: Boolean, default: false }
  }],

  // SEO and search
  tags: [{ type: String }],
  searchKeywords: [{ type: String }],

  // Ratings and reviews
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0 },

  // Business logic
  approvedPayments: [ApprovedPaymentSchema],
  isAvailable: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },

  // Analytics
  viewCount: { type: Number, default: 0 },
  purchaseCount: { type: Number, default: 0 },

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  suppressReservedKeysWarning: true
});

// Indexes for better search performance
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });
ProductSchema.index({ category: 1, subcategory: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ averageRating: -1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ isAvailable: 1, isFeatured: -1 });

// Pre-save middleware
ProductSchema.pre('save', function(next) {
  this.updatedAt = new Date();

  // Generate SKU if not provided
  if (!this.sku) {
    this.sku = `${(this.category || 'OTHER').substring(0, 3).toUpperCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  }

  next();
});

// Instance methods
ProductSchema.methods.incrementView = function() {
  this.viewCount += 1;
  return this.save();
};

ProductSchema.methods.addPurchase = function(customerData) {
  this.approvedPayments.push(customerData);
  this.purchaseCount += 1;
  this.stock = Math.max(0, this.stock - (customerData.quantity || 1));

  if (this.stock === 0) {
    this.isAvailable = false;
  }

  return this.save();
};

// Static methods
ProductSchema.statics.findByCategory = function(category, subcategory = null) {
  const query = { category, isAvailable: true };
  if (subcategory) query.subcategory = subcategory;
  return this.find(query).sort({ isFeatured: -1, createdAt: -1 });
};

ProductSchema.statics.searchProducts = function(searchTerm, filters = {}) {
  const query = { isAvailable: true };

  if (searchTerm) {
    query.$or = [
      { name: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { tags: { $in: [new RegExp(searchTerm, 'i')] } }
    ];
  }

  if (filters.category) query.category = filters.category;
  if (filters.minPrice) query.price = { $gte: filters.minPrice };
  if (filters.maxPrice) query.price = { ...query.price, $lte: filters.maxPrice };
  if (filters.rating) query.averageRating = { $gte: filters.rating };
  if (filters.brand) query.brand = filters.brand;

  return this.find(query).sort({ isFeatured: -1, createdAt: -1 });
};

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
