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
      purchaseId,
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
    if (!purchaseId || !status || !location || !description || !updatedBy) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: purchaseId, status, location, description, updatedBy'
      });
    }

    // Find the purchase
    const purchase = await Purchase.findByPurchaseId(purchaseId);
    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found'
      });
    }

    // Verify the user updating the status
    const updater = await User.findByWalletAddress(updatedBy);
    if (!updater) {
      return res.status(400).json({
        success: false,
        message: 'Invalid updater'
      });
    }

    // Check permissions - only producer, supplier, or authorized logistics can update
    const canUpdate = (
      (updater.role === 'producer' && purchase.producerId === updatedBy.toLowerCase()) ||
      (updater.role === 'supplier') ||
      (updater.role === 'logistics') // Future role for logistics companies
    );

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this tracking information'
      });
    }

    // Prepare location data
    const locationData = {
      address: location.address,
      city: location.city || '',
      state: location.state || '',
      country: location.country || 'USA',
      coordinates: location.coordinates || {},
      facilityName: location.facilityName || '',
      facilityType: location.facilityType || 'other'
    };

    // Calculate duration from previous event
    let actualDuration = null;
    if (purchase.trackingEvents.length > 0) {
      const lastEvent = purchase.trackingEvents[purchase.trackingEvents.length - 1];
      const timeDiff = new Date() - new Date(lastEvent.timestamp);
      actualDuration = Math.floor(timeDiff / (1000 * 60)); // Duration in minutes
    }

    // Create tracking event
    const trackingEvent = {
      status,
      location: locationData,
      description,
      updatedBy: updatedBy.toLowerCase(),
      updatedByRole: updater.role,
      images: images || [],
      estimatedNextUpdate: estimatedNextUpdate ? new Date(estimatedNextUpdate) : null,
      actualDuration,
      notes: notes || '',
      temperature: temperature || null,
      humidity: humidity || null,
      handledBy: handledBy || {
        name: updater.profile.name,
        company: updater.companyProfile?.companyName || updater.profile.company,
        contact: updater.email
      }
    };

    // Debug logging
    console.log('Updater role:', updater.role);
    console.log('Updater object:', JSON.stringify(updater, null, 2));

    // Add the tracking event with complete data
    const trackingEventData = {
      updatedByRole: updater.role || 'producer', // Default to producer if role is missing
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

    console.log('Tracking event data:', JSON.stringify(trackingEventData, null, 2));

    // Create the complete tracking event manually to ensure all fields are included
    const completeTrackingEvent = {
      status,
      location: locationData,
      description,
      updatedBy: updatedBy.toLowerCase(),
      updatedByRole: updater.role || 'producer', // Ensure this is always set
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

    console.log('Complete tracking event:', JSON.stringify(completeTrackingEvent, null, 2));

    // Add tracking event directly to the array
    purchase.trackingEvents.push(completeTrackingEvent);
    purchase.currentStatus = status;

    // Set delivery date if delivered
    if (status === 'delivered') {
      purchase.actualDeliveryDate = new Date();
    }

    await purchase.save();

    // Send real-time notification (future implementation)
    // await sendTrackingNotification(purchase, trackingEvent);

    res.status(200).json({
      success: true,
      message: 'Tracking information updated successfully',
      data: {
        purchaseId: purchase.purchaseId,
        currentStatus: purchase.currentStatus,
        latestEvent: trackingEvent,
        totalEvents: purchase.trackingEvents.length
      }
    });

  } catch (error) {
    console.error('Tracking update error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during tracking update'
    });
  }
}

// Enhanced addTrackingEvent method for Purchase model
async function enhancedAddTrackingEvent(purchase, eventData) {
  purchase.trackingEvents.push(eventData);
  purchase.currentStatus = eventData.status;
  
  // Update delivery date if delivered
  if (eventData.status === 'delivered') {
    purchase.actualDeliveryDate = new Date();
  }
  
  // Update estimated delivery based on current progress
  if (eventData.estimatedNextUpdate) {
    purchase.estimatedDeliveryDate = eventData.estimatedNextUpdate;
  }
  
  return purchase.save();
}
