import mongoose from "mongoose";

// Tracking Event Schema for Raw Materials
const RawMaterialTrackingEventSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
    enum: ['order_placed', 'payment_confirmed', 'processing', 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'order_placed'
  },
  location: {
    address: { type: String, required: true },
    city: { type: String },
    state: { type: String },
    country: { type: String, default: 'USA' },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number }
    },
    facilityName: { type: String },
    facilityType: {
      type: String,
      enum: ['supplier_facility', 'warehouse', 'transport_hub', 'delivery_point'],
      default: 'supplier_facility'
    }
  },
  description: { type: String, required: true },
  updatedBy: { type: String, required: true, lowercase: true },
  updatedByRole: {
    type: String,
    required: true,
    enum: ['supplier', 'producer', 'customer'],
    default: 'supplier'
  },
  timestamp: { type: Date, default: Date.now },
  images: [{
    url: { type: String },
    description: { type: String },
    timestamp: { type: Date, default: Date.now }
  }],
  estimatedNextUpdate: { type: Date },
  actualDuration: { type: Number }, // Time spent in this stage (minutes)
  notes: { type: String },
  temperature: { type: Number },
  humidity: { type: Number },
  handledBy: {
    name: { type: String },
    contact: { type: String },
    company: { type: String }
  }
}, {
  timestamps: true,
  suppressReservedKeysWarning: true
});

const ApprovedPaymentSchema = new mongoose.Schema({
  producerName: { type: String, required: true },
  producerWalletAddress: { type: String, required: true },
  amountPaid: { type: Number, required: true },
  transactionHash: { type: String, required: true },
  blockNumber: { type: Number },
  gasUsed: { type: Number },
  date: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed'],
    default: 'confirmed'
  },
  // Tracking information for this specific order
  currentStatus: {
    type: String,
    enum: ['order_placed', 'payment_confirmed', 'processing', 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'order_placed'
  },
  trackingEvents: [RawMaterialTrackingEventSchema],
  deliveryAddress: { type: String },
  estimatedDeliveryDate: { type: Date },
  actualDeliveryDate: { type: Date }
}, {
  timestamps: true,
  suppressReservedKeysWarning: true
});

const RawMaterialSchema = new mongoose.Schema({
  // Basic Product Information
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  category: {
    type: String,
    enum: ['Raw Material', 'Plastic', 'Organic Produce', 'Metal Parts', 'Chemicals', 'Electronics', 'Textiles', 'metals', 'plastics', 'textiles', 'chemicals', 'electronics', 'other'],
    default: 'Raw Material'
  },

  // Technical Details
  technicalSpecs: {
    type: String,
    trim: true,
    default: ''
  },
  materialType: {
    type: String,
    trim: true,
    default: ''
  },

  // Pricing Information
  price: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    enum: ['ETH', 'USD', 'INR'],
    default: 'ETH'
  },

  // Quantity & Availability
  quantity: {
    type: Number,
    default: 1,
    min: 0
  },
  availableStock: {
    type: Number,
    default: 1,
    min: 0
  },
  unit: {
    type: String,
    enum: ['kg', 'tons', 'pieces', 'liters', 'meters'],
    default: 'kg'
  },

  // Location
  location: {
    type: String,
    required: true,
    trim: true
  },

  // Images & Documents
  productImages: {
    type: String,
    trim: true,
    default: ''
  },

  // Supplier Information
  addedBy: {
    type: String,
    required: true,
    lowercase: true,
    index: true
  },
  supplierRole: {
    type: String,
    default: 'supplier',
    enum: ['supplier']
  },

  // Availability Status
  isAvailable: {
    type: Boolean,
    default: true
  },
  approvedPayments: [ApprovedPaymentSchema],
  totalSold: {
    type: Number,
    default: 0
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

// Indexes for better query performance
RawMaterialSchema.index({ addedBy: 1, isAvailable: 1 });
RawMaterialSchema.index({ category: 1, isAvailable: 1 });
RawMaterialSchema.index({ price: 1 });
RawMaterialSchema.index({ createdAt: -1 });
RawMaterialSchema.index({ name: 'text', description: 'text' });

// Pre-save middleware
RawMaterialSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Instance methods
RawMaterialSchema.methods.addPayment = function(paymentData) {
  this.approvedPayments.push(paymentData);
  this.totalSold += paymentData.amountPaid;
  return this.save();
};

RawMaterialSchema.methods.markAsSold = function() {
  this.isAvailable = false;
  return this.save();
};

// Static methods
RawMaterialSchema.statics.findBySupplier = function(supplierAddress) {
  return this.find({ addedBy: supplierAddress.toLowerCase(), isAvailable: true });
};

RawMaterialSchema.statics.findAvailable = function() {
  return this.find({ isAvailable: true }).sort({ createdAt: -1 });
};

RawMaterialSchema.statics.findByCategory = function(category) {
  return this.find({ category, isAvailable: true });
};

export default mongoose.models.RawMaterial ||
  mongoose.model("RawMaterial", RawMaterialSchema);
