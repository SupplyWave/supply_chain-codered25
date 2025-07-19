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
      buyerId,
      transactionHash,
      blockNumber,
      gasUsed,
      gasPrice,
      amountPaid
    } = req.body;

    // Validation
    if (!materialId || !buyerId || !transactionHash || !amountPaid) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: materialId, buyerId, transactionHash, amountPaid'
      });
    }

    // Verify buyer exists and is a producer
    const buyer = await User.findByWalletAddress(buyerId);
    if (!buyer || buyer.role !== 'producer') {
      return res.status(400).json({
        success: false,
        message: 'Invalid buyer or buyer is not a producer'
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

    // Check if material is still available
    if (!material.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Raw material is no longer available'
      });
    }

    // Verify the supplier exists
    const supplier = await User.findByWalletAddress(material.addedBy);
    if (!supplier) {
      return res.status(400).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    // Check if transaction hash already exists
    const existingPayment = material.approvedPayments.find(
      payment => payment.transactionHash === transactionHash
    );
    
    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: 'Transaction already processed'
      });
    }

    // Add payment record to the material
    const paymentData = {
      producerName: buyer.profile.name,
      producerWalletAddress: buyerId.toLowerCase(),
      amountPaid: parseFloat(amountPaid),
      transactionHash,
      blockNumber: blockNumber || null,
      gasUsed: gasUsed || null,
      date: new Date(),
      status: 'confirmed'
    };

    await material.addPayment(paymentData);

    // Mark material as sold (optional - you might want to keep it available for multiple buyers)
    // material.isAvailable = false;
    // await material.save();

    res.status(200).json({
      success: true,
      message: 'Raw material purchase recorded successfully',
      data: {
        materialId: material._id,
        materialName: material.name,
        transactionHash,
        amountPaid,
        supplierName: supplier.profile.name,
        buyerName: buyer.profile.name
      }
    });

  } catch (error) {
    console.error('Raw material purchase error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during raw material purchase'
    });
  }
}
