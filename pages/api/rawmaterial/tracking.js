import dbConnect from '../../../lib/dbConnect';
import RawMaterial from '../../../models/RawMaterial';
import User from '../../../models/User';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const {
      materialId,
      paymentId,
      status,
      location,
      description,
      updatedBy,
      images,
      estimatedNextUpdate,
      notes,
      temperature,
      humidity,
      handledBy
    } = req.body;

    // Validation
    if (!materialId || !paymentId || !status || !location || !description || !updatedBy) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: materialId, paymentId, status, location, description, updatedBy'
      });
    }

    // Find the raw material
    const material = await RawMaterial.findById(materialId);
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Raw material not found'
      });
    }



    // Find the specific payment/order
    const payment = material.approvedPayments.find(p => {
      // Try to match by _id if it exists
      if (p._id && p._id.toString() === paymentId) {
        return true;
      }
      // Try to match by transaction hash
      if (p.transactionHash === paymentId) {
        return true;
      }
      // Try to match by wallet address
      if (p.producerWalletAddress && p.producerWalletAddress.toLowerCase() === paymentId.toLowerCase()) {
        return true;
      }
      if (p.manufacturerWalletAddress && p.manufacturerWalletAddress.toLowerCase() === paymentId.toLowerCase()) {
        return true;
      }
      // Try to match by date (as fallback)
      if (p.date && p.date.toString() === paymentId) {
        return true;
      }
      return false;
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment/Order not found for this material'
      });
    }

    // Verify the user updating the status (should be the supplier)
    const updater = await User.findByWalletAddress(updatedBy);
    if (!updater) {
      return res.status(400).json({
        success: false,
        message: 'Invalid updater'
      });
    }

    // Verify the updater is the supplier of this material
    if (material.addedBy.toLowerCase() !== updatedBy.toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: 'Only the supplier can update tracking for this material'
      });
    }

    // Calculate actual duration if this is not the first tracking event
    let actualDuration = null;
    if (payment.trackingEvents && payment.trackingEvents.length > 0) {
      const lastEvent = payment.trackingEvents[payment.trackingEvents.length - 1];
      const timeDiff = new Date() - new Date(lastEvent.timestamp);
      actualDuration = Math.round(timeDiff / (1000 * 60)); // Convert to minutes
    }

    // Create tracking event
    const trackingEvent = {
      status,
      location: {
        address: location.address || 'Unknown',
        city: location.city || '',
        state: location.state || '',
        country: location.country || 'USA',
        coordinates: location.coordinates || {},
        facilityName: location.facilityName || '',
        facilityType: location.facilityType || 'supplier_facility'
      },
      description,
      updatedBy: updatedBy.toLowerCase(),
      updatedByRole: updater.role || 'supplier',
      timestamp: new Date(),
      images: images || [],
      estimatedNextUpdate: estimatedNextUpdate ? new Date(estimatedNextUpdate) : null,
      actualDuration,
      notes: notes || '',
      temperature: temperature || null,
      humidity: humidity || null,
      handledBy: handledBy || {
        name: updater.profile?.name || 'Unknown',
        company: updater.companyProfile?.companyName || updater.profile?.company || 'Unknown',
        contact: updater.email || 'Unknown'
      }
    };

    // Initialize trackingEvents array if it doesn't exist
    if (!payment.trackingEvents) {
      payment.trackingEvents = [];
    }

    // Add tracking event to the payment
    payment.trackingEvents.push(trackingEvent);
    payment.currentStatus = status;

    // Mark as modified and save
    material.markModified('approvedPayments');
    await material.save();

    res.status(200).json({
      success: true,
      message: 'Raw material tracking updated successfully',
      data: {
        materialId: material._id,
        materialName: material.name,
        paymentId,
        status,
        trackingEvent
      }
    });

  } catch (error) {
    console.error('Raw material tracking update error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during tracking update'
    });
  }
}
