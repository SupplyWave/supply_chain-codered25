import { useEffect, useState } from "react";
import { useTracking } from "../../Context/Tracking";
import ProtectedRoute from "../../Components/ProtectedRoute";
import MetaMaskStatus from "../../Components/MetaMaskStatus";
import Web3 from "web3";
import { serializeTransactionReceipt, handleWeb3Error } from "../../utils/blockchain";

export default function CustomerDashboard() {
  const [products, setProducts] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('products'); // 'products' or 'orders'

  const {
    currentUser,
    isAuthenticated,
    userRole,
    userProfile,
    hasPermission,
    USER_ROLES,
    verifyWalletConnection
  } = useTracking();

  useEffect(() => {
    if (isAuthenticated && hasPermission('canViewProducts')) {
      fetchProducts();
      fetchPurchases();

    }
  }, [isAuthenticated, userProfile]);

  // Auto-refresh tracking data every 30 seconds when on orders tab
  useEffect(() => {
    let interval;
    if (activeTab === 'orders' && isAuthenticated) {
      interval = setInterval(() => {
        fetchPurchases();
      }, 30000); // Refresh every 30 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTab, isAuthenticated]);



  // Fetch products from the backend or API
  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/addProduct");  // Correct endpoint
      const data = await response.json();

      if (data.success) {
        setProducts(data.data);
      } else {
        console.error("Failed to fetch products.");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchPurchases = async () => {
    try {
      const response = await fetch(`/api/purchases/user?userId=${currentUser}&role=customer`);
      const data = await response.json();
      if (data.success) {
        setPurchases(data.data);
      } else {
        console.error("Failed to fetch purchases.");
      }
    } catch (error) {
      console.error("Error fetching purchases:", error);
    }
  };

  // Handle the Buy Click with MetaMask transaction
  const handleBuyClick = async (product) => {
    if (!hasPermission('canBuyProducts')) {
      alert("You don't have permission to buy products");
      return;
    }

    try {
      // Verify wallet connection matches authenticated user
      await verifyWalletConnection();

      if (!window.ethereum) {
        alert("MetaMask not detected. Please install MetaMask.");
        return;
      }

      const web3 = new Web3(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const accounts = await web3.eth.getAccounts();
      const userAddress = accounts[0]; // Customer's MetaMask address

      // Verify the connected wallet matches the registered wallet
      if (userAddress.toLowerCase() !== currentUser.toLowerCase()) {
        alert("Please connect the MetaMask wallet that matches your registered address: " + currentUser);
        return;
      }
  
      if (!userAddress) {
        alert("Unable to fetch wallet address. Please try again.");
        return;
      }
  
      const recipient = product.addedBy; // Manufacturer's address (addedBy)
      const priceInWei = web3.utils.toWei(product.price.toString(), "ether");
  
      if (!recipient || recipient.length !== 42 || !recipient.startsWith('0x')) {
        alert("Invalid recipient address.");
        return;
      }
  
      const balance = await web3.eth.getBalance(userAddress);
      if (Number(balance) < Number(priceInWei)) {
        alert("Insufficient balance for the transaction.");
        return;
      }
  
      setIsProcessing(true);
      setSelectedProduct(product);
  
      // Perform the transaction from the customer to the manufacturer's address (addedBy)
      const transaction = {
        from: userAddress,
        to: recipient,
        value: priceInWei,
        gas: 21000,
        gasPrice: web3.utils.toWei("20", "gwei"),
      };
  
      const receipt = await web3.eth.sendTransaction(transaction);
      console.log("Transaction receipt:", receipt);

      // Create purchase record with tracking using utility function
      const serializedReceipt = serializeTransactionReceipt(receipt);
      const quantity = 1; // Default quantity
      const totalAmount = product.price * quantity;

      const purchaseData = {
        productId: product._id,
        productName: product.name,
        productDescription: product.description,
        quantity: quantity,
        unitPrice: product.price,
        totalAmount: totalAmount,
        customerId: userAddress,
        customerName: userProfile?.profile?.name || userProfile?.username || 'Customer',
        producerId: product.addedBy,
        producerName: 'Producer', // Will be updated by the API
        purchaseId: `PUR-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        ...serializedReceipt,
        deliveryAddress: {
          street: userProfile?.profile?.address || "123 Main St",
          city: userProfile?.profile?.city || "City",
          state: userProfile?.profile?.state || "State",
          zipCode: userProfile?.profile?.zipCode || "12345",
          country: userProfile?.profile?.country || "USA"
        },
        // Initial tracking event
        initialTrackingEvent: {
          status: 'order_placed',
          description: 'Order has been placed and payment confirmed',
          location: {
            address: userProfile?.profile?.address || "Customer Location",
            city: userProfile?.profile?.city || "City",
            state: userProfile?.profile?.state || "State",
            country: userProfile?.profile?.country || "USA",
            facilityType: 'customer_location'
          },
          updatedBy: userAddress,
          updatedByRole: 'customer'
        }
      };

      const purchaseResponse = await fetch("/api/purchase/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(purchaseData),
      });

      const purchaseResult = await purchaseResponse.json();
      if (purchaseResult.success) {
        alert(`Purchase successful! Your tracking ID is: ${purchaseResult.data.purchaseId}`);
        fetchProducts(); // Refresh the product list
        fetchPurchases(); // Refresh the purchases list
      } else {
        alert("Transaction successful, but failed to create purchase record: " + purchaseResult.message);
      }
    } catch (error) {
      console.error("Transaction error:", error);
      alert(handleWeb3Error(error));
    } finally {
      setIsProcessing(false);
      setSelectedProduct(null);
    }
  };




  return (
    <ProtectedRoute requiredRole={USER_ROLES.CUSTOMER}>
      <div className="min-h-screen bg-light p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">Customer Dashboard</h1>
              <p className="text-medium">
                Browse and purchase products directly from producers.
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

          {/* Stats Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card shadow-medium">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-secondary bg-opacity-10 text-secondary">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-medium">Available Products</p>
                  <p className="text-2xl font-bold text-secondary">{products.length}</p>
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
                  <p className="text-sm font-medium text-medium">Active Producers</p>
                  <p className="text-2xl font-bold text-accent">
                    {new Set(products.map(p => p.addedBy)).size}
                  </p>
                </div>
              </div>
            </div>

            <div className="card shadow-medium">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-primary bg-opacity-10 text-primary">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-medium">My Orders</p>
                  <p className="text-2xl font-bold text-primary">{purchases.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="card mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('products')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'products'
                      ? 'border-accent text-accent'
                      : 'border-transparent text-medium hover:text-primary hover:border-gray-300'
                  }`}
                >
                  Available Products
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'orders'
                      ? 'border-accent text-accent'
                      : 'border-transparent text-medium hover:text-primary hover:border-gray-300'
                  }`}
                >
                  My Orders & Tracking
                </button>
              </nav>
            </div>
          </div>

          {/* Products Section */}
          {activeTab === 'products' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Available Products</h2>
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {products.length} Products
                </div>
              </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.length > 0 ? (
                products.map((product) => (
                  <div
                    key={product._id}
                    className="border border-gray-200 p-6 rounded-xl hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-gray-50"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold text-xl text-gray-800">
                        {product.name}
                      </h3>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
                        {product.price} ETH
                      </span>
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {product.description}
                    </p>

                    <div className="space-y-2 mb-6">
                      <p className="text-sm text-gray-500">
                        <strong>Location:</strong> {product.location}
                      </p>
                      <p className="text-sm text-gray-500">
                        <strong>Producer:</strong> {product.addedBy?.slice(0, 6)}...{product.addedBy?.slice(-4)}
                      </p>
                    </div>

                    <button
                      onClick={() => handleBuyClick(product)}
                      disabled={isProcessing && selectedProduct?._id === product._id}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 transition-all duration-200 font-semibold"
                    >
                      {isProcessing && selectedProduct?._id === product._id ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </div>
                      ) : (
                        "Purchase Product"
                      )}
                    </button>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">🛒</div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No Products Available</h3>
                  <p className="text-gray-500">
                    Check back later for new products from producers.
                  </p>
                </div>
              )}
            </div>
            </div>
          )}

          {/* Orders & Tracking Section */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">My Orders & GPS Tracking</h2>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={fetchPurchases}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center text-sm"
                  >
                    🔄 Refresh Tracking
                  </button>
                  <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                    {purchases.length} Orders
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {purchases.length > 0 ? (
                  purchases.map((purchase) => (
                    <div
                      key={purchase._id}
                      className="border border-gray-200 p-6 rounded-xl hover:shadow-md transition-shadow bg-gradient-to-br from-white to-gray-50"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-xl text-gray-800 mb-2">
                            {purchase.productName}
                          </h3>
                          <p className="text-sm text-gray-500 mb-2">
                            <strong>Order ID:</strong> {purchase.purchaseId}
                          </p>
                          <p className="text-sm text-gray-500 mb-2">
                            <strong>Producer:</strong> {purchase.producerName}
                          </p>
                          <p className="text-sm text-gray-500">
                            <strong>Order Date:</strong> {new Date(purchase.orderDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold mb-2 block">
                            {purchase.totalAmount} ETH
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            purchase.currentStatus === 'delivered' ? 'bg-green-100 text-green-800' :
                            purchase.currentStatus === 'shipped' ? 'bg-blue-100 text-blue-800' :
                            purchase.currentStatus === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {purchase.currentStatus.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>

                      {/* Enhanced GPS Tracking Timeline */}
                      <div className="mt-4 border-t pt-4">
                        <h4 className="font-semibold text-gray-800 mb-3">📍 Real-Time GPS Tracking</h4>
                        <div className="space-y-4">
                          {purchase.trackingEvents && purchase.trackingEvents.slice(-5).reverse().map((event, index) => (
                            <div key={index} className="relative">
                              {/* Timeline connector */}
                              {index < purchase.trackingEvents.slice(-5).length - 1 && (
                                <div className="absolute left-4 top-8 w-0.5 h-12 bg-gray-200"></div>
                              )}

                              <div className="flex items-start space-x-3">
                                {/* Status icon */}
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                                  event.status === 'delivered' ? 'bg-green-500' :
                                  event.status === 'out_for_delivery' ? 'bg-blue-500' :
                                  event.status === 'in_transit' ? 'bg-purple-500' :
                                  event.status === 'shipped' ? 'bg-orange-500' :
                                  event.status === 'processing' ? 'bg-yellow-500' :
                                  'bg-gray-500'
                                }`}>
                                  {event.status === 'delivered' ? '✓' :
                                   event.status === 'out_for_delivery' ? '🚚' :
                                   event.status === 'in_transit' ? '📦' :
                                   event.status === 'shipped' ? '📤' :
                                   event.status === 'processing' ? '⚙️' :
                                   '📋'}
                                </div>

                                {/* Event details */}
                                <div className="flex-1 min-w-0">
                                  <div className="bg-gray-50 rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="font-semibold text-gray-800">
                                        {event.status.replace('_', ' ').toUpperCase()}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        {new Date(event.timestamp).toLocaleString()}
                                      </span>
                                    </div>

                                    <p className="text-sm text-gray-600 mb-2">{event.description}</p>

                                    {/* GPS Location Information */}
                                    {event.location && (
                                      <div className="mt-2 p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                                        <div className="flex items-center mb-1">
                                          <span className="text-blue-600 mr-1">📍</span>
                                          <span className="text-sm font-medium text-blue-800">Location Update</span>
                                        </div>

                                        {event.location.address && (
                                          <p className="text-sm text-blue-700 mb-1">
                                            📍 {event.location.address}
                                          </p>
                                        )}

                                        {event.location.coordinates && event.location.coordinates.latitude && (
                                          <div className="text-xs text-blue-600 space-y-1">
                                            <p>🎯 GPS: {event.location.coordinates.latitude.toFixed(6)}, {event.location.coordinates.longitude.toFixed(6)}</p>

                                            {/* Google Maps link */}
                                            <a
                                              href={`https://www.google.com/maps?q=${event.location.coordinates.latitude},${event.location.coordinates.longitude}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="inline-flex items-center text-blue-600 hover:text-blue-800 underline"
                                            >
                                              🗺️ View on Google Maps
                                            </a>
                                          </div>
                                        )}

                                        {event.location.facilityType && (
                                          <p className="text-xs text-blue-600 mt-1">
                                            🏭 Facility: {event.location.facilityType.replace('_', ' ')}
                                          </p>
                                        )}
                                      </div>
                                    )}

                                    {/* Producer/Updater Information */}
                                    {event.updatedByRole && (
                                      <div className="mt-2 flex items-center text-xs text-gray-500">
                                        <span className="mr-1">
                                          {event.updatedByRole === 'producer' ? '🏭' :
                                           event.updatedByRole === 'logistics' ? '🚛' :
                                           event.updatedByRole === 'supplier' ? '📦' : '👤'}
                                        </span>
                                        <span>Updated by {event.updatedByRole}</span>
                                        {event.handledBy && event.handledBy.name && (
                                          <span className="ml-1">({event.handledBy.name})</span>
                                        )}
                                      </div>
                                    )}

                                    {/* Additional notes */}
                                    {event.notes && (
                                      <div className="mt-2 p-2 bg-yellow-50 rounded text-xs text-yellow-800">
                                        💬 {event.notes}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Estimated Delivery */}
                        {purchase.estimatedDeliveryDate && (
                          <div className="mt-4 p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                            <div className="flex items-center">
                              <span className="text-green-600 mr-2">🚚</span>
                              <div>
                                <p className="text-sm font-medium text-green-800">Estimated Delivery</p>
                                <p className="text-sm text-green-700">
                                  {new Date(purchase.estimatedDeliveryDate).toLocaleDateString()} at {new Date(purchase.estimatedDeliveryDate).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Real-time tracking notice */}
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center">
                            <span className="text-blue-600 mr-2">📱</span>
                            <div>
                              <p className="text-sm font-medium text-blue-800">Real-Time GPS Tracking</p>
                              <p className="text-xs text-blue-600">
                                Location updates are provided automatically by the producer using GPS technology
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">📦</div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No Orders Yet</h3>
                    <p className="text-gray-500 mb-4">
                      You haven't made any purchases yet.
                    </p>
                    <button
                      onClick={() => setActiveTab('products')}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Browse Products
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}


        </div>
      </div>
    </ProtectedRoute>
  );
}
