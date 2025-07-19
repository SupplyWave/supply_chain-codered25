import mongoose from "mongoose";

const ApprovedPaymentSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerWalletAddress: { type: String, required: true },
  amountPaid: { type: Number, required: true },
  transactionHash: { type: String, required: true },
  blockNumber: { type: Number },
  gasUsed: { type: Number },
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

const ReviewSchema = new mongoose.Schema({
  customerId: { type: String, required: true },
  customerName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  verified: { type: Boolean, default: false }, // Verified purchase
  date: { type: Date, default: Date.now }
}, {
  suppressReservedKeysWarning: true
});

const EnhancedProductSchema = new mongoose.Schema({
  // Basic product information
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  location: { type: String, required: true },
  addedBy: { type: String, required: true }, // Producer's wallet address
  
  // Enhanced product details for ecommerce
  category: { 
    type: String, 
    required: true,
    enum: ['Electronics', 'Clothing', 'Food', 'Automotive', 'Healthcare', 'Industrial', 'Home & Garden', 'Sports', 'Books', 'Other']
  },
  subcategory: { type: String },
  brand: { type: String },
  sku: { type: String, unique: true },
  
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
    warranty: { type: String },
    certifications: [{ type: String }],
    origin: { type: String }, // Country of origin
    shelfLife: { type: String } // For food products
  },
  
  // Customization options
  customizable: { type: Boolean, default: false },
  customizationOptions: [{
    name: { type: String }, // e.g., "Color", "Size", "Material"
    type: { type: String, enum: ['dropdown', 'text', 'number', 'color', 'checkbox'] },
    options: [{ type: String }], // Available options for dropdown
    required: { type: Boolean, default: false },
    additionalCost: { type: Number, default: 0 },
    description: { type: String }
  }],
  
  // Inventory and availability
  stock: { type: Number, default: 1 },
  minOrderQuantity: { type: Number, default: 1 },
  maxOrderQuantity: { type: Number, default: 100 },
  leadTime: { type: String }, // Production/delivery time
  
  // Company/Industry targeting for recommendations
  targetIndustries: [{ 
    type: String,
    enum: ['Manufacturing', 'Retail', 'Healthcare', 'Technology', 'Automotive', 'Food', 'Construction', 'Education', 'Government', 'Other']
  }],
  companySize: [{
    type: String,
    enum: ['Startup', 'Small', 'Medium', 'Large', 'Enterprise']
  }],
  businessType: [{
    type: String,
    enum: ['B2B', 'B2C', 'B2G', 'Wholesale', 'Retail']
  }],
  
  // Media and presentation
  images: [{ 
    url: { type: String },
    alt: { type: String },
    isPrimary: { type: Boolean, default: false }
  }],
  videos: [{ 
    url: { type: String },
    title: { type: String },
    description: { type: String }
  }],
  documents: [{ // Technical specs, manuals, etc.
    name: { type: String },
    url: { type: String },
    type: { type: String, enum: ['manual', 'specification', 'certificate', 'datasheet', 'other'] }
  }],
  
  // SEO and search
  tags: [{ type: String }],
  searchKeywords: [{ type: String }],
  metaTitle: { type: String },
  metaDescription: { type: String },
  
  // Ratings and reviews
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0 },
  reviews: [ReviewSchema],
  
  // Pricing and offers
  originalPrice: { type: Number }, // For showing discounts
  discount: { type: Number, default: 0 }, // Percentage
  isOnSale: { type: Boolean, default: false },
  saleEndDate: { type: Date },
  
  // Business logic
  approvedPayments: [ApprovedPaymentSchema],
  isAvailable: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  isRecommended: { type: Boolean, default: false },
  isNew: { type: Boolean, default: true },
  
  // Analytics
  viewCount: { type: Number, default: 0 },
  purchaseCount: { type: Number, default: 0 },
  wishlistCount: { type: Number, default: 0 },
  
  // Producer information
  producerInfo: {
    companyName: { type: String },
    contactEmail: { type: String },
    contactPhone: { type: String },
    website: { type: String },
    description: { type: String }
  },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  suppressReservedKeysWarning: true
});

// Indexes for better search performance
EnhancedProductSchema.index({ name: 'text', description: 'text', tags: 'text' });
EnhancedProductSchema.index({ category: 1, subcategory: 1 });
EnhancedProductSchema.index({ price: 1 });
EnhancedProductSchema.index({ averageRating: -1 });
EnhancedProductSchema.index({ createdAt: -1 });
EnhancedProductSchema.index({ isAvailable: 1, isFeatured: -1 });
EnhancedProductSchema.index({ targetIndustries: 1, companySize: 1 });

// Pre-save middleware
EnhancedProductSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Generate SKU if not provided
  if (!this.sku) {
    this.sku = `${this.category.substring(0, 3).toUpperCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  }
  
  // Calculate final price with discount
  if (this.discount > 0 && this.originalPrice) {
    this.price = this.originalPrice * (1 - this.discount / 100);
  }
  
  // Update isNew status (products are new for 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  this.isNew = this.createdAt > thirtyDaysAgo;
  
  next();
});

// Instance methods
EnhancedProductSchema.methods.addReview = function(customerId, customerName, rating, comment) {
  this.reviews.push({
    customerId,
    customerName,
    rating,
    comment,
    verified: this.approvedPayments.some(payment => payment.customerWalletAddress === customerId)
  });
  
  // Recalculate average rating
  const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
  this.averageRating = totalRating / this.reviews.length;
  this.totalReviews = this.reviews.length;
  
  return this.save();
};

EnhancedProductSchema.methods.incrementView = function() {
  this.viewCount += 1;
  return this.save();
};

EnhancedProductSchema.methods.addPurchase = function(customerData) {
  this.approvedPayments.push(customerData);
  this.purchaseCount += 1;
  this.stock = Math.max(0, this.stock - (customerData.quantity || 1));
  
  if (this.stock === 0) {
    this.isAvailable = false;
  }
  
  return this.save();
};

// Static methods
EnhancedProductSchema.statics.findByCategory = function(category, subcategory = null) {
  const query = { category, isAvailable: true };
  if (subcategory) query.subcategory = subcategory;
  return this.find(query).sort({ isFeatured: -1, createdAt: -1 });
};

EnhancedProductSchema.statics.searchProducts = function(searchTerm, filters = {}) {
  const query = { isAvailable: true };
  
  if (searchTerm) {
    query.$text = { $search: searchTerm };
  }
  
  if (filters.category) query.category = filters.category;
  if (filters.minPrice) query.price = { $gte: filters.minPrice };
  if (filters.maxPrice) query.price = { ...query.price, $lte: filters.maxPrice };
  if (filters.rating) query.averageRating = { $gte: filters.rating };
  if (filters.brand) query.brand = filters.brand;
  
  return this.find(query).sort({ score: { $meta: 'textScore' }, isFeatured: -1 });
};

EnhancedProductSchema.statics.getRecommendations = function(userProfile) {
  const query = { 
    isAvailable: true,
    $or: [
      { targetIndustries: { $in: userProfile.industries || [] } },
      { companySize: { $in: userProfile.companySize || [] } },
      { businessType: { $in: userProfile.businessType || [] } },
      { isRecommended: true }
    ]
  };
  
  return this.find(query).sort({ averageRating: -1, purchaseCount: -1 }).limit(20);
};

export default mongoose.models.EnhancedProduct || mongoose.model("EnhancedProduct", EnhancedProductSchema);
