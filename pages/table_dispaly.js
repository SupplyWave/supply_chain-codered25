import { useEffect, useState } from "react";
import { useTracking } from "../Context/Tracking";
import ProtectedRoute from "../Components/ProtectedRoute";

export default function TrackingTable() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  const {
    currentUser,
    isAuthenticated,
    userRole,
    hasPermission,
    USER_ROLES
  } = useTracking();

  useEffect(() => {
    if (isAuthenticated && hasPermission('canViewOwnShipments')) {
      fetchPurchases();
    }
  }, [isAuthenticated]);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/purchases/user?userId=${currentUser}&role=${userRole}`);
      const data = await response.json();

      if (data.success) {
        setPurchases(data.data);
      } else {
        console.error("Failed to fetch purchases:", data.message);
      }
    } catch (error) {
      console.error("Error fetching purchases:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrackingDetails = async (purchaseId) => {
    try {
      const response = await fetch(`/api/tracking/${purchaseId}`);
      const data = await response.json();

      if (data.success) {
        setSelectedPurchase(data.data);
      } else {
        alert("Failed to fetch tracking details: " + data.message);
      }
    } catch (error) {
      console.error("Error fetching tracking details:", error);
      alert("Error fetching tracking details");
    }
  };

  const filteredPurchases = purchases.filter(purchase =>
    purchase.purchaseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    purchase.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    purchase.currentStatus.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading tracking information...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Tracking</h1>
            <p className="text-gray-600">
              Track your orders and shipments in real-time
            </p>
            <div className="mt-2 text-sm text-gray-500">
              Connected as: {currentUser?.slice(0, 6)}...{currentUser?.slice(-4)} ({userRole})
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by Order ID, Product Name, or Status..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input"
                />
              </div>
              <button
                onClick={fetchPurchases}
                className="btn btn-primary"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Tracking Cards */}
          <div className="space-y-6">
            {filteredPurchases.length > 0 ? (
              filteredPurchases.map((purchase) => (
                <div
                  key={purchase._id}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">
                        {purchase.productName}
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Order ID:</span>
                          <p className="font-mono text-blue-600">{purchase.purchaseId}</p>
                        </div>
                        <div>
                          <span className="font-medium">Order Date:</span>
                          <p>{new Date(purchase.orderDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <span className="font-medium">Amount:</span>
                          <p className="font-bold text-green-600">{purchase.totalAmount} ETH</p>
                        </div>
                        <div>
                          <span className="font-medium">Quantity:</span>
                          <p>{purchase.quantity}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                        purchase.currentStatus === 'delivered' ? 'bg-green-100 text-green-800' :
                        purchase.currentStatus === 'shipped' || purchase.currentStatus === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                        purchase.currentStatus === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        purchase.currentStatus === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {purchase.currentStatus.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between text-xs text-gray-500 mb-2">
                      <span>Order Placed</span>
                      <span>Processing</span>
                      <span>Shipped</span>
                      <span>Delivered</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          purchase.currentStatus === 'delivered' ? 'bg-green-500 w-full' :
                          purchase.currentStatus === 'shipped' || purchase.currentStatus === 'in_transit' ? 'bg-blue-500 w-3/4' :
                          purchase.currentStatus === 'processing' ? 'bg-yellow-500 w-1/2' :
                          'bg-gray-400 w-1/4'
                        }`}
                      ></div>
                    </div>
                  </div>

                  {/* Tracking Timeline */}
                  <div className="border-t pt-6">
                    <h4 className="font-semibold text-gray-800 mb-4">Tracking History</h4>
                    <div className="space-y-4">
                      {purchase.trackingEvents && purchase.trackingEvents.map((event, index) => (
                        <div key={index} className="flex items-start">
                          <div className={`w-4 h-4 rounded-full mt-1 mr-4 ${
                            event.status === 'delivered' ? 'bg-green-500' :
                            event.status === 'shipped' || event.status === 'in_transit' ? 'bg-blue-500' :
                            event.status === 'processing' ? 'bg-yellow-500' :
                            'bg-gray-400'
                          }`}></div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="font-medium text-gray-800">
                                  {event.status.replace('_', ' ').toUpperCase()}
                                </h5>
                                <p className="text-gray-600 text-sm">{event.description}</p>
                                <p className="text-gray-500 text-xs mt-1">
                                  Location: {event.location}
                                </p>
                              </div>
                              <span className="text-gray-400 text-xs">
                                {new Date(event.timestamp).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Transaction Details */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h5 className="font-medium text-gray-800 mb-2">Blockchain Transaction</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Transaction Hash:</span>
                        <p className="font-mono text-blue-600 break-all">{purchase.transactionHash}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Block Number:</span>
                        <p className="font-mono">{purchase.blockNumber || 'Pending'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <div className="text-gray-400 text-6xl mb-4">📦</div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Orders Found</h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm ? 'No orders match your search criteria.' : 'You haven\'t made any orders yet.'}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
