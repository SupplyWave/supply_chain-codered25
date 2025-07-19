import dbConnect from '../../../lib/dbConnect';
import Purchase from '../../../models/Purchase';

export default async function handler(req, res) {
  const { purchaseId } = req.query;

  if (req.method === 'GET') {
    try {
      await dbConnect();

      const purchase = await Purchase.getTrackingInfo(purchaseId);

      if (!purchase) {
        return res.status(404).json({
          success: false,
          message: 'Purchase not found'
        });
      }

      res.status(200).json({
        success: true,
        data: purchase
      });

    } catch (error) {
      console.error('Tracking fetch error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  } else if (req.method === 'PUT') {
    // Update tracking status
    try {
      await dbConnect();

      const { status, location, description, updatedBy } = req.body;

      if (!status || !location || !description || !updatedBy) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
      }

      const purchase = await Purchase.findByPurchaseId(purchaseId);

      if (!purchase) {
        return res.status(404).json({
          success: false,
          message: 'Purchase not found'
        });
      }

      // Verify updater is the producer
      if (purchase.producerId !== updatedBy.toLowerCase()) {
        return res.status(403).json({
          success: false,
          message: 'Only the producer can update tracking status'
        });
      }

      await purchase.updateStatus(status, location, description, updatedBy.toLowerCase());

      res.status(200).json({
        success: true,
        message: 'Tracking status updated successfully',
        data: {
          purchaseId: purchase.purchaseId,
          currentStatus: purchase.currentStatus,
          trackingEvents: purchase.trackingEvents
        }
      });

    } catch (error) {
      console.error('Tracking update error:', error);
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
