import mongoose from "mongoose";

const TrackingEventSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
    enum: [
      'order_placed',
      'payment_confirmed',
      'processing',
      'raw_materials_sourced',
      'production_started',
      'production_completed',
      'quality_check',
      'packaging',
      'ready_for_shipment',
      'shipped',
      'in_transit',
      'customs_clearance',
      'local_facility',
      'out_for_delivery',
      'delivered',
      'cancelled',
      'returned'
    ]
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  location: {
    address: { type: String, required: true },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number }
    },
    facilityName: { type: String }, // Warehouse, factory, etc.
    facilityType: {
      type: String,
      enum: ['factory', 'warehouse', 'distribution_center', 'retail_store', 'customer_location', 'transit_hub', 'customs', 'other']
    }
  },
  description: {
    type: String,
    required: true
  },
  updatedBy: {
    type: String,
    required: true // Wallet address of who updated the status
  },
  updatedByRole: {
    type: String,
    enum: ['supplier', 'producer', 'logistics', 'customer'],
    required: false // Temporarily made optional to test GPS tracking
  },
  images: [{ // Photos of the product at this stage
    url: { type: String },
    description: { type: String },
    timestamp: { type: Date, default: Date.now }
  }],
  estimatedNextUpdate: { type: Date }, // When next update is expected
  actualDuration: { type: Number }, // Time spent in this stage (minutes)
  notes: { type: String }, // Additional notes
  temperature: { type: Number }, // For temperature-sensitive products
  humidity: { type: Number }, // For humidity-sensitive products
  handledBy: { // Person/company handling this stage
    name: { type: String },
    contact: { type: String },
    company: { type: String }
  }
}, {
  timestamps: true,
  suppressReservedKeysWarning: true
});

const PurchaseSchema = new mongoose.Schema({
  // Purchase Information
  purchaseId: {
    type: String,
    required: true,
    unique: true
  },
  
  // Product Information
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  productName: {
    type: String,
    required: true
  },
  productDescription: {
    type: String
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Parties Involved
  customerId: {
    type: String,
    required: true,
    index: true // Customer's wallet address
  },
  customerName: {
    type: String,
    required: true
  },
  producerId: {
    type: String,
    required: true,
    index: true // Producer's wallet address
  },
  producerName: {
    type: String,
    required: true
  },
  
  // Blockchain Transaction Details
  transactionHash: {
    type: String,
    required: true,
    unique: true
  },
  blockNumber: {
    type: Number
  },
  gasUsed: {
    type: Number
  },
  gasPrice: {
    type: String
  },
  
  // Order Status
  currentStatus: {
    type: String,
    required: true,
    enum: [
      'order_placed',
      'payment_confirmed',
      'processing',
      'shipped',
      'in_transit',
      'out_for_delivery',
      'delivered',
      'cancelled'
    ],
    default: 'order_placed'
  },
  
  // Tracking Information
  trackingEvents: [TrackingEventSchema],
  
  // Delivery Information
  deliveryAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true, default: 'USA' }
  },
  
  // Estimated and Actual Delivery
  estimatedDeliveryDate: {
    type: Date
  },
  actualDeliveryDate: {
    type: Date
  },
  
  // Additional Information
  notes: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Timestamps
  orderDate: {
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

// Indexes for better query performance
PurchaseSchema.index({ customerId: 1, orderDate: -1 });
PurchaseSchema.index({ producerId: 1, orderDate: -1 });
PurchaseSchema.index({ currentStatus: 1, orderDate: -1 });

// Pre-save middleware
PurchaseSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Generate purchase ID if not exists
  if (!this.purchaseId) {
    this.purchaseId = 'PUR-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }
  
  // Calculate total amount
  this.totalAmount = this.quantity * this.unitPrice;
  
  next();
});

// Instance methods
PurchaseSchema.methods.addTrackingEvent = function(status, location, description, updatedBy, trackingEventData = {}) {
  const trackingEvent = {
    status,
    location,
    description,
    updatedBy,
    timestamp: new Date(),
    // Include additional tracking event data if provided
    ...trackingEventData
  };

  this.trackingEvents.push(trackingEvent);

  this.currentStatus = status;

  // Set delivery date if delivered
  if (status === 'delivered') {
    this.actualDeliveryDate = new Date();
  }

  return this.save();
};

PurchaseSchema.methods.updateStatus = function(newStatus, location, description, updatedBy) {
  return this.addTrackingEvent(newStatus, location, description, updatedBy);
};

// Static methods
PurchaseSchema.statics.findByCustomer = function(customerId) {
  return this.find({ customerId, isActive: true }).sort({ orderDate: -1 });
};

PurchaseSchema.statics.findByProducer = function(producerId) {
  return this.find({ producerId, isActive: true }).sort({ orderDate: -1 });
};

PurchaseSchema.statics.findByTransactionHash = function(transactionHash) {
  return this.findOne({ transactionHash });
};

PurchaseSchema.statics.findByPurchaseId = function(purchaseId) {
  return this.findOne({ purchaseId, isActive: true });
};

PurchaseSchema.statics.getTrackingInfo = function(purchaseId) {
  return this.findOne({ purchaseId, isActive: true })
    .select('purchaseId productName currentStatus trackingEvents deliveryAddress estimatedDeliveryDate actualDeliveryDate customerName producerName orderDate');
};

export default mongoose.models.Purchase || mongoose.model("Purchase", PurchaseSchema);
