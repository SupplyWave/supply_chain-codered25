import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';
import EnhancedProduct from '../../../models/EnhancedProduct';
import Purchase from '../../../models/Purchase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { userId, type = 'create' } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Get user profile
    const user = await User.findByWalletAddress(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let recommendations = [];

    if (type === 'create' && user.role === 'producer') {
      // Product creation recommendations for producers
      recommendations = await getProductCreationRecommendations(user);
    } else if (type === 'purchase' && user.role === 'customer') {
      // Purchase recommendations for customers
      recommendations = await getPurchaseRecommendations(user);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid recommendation type or user role'
      });
    }

    res.status(200).json({
      success: true,
      data: recommendations,
      userProfile: {
        role: user.role,
        companyProfile: user.companyProfile,
        preferences: user.preferences
      }
    });

  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

async function getProductCreationRecommendations(producer) {
  const recommendations = [];

  try {
    // 1. Market Gap Analysis - Find categories with high demand but low supply
    const marketGaps = await analyzeMarketGaps();
    
    // 2. Industry-specific recommendations based on producer's company profile
    const industryRecommendations = await getIndustrySpecificRecommendations(producer);
    
    // 3. Trending products in producer's area
    const trendingProducts = await getTrendingProducts(producer);
    
    // 4. Seasonal recommendations
    const seasonalRecommendations = await getSeasonalRecommendations();

    // 5. Customer demand analysis
    const demandAnalysis = await getCustomerDemandAnalysis(producer);

    recommendations.push(
      {
        type: 'market_gap',
        title: 'Market Opportunities',
        description: 'Categories with high demand but limited supply',
        items: marketGaps,
        priority: 'high'
      },
      {
        type: 'industry_specific',
        title: 'Industry-Specific Products',
        description: `Recommended products for ${producer.companyProfile?.industry || 'your industry'}`,
        items: industryRecommendations,
        priority: 'high'
      },
      {
        type: 'trending',
        title: 'Trending Products',
        description: 'Popular products in your area',
        items: trendingProducts,
        priority: 'medium'
      },
      {
        type: 'seasonal',
        title: 'Seasonal Opportunities',
        description: 'Products in demand for current season',
        items: seasonalRecommendations,
        priority: 'medium'
      },
      {
        type: 'customer_demand',
        title: 'Customer Requests',
        description: 'Products frequently searched but not available',
        items: demandAnalysis,
        priority: 'high'
      }
    );

  } catch (error) {
    console.error('Error generating product creation recommendations:', error);
  }

  return recommendations;
}

