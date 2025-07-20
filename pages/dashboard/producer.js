import { useEffect, useState } from "react";
import { useTracking } from "../../Context/Tracking";
import MetaMaskStatus from "../../Components/MetaMaskStatus";
import GPSTrackingUpdate from "../../Components/GPSTrackingUpdate";
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
  const [activeTab, setActiveTab] = useState('materials'); // 'materials', 'products', 'orders', 'tracking'
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
      // Fetch all raw materials to find ones where this producer has made payments
      const response = await fetch('/api/rawMaterial');
      const data = await response.json();

      if (data.success) {
        // Find raw materials where this producer has made approved payments
        const rawMaterialOrders = [];

        data.data.forEach(material => {
          if (material.approvedPayments && material.approvedPayments.length > 0) {
            // Find payments made by this producer
            const producerPayments = material.approvedPayments.filter(payment =>
              payment.producerWalletAddress?.toLowerCase() === currentUser?.toLowerCase() ||
              payment.manufacturerWalletAddress?.toLowerCase() === currentUser?.toLowerCase()
            );

            // Create order objects for each payment with tracking data
            producerPayments.forEach(payment => {
              rawMaterialOrders.push({
                _id: `${material._id}-${payment._id || payment.date}`,
                materialId: material._id,
                materialName: material.name,
                materialDescription: material.description || '',
                quantity: material.quantity || 1,
                unitPrice: material.price,
                totalAmount: payment.amountPaid,
                supplierId: material.addedBy,
                supplierName: 'Supplier', // Could be enhanced with actual supplier name
                transactionHash: payment.transactionHash,
                deliveryAddress: material.location,
                currentStatus: payment.currentStatus || 'order_placed',
                orderDate: payment.date,
                trackingEvents: payment.trackingEvents || [],
                isRawMaterial: true,
                // Additional purchase info
                productName: material.name,
                productDescription: material.description,
                category: 'Raw Material',
                productType: 'rawMaterial'
              });
            });
          }
        });

        setRawMaterialPurchases(rawMaterialOrders);
      } else {
        console.error("Failed to fetch raw material purchases.");
      }
    } catch (error) {
      console.error("Error fetching raw material purchases:", error);
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
    <div className="min-h-screen bg-light p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">Producer Dashboard</h1>
            <p className="text-medium">
              Welcome back! Manage your raw materials and products.
            </p>
            <div className="mt-2 text-sm text-light">
              Connected as: {currentUser?.slice(0, 6)}...{currentUser?.slice(-4)}
            </div>
          </div>

        </div>

        {/* MetaMask Status */}
        <div className="mb-6">
          <MetaMaskStatus />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card shadow-medium">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-secondary bg-opacity-10 text-secondary">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-primary">Raw Materials</h2>
                <p className="text-3xl font-bold text-secondary">{rawMaterials.length}</p>
              </div>
            </div>
          </div>

          <div className="card shadow-medium">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-accent bg-opacity-10 text-accent">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-primary">My Products</h2>
                <p className="text-3xl font-bold text-accent">{products.length}</p>
              </div>
            </div>
          </div>

          <div className="card shadow-medium">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-primary bg-opacity-10 text-primary">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-primary">Orders</h2>
                <p className="text-3xl font-bold text-primary">{orders.length}</p>
              </div>
            </div>
          </div>

          <div className="card shadow-medium">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-secondary bg-opacity-10 text-secondary">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-primary">Tracking</h2>
                <p className="text-3xl font-bold text-secondary">{rawMaterialPurchases.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="card mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">

              <button
                onClick={() => setActiveTab('materials')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'materials'
                    ? 'border-accent text-accent'
                    : 'border-transparent text-medium hover:text-primary hover:border-gray-300'
                }`}
              >
                Raw Materials
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'products'
                    ? 'border-accent text-accent'
                    : 'border-transparent text-medium hover:text-primary hover:border-gray-300'
                }`}
              >
                My Products
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'orders'
                    ? 'border-accent text-accent'
                    : 'border-transparent text-medium hover:text-primary hover:border-gray-300'
                }`}
              >
                Order Management
              </button>
              <button
                onClick={() => setActiveTab('tracking')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'tracking'
                    ? 'border-accent text-accent'
                    : 'border-transparent text-medium hover:text-primary hover:border-gray-300'
                }`}
              >
                Raw Material Tracking
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div>


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
                  <div className="mt-4 p-4 bg-gray-100 rounded-lg text-left">
                    <p className="text-xs text-gray-600">Debug Info:</p>
                    <p className="text-xs text-gray-500">Current User: {currentUser}</p>
                    <p className="text-xs text-gray-500">Raw Material Orders Found: {rawMaterialPurchases.length}</p>
                  </div>
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
                  className="form-input"
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
                  className="form-input"
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
                  className="form-input"
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
                  className="form-input"
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
