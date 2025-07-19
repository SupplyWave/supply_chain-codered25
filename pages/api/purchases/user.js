import dbConnect from '../../../lib/dbConnect';
import Purchase from '../../../models/Purchase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { userId, role } = req.query;

    if (!userId || !role) {
      return res.status(400).json({
        success: false,
        message: 'Missing userId or role parameter'
      });
    }

    let purchases;

    if (role === 'customer') {
      // Get purchases made by the customer
      purchases = await Purchase.findByCustomer(userId.toLowerCase());
    } else if (role === 'producer') {
      // Get purchases for products sold by the producer
      purchases = await Purchase.findByProducer(userId.toLowerCase());
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be customer or producer'
      });
    }

    res.status(200).json({
      success: true,
      data: purchases
    });

  } catch (error) {
    console.error('User purchases fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