async function analyzeMarketGaps() {
  // Analyze purchase patterns vs available products
  const gaps = [];
  
  try {
    // Get purchase data by category
    const purchasesByCategory = await Purchase.aggregate([
      { $group: { _id: '$productName', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    // Get available products by category
    const productsByCategory = await EnhancedProduct.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Simple gap analysis
    const highDemandCategories = ['Electronics', 'Healthcare', 'Industrial'];
    
    for (const category of highDemandCategories) {
      const productCount = productsByCategory.find(p => p._id === category)?.count || 0;
      
      if (productCount < 5) { // Threshold for "low supply"
        gaps.push({
          category,
          reason: 'High demand, low supply',
          opportunity: 'High',
          suggestedProducts: getSuggestedProductsForCategory(category)
        });
      }
    }

  } catch (error) {
    console.error('Market gap analysis error:', error);
  }

  return gaps;
}

async function getIndustrySpecificRecommendations(producer) {
  const industry = producer.companyProfile?.industry;
  const recommendations = [];

  const industryProductMap = {
    'Manufacturing': [
      { name: 'Industrial Sensors', category: 'Industrial', estimatedDemand: 'High' },
      { name: 'Safety Equipment', category: 'Industrial', estimatedDemand: 'High' },
      { name: 'Quality Control Tools', category: 'Industrial', estimatedDemand: 'Medium' }
    ],
    'Healthcare': [
      { name: 'Medical Devices', category: 'Healthcare', estimatedDemand: 'High' },
      { name: 'Diagnostic Equipment', category: 'Healthcare', estimatedDemand: 'High' },
      { name: 'Personal Protective Equipment', category: 'Healthcare', estimatedDemand: 'Medium' }
    ],
    'Technology': [
      { name: 'IoT Devices', category: 'Electronics', estimatedDemand: 'High' },
      { name: 'Smart Sensors', category: 'Electronics', estimatedDemand: 'High' },
      { name: 'Automation Tools', category: 'Industrial', estimatedDemand: 'Medium' }
    ],
    'Food': [
      { name: 'Food Processing Equipment', category: 'Industrial', estimatedDemand: 'Medium' },
      { name: 'Packaging Solutions', category: 'Industrial', estimatedDemand: 'High' },
      { name: 'Quality Testing Kits', category: 'Industrial', estimatedDemand: 'Medium' }
    ]
  };

  if (industry && industryProductMap[industry]) {
    recommendations.push(...industryProductMap[industry]);
  }

  return recommendations;
}

async function getTrendingProducts(producer) {
  try {
    // Get most purchased products in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const trending = await Purchase.aggregate([
      { $match: { orderDate: { $gte: thirtyDaysAgo } } },
      { $group: { 
        _id: '$productName', 
        count: { $sum: 1 },
        avgPrice: { $avg: '$totalAmount' },
        category: { $first: '$productName' } // This would need to be improved with actual category data
      }},
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    return trending.map(item => ({
      name: item._id,
      purchaseCount: item.count,
      averagePrice: item.avgPrice,
      trend: 'Increasing',
      opportunity: item.count > 5 ? 'High' : 'Medium'
    }));

  } catch (error) {
    console.error('Trending products analysis error:', error);
    return [];
  }
}

async function getSeasonalRecommendations() {
  const currentMonth = new Date().getMonth();
  const seasonalProducts = {
    // Winter (Dec, Jan, Feb)
    0: ['Winter Clothing', 'Heating Equipment', 'Holiday Decorations'],
    1: ['Winter Clothing', 'Heating Equipment', 'Indoor Exercise Equipment'],
    11: ['Winter Clothing', 'Heating Equipment', 'Holiday Decorations'],
    
    // Spring (Mar, Apr, May)
    2: ['Gardening Tools', 'Outdoor Furniture', 'Spring Cleaning Supplies'],
    3: ['Gardening Tools', 'Outdoor Furniture', 'Sports Equipment'],
    4: ['Gardening Tools', 'Outdoor Furniture', 'Sports Equipment'],
    
    // Summer (Jun, Jul, Aug)
    5: ['Summer Clothing', 'Cooling Equipment', 'Outdoor Recreation'],
    6: ['Summer Clothing', 'Cooling Equipment', 'Outdoor Recreation'],
    7: ['Summer Clothing', 'Cooling Equipment', 'Back to School Supplies'],
    
    // Fall (Sep, Oct, Nov)
    8: ['Back to School Supplies', 'Fall Clothing', 'Harvest Equipment'],
    9: ['Fall Clothing', 'Halloween Decorations', 'Heating Preparation'],
    10: ['Fall Clothing', 'Thanksgiving Supplies', 'Winter Preparation']
  };

  const currentSeasonProducts = seasonalProducts[currentMonth] || [];
  
  return currentSeasonProducts.map(product => ({
    name: product,
    season: getSeason(currentMonth),
    demandPeriod: 'Next 2-3 months',
    opportunity: 'Medium'
  }));
}

async function getCustomerDemandAnalysis(producer) {
  // This would analyze search logs, customer inquiries, etc.
  // For now, return mock data
  return [
    {
      searchTerm: 'Smart Home Devices',
      searchCount: 150,
      availableProducts: 3,
      gap: 'High demand, low supply',
      opportunity: 'High'
    },
    {
      searchTerm: 'Eco-friendly Packaging',
      searchCount: 89,
      availableProducts: 1,
      gap: 'Growing demand, minimal supply',
      opportunity: 'High'
    }
  ];
}

function getSuggestedProductsForCategory(category) {
  const suggestions = {
    'Electronics': ['Smart Sensors', 'IoT Devices', 'Automation Controllers'],
    'Healthcare': ['Diagnostic Tools', 'Safety Equipment', 'Monitoring Devices'],
    'Industrial': ['Quality Control Systems', 'Safety Equipment', 'Efficiency Tools']
  };
  
  return suggestions[category] || ['General Products'];
}

function getSeason(month) {
  if (month >= 2 && month <= 4) return 'Spring';
  if (month >= 5 && month <= 7) return 'Summer';
  if (month >= 8 && month <= 10) return 'Fall';
  return 'Winter';
}

async function getPurchaseRecommendations(customer) {
  // Customer purchase recommendations would go here
  // This is for future implementation
  return [];
}
