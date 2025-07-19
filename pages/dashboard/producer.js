import { useEffect, useState } from "react";
import { useTracking } from "../../Context/Tracking";
import MetaMaskStatus from "../../Components/MetaMaskStatus";
import GPSTrackingUpdate from "../../Components/GPSTrackingUpdate";
import ProfileDropdown from "../../Components/ProfileDropdown";
import Web3 from "web3";
import { serializeTransactionReceipt, handleWeb3Error } from "../../utils/blockchain";

export default function ProducerDashboard() {
  const [rawMaterials, setRawMaterials] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [rawMaterialPurchases, setRawMaterialPurchases] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrderForUpdate, setSelectedOrderForUpdate] = useState(null);
  const [activeTab, setActiveTab] = useState('recommendations'); // 'recommendations', 'materials', 'products', 'orders', 'tracking'
  const [recommendations, setRecommendations] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    location: "",
  });

  const { 
    currentUser, 
    isAuthenticated, 
    userRole, 
    hasPermission,
    USER_ROLES 
  } = useTracking();

  useEffect(() => {
    if (isAuthenticated && hasPermission('canViewSuppliers')) {
      fetchRecommendations();
      fetchRawMaterials();
      fetchProducts();
      fetchOrders();
      fetchRawMaterialPurchases();
    }
  }, [isAuthenticated]);

  // Auto-refresh tracking data every 30 seconds when on tracking tab
  useEffect(() => {
    let interval;
    if (activeTab === 'tracking' && isAuthenticated) {
      interval = setInterval(() => {
        fetchRawMaterialPurchases();
      }, 30000); // Refresh every 30 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTab, isAuthenticated]);

  const fetchRawMaterials = async () => {
    if (!hasPermission('canViewSuppliers')) return;
    
    try {
      const response = await fetch("/api/rawMaterial");
      const data = await response.json();
      if (data.success) {
        setRawMaterials(data.data);
      } else {
        console.error("Failed to fetch raw materials.");
      }
    } catch (error) {
      console.error("Error fetching raw materials:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products/enhanced");
      const data = await response.json();
      if (data.success) {
        // Filter products to show only those added by current user
        const userProducts = data.data.filter(product =>
          product.addedBy === currentUser
        );
        setProducts(userProducts);
      } else {
        console.error("Failed to fetch products.");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch(`/api/purchases/user?userId=${currentUser}&role=producer`);
      const data = await response.json();
      if (data.success) {
        setOrders(data.data);
      } else {
        console.error("Failed to fetch orders.");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const fetchRawMaterialPurchases = async () => {
    try {
      // Fetch raw material purchases where the producer is the buyer
      const response = await fetch(`/api/purchases/user?userId=${currentUser}&role=customer`);
      const data = await response.json();
      if (data.success) {
        // Filter for raw material purchases only
        const rawMaterialOrders = data.data.filter(purchase =>
          purchase.productType === 'rawMaterial' ||
          purchase.category === 'Raw Material' ||
          purchase.isRawMaterial === true
        );
        setRawMaterialPurchases(rawMaterialOrders);
      } else {
        console.error("Failed to fetch raw material purchases.");
      }
    } catch (error) {
      console.error("Error fetching raw material purchases:", error);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const response = await fetch(`/api/products/recommendations?userId=${currentUser}&type=create`);
      const data = await response.json();
      if (data.success) {
        setRecommendations(data.data);
      } else {
        console.error("Failed to fetch recommendations.");
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    }
  };

  const handleAddProduct = async () => {
    if (!hasPermission('canAddProducts')) {
      alert("You don't have permission to add products");
      return;
    }

    try {
      const response = await fetch("/api/addProduct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newProduct,
          addedBy: currentUser
        }),
      });
      const data = await response.json();
      if (data.success) {
        alert("Product added successfully!");
        fetchProducts();
        setShowModal(false);
        setNewProduct({ name: "", description: "", price: "", location: "" });
      } else {
        alert("Failed to add product.");
      }
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Error adding product.");
    }
  };

  const handleBuyClick = async (material) => {
    if (!hasPermission('canBuyRawMaterials')) {
      alert("You don't have permission to buy raw materials");
      return;
    }

    try {
      if (!window.ethereum) {
        alert("MetaMask not detected. Please install MetaMask.");
        return;
      }

      const web3 = new Web3(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const accounts = await web3.eth.getAccounts();
      const userAddress = accounts[0];

      // Verify the connected wallet matches the registered wallet
      if (userAddress.toLowerCase() !== currentUser.toLowerCase()) {
        alert("Please connect the MetaMask wallet that matches your registered address: " + currentUser);
        return;
      }

      const recipient = material.addedBy;
      const priceInWei = web3.utils.toWei(material.price.toString(), "ether");

      if (!web3.utils.isAddress(recipient)) {
        alert("Invalid recipient address.");
        return;
      }

      const balance = await web3.eth.getBalance(userAddress);
      if (Number(balance) < Number(priceInWei)) {
        alert("Insufficient balance.");
        return;
      }

      setIsProcessing(true);
      setSelectedMaterial(material);

      const transaction = {
        from: userAddress,
        to: recipient,
        value: priceInWei,
        gas: 21000,
        gasPrice: web3.utils.toWei("20", "gwei"),
      };

      const receipt = await web3.eth.sendTransaction(transaction);

      // Use the new raw material purchase API with utility function
      const serializedReceipt = serializeTransactionReceipt(receipt);
      const purchaseResponse = await fetch("/api/rawmaterial/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          materialId: material._id,
          buyerId: userAddress,
          ...serializedReceipt,
          amountPaid: material.price,
        }),
      });

      const purchaseData = await purchaseResponse.json();
      if (purchaseData.success) {
        alert(`Purchase successful! You bought ${material.name} from ${purchaseData.data.supplierName}`);
        fetchRawMaterials();
      } else {
        alert("Transaction successful, but failed to record purchase: " + purchaseData.message);
      }
    } catch (error) {
      console.error("Transaction error:", error);
      alert(handleWeb3Error(error));
    } finally {
      setIsProcessing(false);
      setSelectedMaterial(null);
    }
  };

  if (!isAuthenticated || userRole !== USER_ROLES.PRODUCER) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need to be logged in as a Producer to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Producer Dashboard</h1>
            <p className="text-gray-600">
              Welcome back! Manage your raw materials and products.
            </p>
            <div className="mt-2 text-sm text-gray-500">
              Connected as: {currentUser?.slice(0, 6)}...{currentUser?.slice(-4)}
            </div>
          </div>
          <ProfileDropdown />
        </div>

        {/* MetaMask Status */}
        <div className="mb-6">
          <MetaMaskStatus />
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('recommendations')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'recommendations'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Product Recommendations
              </button>
              <button
                onClick={() => setActiveTab('materials')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'materials'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Raw Materials
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'products'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Products
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'orders'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Order Management
              </button>
              <button
                onClick={() => setActiveTab('tracking')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'tracking'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Raw Material Tracking
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {/* Recommendations Tab */}
          {activeTab === 'recommendations' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Product Recommendations for Your Business</h2>

                {recommendations.length > 0 ? (
                  recommendations.map((recommendation, index) => (
                    <div key={index} className="mb-8 p-6 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-gray-800">{recommendation.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          recommendation.priority === 'high' ? 'bg-red-100 text-red-800' :
                          recommendation.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {recommendation.priority.toUpperCase()} PRIORITY
                        </span>
                      </div>

                      <p className="text-gray-600 mb-4">{recommendation.description}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {recommendation.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-medium text-gray-800 mb-2">{item.name || item.category}</h4>
                            <div className="text-sm text-gray-600 space-y-1">
                              {item.reason && <p><strong>Reason:</strong> {item.reason}</p>}
                              {item.opportunity && <p><strong>Opportunity:</strong> {item.opportunity}</p>}
                              {item.estimatedDemand && <p><strong>Demand:</strong> {item.estimatedDemand}</p>}
                              {item.searchCount && <p><strong>Search Volume:</strong> {item.searchCount}</p>}
                              {item.trend && <p><strong>Trend:</strong> {item.trend}</p>}
                            </div>
                            <button
                              onClick={() => {
                                setNewProduct({
                                  ...newProduct,
                                  name: item.name || '',
                                  category: item.category || ''
                                });
                                setActiveTab('products');
                                setShowModal(true);
                              }}
                              className="mt-3 w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors text-sm"
                            >
                              Create This Product
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">💡</div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">Loading Recommendations</h3>
                    <p className="text-gray-500">We're analyzing market data to provide personalized product recommendations...</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Raw Materials Tab */}
          {activeTab === 'materials' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Available Raw Materials</h2>
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                {rawMaterials.length} Available
              </div>
            </div>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {rawMaterials.length > 0 ? (
                rawMaterials.map((material) => (
                  <div
                    key={material._id}
                    className="border border-gray-200 p-4 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-lg text-gray-800">
                        {material.name}
                      </h3>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                        {material.price} ETH
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">
                      <strong>Location:</strong> {material.location}
                    </p>
                    <p className="text-gray-500 text-sm mb-3">
                      <strong>Supplier:</strong> {material.addedBy?.slice(0, 6)}...{material.addedBy?.slice(-4)}
                    </p>

                    <button
                      onClick={() => handleBuyClick(material)}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 transition-all duration-200"
                      disabled={isProcessing && selectedMaterial?._id === material._id}
                    >
                      {isProcessing && selectedMaterial?._id === material._id ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </div>
                      ) : (
                        "Purchase Material"
                      )}
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-4">📦</div>
                  <p className="text-gray-500">No raw materials available</p>
                </div>
              )}
            </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">My Products</h2>
              <button
                onClick={() => setShowModal(true)}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center"
              >
                <span className="mr-2">+</span>
                Add Product
              </button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {products.length > 0 ? (
                products.map((product) => (
                  <div
                    key={product._id}
                    className="border border-gray-200 p-4 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-lg text-gray-800">
                        {product.name}
                      </h3>
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm font-medium">
                        {product.price} ETH
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">
                      <strong>Description:</strong> {product.description}
                    </p>
                    <p className="text-gray-600">
                      <strong>Location:</strong> {product.location}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-4">🏭</div>
                  <p className="text-gray-500">No products created yet</p>
                  <button
                    onClick={() => setShowModal(true)}
                    className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Create your first product
                  </button>
                </div>
              )}
            </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Order Management</h2>

              {orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order._id} className="border border-gray-200 p-6 rounded-lg">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-lg text-gray-800">{order.productName}</h3>
                          <p className="text-sm text-gray-500">Order ID: {order.purchaseId}</p>
                          <p className="text-sm text-gray-500">Customer: {order.customerName}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-green-600">{order.totalAmount} ETH</span>
                          <p className="text-sm text-gray-500">{new Date(order.orderDate).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          order.currentStatus === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.currentStatus === 'shipped' ? 'bg-blue-100 text-blue-800' :
                          order.currentStatus === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.currentStatus.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedOrderForUpdate(selectedOrderForUpdate === order._id ? null : order._id)}
                          className={`px-4 py-2 rounded transition-colors ${
                            selectedOrderForUpdate === order._id
                              ? 'bg-red-500 text-white hover:bg-red-600'
                              : 'bg-blue-500 text-white hover:bg-blue-600'
                          }`}
                        >
                          {selectedOrderForUpdate === order._id ? '📍 Close GPS Update' : '📍 Update with GPS'}
                        </button>
                        <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition-colors">
                          View Details
                        </button>
                      </div>

                      {/* GPS Tracking Update Component */}
                      {selectedOrderForUpdate === order._id && (
                        <div className="mt-4 border-t pt-4">
                          <GPSTrackingUpdate
                            order={order}
                            onUpdate={(updatedOrder) => {
                              // Refresh orders after update
                              fetchOrders();
                              setSelectedOrderForUpdate(null);
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">📋</div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No Orders Yet</h3>
                  <p className="text-gray-500">Orders will appear here when customers purchase your products.</p>
                </div>
              )}
            </div>
          )}

          {/* Raw Material Tracking Tab */}
          {activeTab === 'tracking' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Raw Material Tracking</h2>
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {rawMaterialPurchases.length} Raw Material Orders
                </div>
              </div>

              {rawMaterialPurchases.length > 0 ? (
                <div className="space-y-6">
                  {rawMaterialPurchases.map((purchase) => (
                    <div key={purchase._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      {/* Purchase Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            {purchase.productName || purchase.name || 'Raw Material Order'}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Order ID: {purchase.purchaseId || purchase._id?.slice(-8)}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                            purchase.currentStatus === 'delivered' ? 'bg-green-100 text-green-800' :
                            purchase.currentStatus === 'shipped' ? 'bg-blue-100 text-blue-800' :
                            purchase.currentStatus === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {purchase.currentStatus?.charAt(0).toUpperCase() + purchase.currentStatus?.slice(1) || 'Processing'}
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            ${purchase.totalAmount || purchase.price || '0.00'}
                          </p>
                        </div>
                      </div>

                      {/* Tracking Timeline */}
                      <div className="border-t pt-4">
                        <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                          <span className="mr-2">📍</span>
                          GPS Tracking Timeline
                        </h4>

                        {purchase.trackingEvents && purchase.trackingEvents.length > 0 ? (
                          <div className="space-y-4">
                            {purchase.trackingEvents
                              .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                              .map((event, index) => (
                              <div key={index} className="flex items-start space-x-4">
                                <div className={`w-3 h-3 rounded-full mt-2 ${
                                  event.status === 'delivered' ? 'bg-green-500' :
                                  event.status === 'shipped' ? 'bg-blue-500' :
                                  event.status === 'processing' ? 'bg-yellow-500' :
                                  'bg-gray-400'
                                }`}></div>

                                <div className="flex-1 min-w-0">
                                  <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                      <h5 className="font-medium text-gray-800 capitalize">
                                        {event.status?.replace('_', ' ') || 'Status Update'}
                                      </h5>
                                      <span className="text-sm text-gray-500">
                                        {new Date(event.timestamp).toLocaleString()}
                                      </span>
                                    </div>

                                    <p className="text-sm text-gray-600 mb-2">
                                      {event.description || `Order has been ${event.status?.replace('_', ' ')}`}
                                    </p>

                                    {/* GPS Location Information */}
                                    {event.location && (
                                      <div className="bg-white rounded p-3 mt-3 border border-gray-200">
                                        <div className="flex items-center justify-between mb-2">
                                          <span className="text-sm font-medium text-gray-700">📍 Location Update</span>
                                          {event.location.coordinates && (
                                            <a
                                              href={`https://www.google.com/maps?q=${event.location.coordinates.latitude},${event.location.coordinates.longitude}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                            >
                                              🗺️ View on Google Maps
                                            </a>
                                          )}
                                        </div>

                                        {event.location.address && (
                                          <p className="text-sm text-gray-600 mb-1">
                                            📍 {event.location.address}
                                          </p>
                                        )}

                                        {event.location.coordinates && (
                                          <p className="text-xs text-gray-500">
                                            🎯 GPS: {event.location.coordinates.latitude}, {event.location.coordinates.longitude}
                                          </p>
                                        )}

                                        {event.location.facilityType && (
                                          <p className="text-xs text-gray-500 mt-1">
                                            🏭 Facility: {event.location.facilityType}
                                          </p>
                                        )}

                                        {event.handledBy && (
                                          <div className="mt-2 pt-2 border-t border-gray-100">
                                            <p className="text-xs text-gray-500">
                                              🏭 Updated by {event.updatedByRole} ({event.handledBy.name})
                                            </p>
                                          </div>
                                        )}

                                        {event.notes && (
                                          <p className="text-xs text-gray-500 mt-1">
                                            💬 {event.notes}
                                          </p>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 bg-gray-50 rounded-lg">
                            <div className="text-gray-400 text-2xl mb-2">📍</div>
                            <p className="text-gray-500 text-sm">No tracking information available yet</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">📦</div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No Raw Material Orders</h3>
                  <p className="text-gray-500">Your raw material orders and their GPS tracking information will appear here.</p>
                  <p className="text-gray-400 text-sm mt-2">Purchase raw materials from suppliers to see tracking information.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md mx-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Product</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  placeholder="Enter product name"
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Enter product description"
                  value={newProduct.description}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, description: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (ETH)
                </label>
                <input
                  type="number"
                  step="0.001"
                  placeholder="0.00"
                  value={newProduct.price}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, price: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="Enter location"
                  value={newProduct.location}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, location: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-8">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddProduct}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
              >
                Add Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
