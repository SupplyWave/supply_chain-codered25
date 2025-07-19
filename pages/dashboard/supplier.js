import { useState, useEffect } from "react";
import { useTracking } from "../../Context/Tracking";
import ProtectedRoute from "../../Components/ProtectedRoute";
import GPSTrackingUpdate from "../../Components/GPSTrackingUpdate";

const SupplierDashboard = () => {
  const [activeTab, setActiveTab] = useState('materials'); // 'materials', 'orders', 'tracking'
  const [formData, setFormData] = useState({
    // Basic Product Details
    name: "",
    category: "Raw Material",
    description: "",
    technicalSpecs: "",
    materialType: "",

    // Pricing & Availability
    price: "",
    currency: "ETH",
    availableStock: "",

    // Location & Images
    location: "",
    productImages: "",

    // Additional fields from existing schema
    unit: "kg"
  });
  const [rawMaterials, setRawMaterials] = useState([]);
  const [approvedPayments, setApprovedPayments] = useState([]);
  const [rawMaterialOrders, setRawMaterialOrders] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const {
    currentUser,
    isAuthenticated,
    USER_ROLES
  } = useTracking();

  // Fetch raw material orders (purchases made by producers)
  const fetchRawMaterialOrders = async () => {
    try {
      // Get all raw materials by this supplier
      const materialsResponse = await fetch("/api/rawMaterial");
      const materialsData = await materialsResponse.json();
      
      if (materialsData.success) {
        // Filter materials by current supplier and get those with approved payments
        const supplierMaterials = materialsData.data.filter(
          material => material.addedBy === currentUser && 
          material.approvedPayments && 
          material.approvedPayments.length > 0
        );
        
        // Transform into order format for tracking
        const orders = supplierMaterials.flatMap(material => 
          material.approvedPayments.map(payment => ({
            _id: `${material._id}-${payment._id || payment.date}`,
            materialId: material._id,
            materialName: material.name,
            materialDescription: material.description || '',
            quantity: material.quantity || 1,
            unitPrice: material.price,
            totalAmount: payment.amountPaid,
            customerId: payment.producerWalletAddress || payment.manufacturerWalletAddress,
            customerName: payment.producerName || payment.manufacturerName,
            supplierId: currentUser,
            supplierName: 'Your Company',
            transactionHash: payment.transactionHash,
            deliveryAddress: material.location,
            currentStatus: 'order_placed',
            orderDate: payment.date,
            trackingEvents: [],
            isRawMaterial: true
          }))
        );
        
        setRawMaterialOrders(orders);
      }
    } catch (error) {
      console.error("Error fetching raw material orders:", error);
    }
  };

  // Auto-refresh tracking data every 30 seconds when on tracking tab
  useEffect(() => {
    let interval;
    if (activeTab === 'tracking' && isAuthenticated) {
      interval = setInterval(() => {
        fetchRawMaterialOrders();
      }, 30000); // Refresh every 30 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTab, isAuthenticated]);

  const fetchRawMaterials = async () => {
    try {
      const response = await fetch("/api/rawMaterial");
      const data = await response.json();
      if (data.success) {
        const userMaterials = data.data.filter(
          (material) => material.addedBy === currentUser
        );
        setRawMaterials(userMaterials);
      } else {
        console.error("Failed to fetch raw materials.");
      }
    } catch (error) {
      console.error("Error fetching raw materials:", error);
    }
  };

  const fetchApprovedPayments = async () => {
    try {
      const response = await fetch("/api/rawMaterial");
      const data = await response.json();
      if (data.success) {
        const userMaterials = data.data.filter(
          (material) => material.addedBy === currentUser
        );
        const payments = userMaterials.flatMap((material) =>
          material.approvedPayments || []
        );
        setApprovedPayments(payments);
      }
    } catch (error) {
      console.error("Error fetching approved payments:", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      fetchRawMaterials();
      fetchApprovedPayments();
      fetchRawMaterialOrders();
    }
  }, [isAuthenticated, currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Prepare comprehensive material data
      const materialData = {
        ...formData,
        addedBy: currentUser,
        quantity: parseInt(formData.availableStock) || 1,
        isAvailable: parseInt(formData.availableStock) > 0
      };

      const response = await fetch("/api/rawMaterial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(materialData),
      });

      const result = await response.json();
      if (result.success) {
        alert("Raw material added successfully!");
        // Reset form to initial state
        setFormData({
          name: "", category: "Raw Material", description: "", technicalSpecs: "",
          materialType: "", price: "", currency: "ETH", availableStock: "",
          location: "", productImages: "", unit: "kg"
        });
        setShowForm(false);
        fetchRawMaterials();
      } else {
        alert("Failed to add raw material: " + result.message);
      }
    } catch (error) {
      console.error("Error adding raw material:", error);
      alert("Error adding raw material. Please try again.");
    }
  };

  // Function to update material availability
  const updateMaterialAvailability = async (materialId, newStock) => {
    try {
      const response = await fetch(`/api/rawMaterial?id=${materialId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: materialId,
          availableStock: newStock,
          quantity: newStock,
          isAvailable: newStock > 0
        }),
      });

      const result = await response.json();
      if (result.success) {
        if (newStock === 0) {
          alert("Material stock updated to 0. Material will be automatically removed.");
        } else {
          alert("Material availability updated successfully!");
        }
        fetchRawMaterials();
      } else {
        alert("Failed to update material: " + result.message);
      }
    } catch (error) {
      console.error("Error updating material:", error);
      alert("Error updating material. Please try again.");
    }
  };

  if (!isAuthenticated) {
    return <div>Please connect your wallet to access the supplier dashboard.</div>;
  }

  return (
    <ProtectedRoute requiredRole={USER_ROLES.SUPPLIER}>
      <div className="min-h-screen bg-light p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">Supplier Dashboard</h1>
              <p className="text-medium">
                Welcome back! Manage your raw materials and track payments.
              </p>
              <div className="mt-2 text-sm text-light">
                Connected as: {currentUser?.slice(0, 6)}...{currentUser?.slice(-4)}
              </div>
            </div>

          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card shadow-medium">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-accent bg-opacity-10 text-accent">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-semibold text-primary">Raw Materials</h2>
                  <p className="text-3xl font-bold text-accent">{rawMaterials.length}</p>
                </div>
              </div>
            </div>

            <div className="card shadow-medium">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-secondary bg-opacity-10 text-secondary">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-semibold text-primary">Orders</h2>
                  <p className="text-3xl font-bold text-secondary">{rawMaterialOrders.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-semibold text-gray-800">Payments</h2>
                  <p className="text-3xl font-bold text-purple-600">{approvedPayments.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-xl shadow-lg mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
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
                  onClick={() => setActiveTab('orders')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'orders'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Material Orders
                </button>
                <button
                  onClick={() => setActiveTab('tracking')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'tracking'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Shipment Tracking
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {/* Raw Materials Tab */}
              {activeTab === 'materials' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">My Raw Materials</h2>
                    <button
                      onClick={() => setShowForm(!showForm)}
                      className="btn btn-primary shadow-medium flex items-center"
                    >
                      <span className="mr-2">+</span>
                      Add Material
                    </button>
                  </div>

                  <div className="space-y-4">
                    {rawMaterials.length > 0 ? (
                      rawMaterials.map((material) => (
                        <div
                          key={material._id}
                          className="border border-gray-200 p-6 rounded-lg hover:shadow-md transition-shadow bg-white"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-xl text-gray-800 mb-2">
                                {material.name}
                              </h3>
                              <div className="flex items-center space-x-3 mb-2">
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                                  {material.category || 'Raw Material'}
                                </span>
                                <span className={`px-2 py-1 rounded text-sm font-medium ${
                                  (material.quantity || material.availableStock) > 0
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {(material.quantity || material.availableStock) > 0 ? 'In Stock' : 'Out of Stock'}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-green-600 mb-1">
                                {material.price} {material.currency || 'ETH'}
                              </div>
                              <div className="text-sm text-gray-500">
                                Stock: {material.quantity || material.availableStock || 0} {material.unit || 'units'}
                              </div>
                            </div>
                          </div>

                          {/* Product Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-gray-600 mb-2">
                                <strong>Description:</strong> {material.description || 'No description provided'}
                              </p>
                              <p className="text-gray-600 mb-2">
                                <strong>Location:</strong> {material.location}
                              </p>
                              <p className="text-gray-600 mb-2">
                                <strong>Material Type:</strong> {material.materialType || 'Not specified'}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600 mb-2">
                                <strong>Technical Specs:</strong> {material.technicalSpecs || 'Not provided'}
                              </p>
                            </div>
                          </div>

                          {/* Availability Management */}
                          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                            <div className="flex items-center space-x-4">
                              <label className="text-sm font-medium text-gray-700">Update Stock:</label>
                              <input
                                type="number"
                                min="0"
                                defaultValue={material.quantity || material.availableStock || 0}
                                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                onBlur={(e) => {
                                  const newStock = parseInt(e.target.value) || 0;
                                  if (newStock !== (material.quantity || material.availableStock || 0)) {
                                    updateMaterialAvailability(material._id, newStock);
                                  }
                                }}
                              />
                              <span className="text-sm text-gray-500">{material.unit || 'units'}</span>
                            </div>
                            <div className="text-sm text-gray-500">
                              Total Sold: {material.totalSold || 0} {material.currency || 'ETH'}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-gray-400 text-4xl mb-4">📦</div>
                        <p className="text-gray-500">No raw materials added yet</p>
                        <button
                          onClick={() => setShowForm(true)}
                          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Add Your First Material
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Material Orders Tab */}
              {activeTab === 'orders' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Material Orders</h2>
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      {rawMaterialOrders.length} Orders
                    </div>
                  </div>

                  {rawMaterialOrders.length > 0 ? (
                    <div className="space-y-4">
                      {rawMaterialOrders.map((order) => (
                        <div key={order._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-800">
                                {order.materialName}
                              </h3>
                              <p className="text-sm text-gray-500">
                                Order from: {order.customerName}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                                order.currentStatus === 'delivered' ? 'bg-green-100 text-green-800' :
                                order.currentStatus === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                order.currentStatus === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {order.currentStatus?.charAt(0).toUpperCase() + order.currentStatus?.slice(1) || 'Order Placed'}
                              </div>
                              <p className="text-sm text-gray-500 mt-1">
                                {order.totalAmount} ETH
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Quantity:</span> {order.quantity}
                            </div>
                            <div>
                              <span className="font-medium">Unit Price:</span> {order.unitPrice} ETH
                            </div>
                            <div>
                              <span className="font-medium">Order Date:</span> {new Date(order.orderDate).toLocaleDateString()}
                            </div>
                            <div>
                              <span className="font-medium">Delivery:</span> {order.deliveryAddress}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-gray-400 text-6xl mb-4">📋</div>
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">No Material Orders</h3>
                      <p className="text-gray-500">Orders from producers will appear here when they purchase your raw materials.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Shipment Tracking Tab */}
              {activeTab === 'tracking' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Shipment Tracking</h2>
                    <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      GPS Tracking Updates
                    </div>
                  </div>

                  {rawMaterialOrders.length > 0 ? (
                    <div className="space-y-6">
                      {rawMaterialOrders.map((order) => (
                        <div key={order._id} className="border border-gray-200 rounded-lg p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-800">
                                {order.materialName}
                              </h3>
                              <p className="text-sm text-gray-500">
                                Order for: {order.customerName}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                                order.currentStatus === 'delivered' ? 'bg-green-100 text-green-800' :
                                order.currentStatus === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                order.currentStatus === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {order.currentStatus?.charAt(0).toUpperCase() + order.currentStatus?.slice(1) || 'Order Placed'}
                              </div>
                              <p className="text-sm text-gray-500 mt-1">
                                {order.totalAmount} ETH
                              </p>
                            </div>
                          </div>

                          {/* GPS Tracking Update Component */}
                          <GPSTrackingUpdate
                            order={order}
                            onUpdate={() => fetchRawMaterialOrders()}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-gray-400 text-6xl mb-4">📍</div>
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">No Shipments to Track</h3>
                      <p className="text-gray-500">Material orders will appear here for GPS tracking updates.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Add Material Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-xl">
                  <h2 className="text-2xl font-bold text-gray-800">Add New Raw Material</h2>
                  <p className="text-gray-600 mt-1">Fill in comprehensive product details</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                  {/* 1. Product/Material Details */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">1</span>
                      Product/Material Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Product Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          placeholder="Enter product/material name"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category *
                        </label>
                        <select
                          name="category"
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          required
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="Raw Material">Raw Material</option>
                          <option value="Plastic">Plastic</option>
                          <option value="Organic Produce">Organic Produce</option>
                          <option value="Metal Parts">Metal Parts</option>
                          <option value="Chemicals">Chemicals</option>
                          <option value="Electronics">Electronics</option>
                          <option value="Textiles">Textiles</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Product Description *
                        </label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          required
                          rows="3"
                          placeholder="Detailed overview, benefits, use-cases"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Technical Specifications
                        </label>
                        <textarea
                          name="technicalSpecs"
                          value={formData.technicalSpecs}
                          onChange={(e) => setFormData({ ...formData, technicalSpecs: e.target.value })}
                          rows="2"
                          placeholder="Weight, dimensions, grade, quality standards"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Material Type
                        </label>
                        <input
                          type="text"
                          name="materialType"
                          value={formData.materialType}
                          onChange={(e) => setFormData({ ...formData, materialType: e.target.value })}
                          placeholder="Plastic type, metal type, etc."
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>


                    </div>
                  </div>

                  {/* 2. Pricing & Availability */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">2</span>
                      Pricing & Availability
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Price per Unit *
                        </label>
                        <div className="flex">
                          <input
                            type="number"
                            step="0.001"
                            name="price"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            required
                            placeholder="0.00"
                            className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <select
                            name="currency"
                            value={formData.currency}
                            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                            className="w-20 p-3 border border-l-0 border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="ETH">ETH</option>
                            <option value="USD">USD</option>
                            <option value="INR">INR</option>
                          </select>
                        </div>
                      </div>



                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Available Stock Quantity *
                        </label>
                        <div className="flex">
                          <input
                            type="number"
                            name="availableStock"
                            value={formData.availableStock}
                            onChange={(e) => setFormData({ ...formData, availableStock: e.target.value })}
                            required
                            placeholder="100"
                            className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <select
                            name="unit"
                            value={formData.unit}
                            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                            className="w-20 p-3 border border-l-0 border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="kg">kg</option>
                            <option value="tons">tons</option>
                            <option value="pieces">pcs</option>
                            <option value="liters">L</option>
                            <option value="meters">m</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3. Location & Additional Info */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">3</span>
                      Location & Additional Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Location/Address *
                        </label>
                        <input
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          required
                          placeholder="Enter complete address"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Product Images (URLs)
                        </label>
                        <input
                          type="text"
                          name="productImages"
                          value={formData.productImages}
                          onChange={(e) => setFormData({ ...formData, productImages: e.target.value })}
                          placeholder="Comma-separated image URLs"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex space-x-4 pt-6 border-t border-gray-200">
                    <button
                      type="submit"
                      className="btn btn-primary flex-1 text-lg py-3 px-6 shadow-medium"
                    >
                      Add Material to Inventory
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="btn btn-outline flex-1 text-lg py-3 px-6"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default SupplierDashboard;
