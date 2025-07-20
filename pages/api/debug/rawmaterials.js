import dbConnect from '../../../lib/dbConnect';
import RawMaterial from '../../../models/RawMaterial';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const materials = await RawMaterial.find({});
    
    const debug = materials.map(material => ({
      id: material._id,
      name: material.name,
      addedBy: material.addedBy,
      approvedPayments: material.approvedPayments?.map(payment => ({
        id: payment._id,
        producerWallet: payment.producerWalletAddress,
        manufacturerWallet: payment.manufacturerWalletAddress,
        amount: payment.amountPaid,
        currentStatus: payment.currentStatus,
        trackingEventsCount: payment.trackingEvents?.length || 0,
        trackingEvents: payment.trackingEvents || []
      })) || []
    }));

    res.status(200).json({
      success: true,
      data: debug
    });

  } catch (error) {
    console.error('Debug API error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
