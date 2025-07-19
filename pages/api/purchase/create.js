import dbConnect from '../../../lib/dbConnect';
import Purchase from '../../../models/Purchase';
import User from '../../../models/User';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const {
      productId,
      productName,
      productDescription,
      quantity,
      unitPrice,
      totalAmount,
      customerId,
      customerName,
      producerId,
      producerName,
      purchaseId,
      transactionHash,
      blockNumber,
      gasUsed,
      gasPrice,
      deliveryAddress,
      initialTrackingEvent
    } = req.body;

    // Validation
    if (!productId || !productName || !quantity || !unitPrice || !totalAmount || !customerId || !producerId || !transactionHash || !deliveryAddress || !purchaseId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Verify customer and producer exist
    const customer = await User.findByWalletAddress(customerId);
    const producer = await User.findByWalletAddress(producerId);

    if (!customer || !producer) {
      return res.status(400).json({
        success: false,
        message: 'Invalid customer or producer'
      });
    }

    // Verify customer role
    if (customer.role !== 'customer') {
      return res.status(400).json({
        success: false,
        message: 'Invalid customer role'
      });
    }

    // Verify producer role
    if (producer.role !== 'producer') {
      return res.status(400).json({
        success: false,
        message: 'Invalid producer role'
      });
    }

    // Check if transaction hash already exists
    const existingPurchase = await Purchase.findByTransactionHash(transactionHash);
    if (existingPurchase) {
      return res.status(400).json({
        success: false,
        message: 'Transaction already processed'
      });
    }

    // Calculate estimated delivery date (7 days from now)
    const estimatedDeliveryDate = new Date();
    estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 7);

    // Create purchase record
    const purchase = new Purchase({
      purchaseId: purchaseId || `PUR-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      productId,
      productName,
      productDescription,
      quantity: parseInt(quantity),
      unitPrice: parseFloat(unitPrice),
      totalAmount: parseFloat(totalAmount),
      customerId: customerId.toLowerCase(),
      customerName: customerName || customer.profile?.name || customer.username || 'Customer',
      producerId: producerId.toLowerCase(),
      producerName: producerName || producer.profile?.name || producer.username || 'Producer',
      transactionHash,
      blockNumber,
      gasUsed,
      gasPrice,
      deliveryAddress,
      estimatedDeliveryDate,
      currentStatus: 'order_placed',
      orderDate: new Date(),
      // Add initial tracking event
      trackingEvents: initialTrackingEvent ? [initialTrackingEvent] : [{
        status: 'order_placed',
        timestamp: new Date(),
        location: {
          address: deliveryAddress.street || 'Customer Location',
          city: deliveryAddress.city || 'City',
          state: deliveryAddress.state || 'State',
          country: deliveryAddress.country || 'Country',
          facilityType: 'customer_location'
        },
        description: 'Order has been placed and payment confirmed',
        updatedBy: customerId.toLowerCase(),
        updatedByRole: 'customer'
      }]
    });

    await purchase.save();

    res.status(201).json({
      success: true,
      message: 'Purchase created successfully',
      data: {
        purchaseId: purchase.purchaseId,
        transactionHash: purchase.transactionHash,
        currentStatus: purchase.currentStatus,
        estimatedDeliveryDate: purchase.estimatedDeliveryDate,
        trackingEvents: purchase.trackingEvents
      }
    });

  } catch (error) {
    console.error('Purchase creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during purchase creation'
    });
  }
}
