import { useState, useEffect } from "react";

const SupplierDashboard = () => {
  const [walletAddress, setWalletAddress] = useState("");
  const [formData, setFormData] = useState({ name: "", price: "", location: "" });
  const [rawMaterials, setRawMaterials] = useState([]);
  const [approvedPayments, setApprovedPayments] = useState([]);
  const [showForm, setShowForm] = useState(false); // State for toggling the form

  // Connect to MetaMask wallet
  const connectMetamask = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setWalletAddress(accounts[0]);
        alert("Wallet connected successfully!");
      } catch (error) {
        console.error("Error connecting to MetaMask:", error);
        alert("Failed to connect to MetaMask. Please try again.");
      }
    } else {
      alert("MetaMask is not installed. Please install MetaMask to continue.");
    }
  };

  // Handle input change for raw material form
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle raw material submission
  const handleAddRawMaterial = async (e) => {
    e.preventDefault();
    if (!walletAddress) {
      alert("Please connect to MetaMask to add raw materials.");
      return;
    }

    const materialData = {
      ...formData,
      addedBy: walletAddress, // Automatically include MetaMask address
    };

    try {
      const response = await fetch("/api/rawMaterial", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(materialData),
      });

      const data = await response.json();
      if (data.success) {
        alert("Raw material added successfully!");
        setFormData({ name: "", price: "", location: "" });
        fetchRawMaterials(); // Refresh raw materials list
        setShowForm(false); // Close the form after successful submission
      } else {
        alert("Error adding raw material: " + data.message);
      }
    } catch (error) {
      console.error("Error adding raw material:", error);
      alert("Failed to add raw material.");
    }
  };

  // Handle cancel button click
  const handleCancel = () => {
    setShowForm(false); // Close the form without submitting
    setFormData({ name: "", price: "", location: "" }); // Reset form data
  };

  // Fetch raw materials
  const fetchRawMaterials = async () => {
    if (!walletAddress) return; // Don't fetch if wallet is not connected
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

  // Fetch approved payments only for raw materials with approved payments
  const fetchApprovedPayments = async () => {
    if (!walletAddress) return; // Don't fetch if wallet is not connected
    try {
      const response = await fetch("/api/rawMaterial");
      const data = await response.json();
      if (data.success) {
        const payments = data.data
          .flatMap((material) => material.approvedPayments || []); // Flatten payments
        setApprovedPayments(payments);
      } else {
        console.error("Failed to fetch approved payments.");
      }
    } catch (error) {
      console.error("Error fetching approved payments:", error);
    }
  };

  useEffect(() => {
    if (walletAddress) { // Only fetch data when wallet is connected
      fetchRawMaterials();
      fetchApprovedPayments();
    }
  }, [walletAddress]); // Dependency on walletAddress, will trigger when wallet is connected

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-semibold">Supplier Dashboard</h1>

      {/* MetaMask Wallet Connection */}
      <div className="flex items-center space-x-4">
        <button
          onClick={connectMetamask}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg"
        >
          {walletAddress ? `Connected: ${walletAddress}` : "Connect to MetaMask"}
        </button>
      </div>

      {/* Toggle Add Raw Material Form */}
      <div className="mt-8">
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg"
        >
          {showForm ? "Cancel" : "Add Raw Material"}
        </button>
      </div>

      {/* Raw Material Form */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg w-96 space-y-4">
            <form onSubmit={handleAddRawMaterial}>
              <div>
                <label htmlFor="name" className="block text-lg font-medium">
                  Material Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label htmlFor="price" className="block text-lg font-medium">
                  Price
                </label>
                <input
                  type="number"
                  name="price"
                  id="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label htmlFor="location" className="block text-lg font-medium">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  id="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="mt-4 flex justify-between">
                <button
                  type="submit"
                  className="bg-green-500 text-white px-6 py-2 rounded-lg"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Raw Materials List
      <div className="mt-8">
        <h2 className="text-2xl font-medium">Raw Materials</h2>
        <div className="mt-4 space-y-4">
          {rawMaterials.length > 0 ? (
            rawMaterials.map((material) => (
              <div key={material._id} className="border p-4 rounded-lg">
                <p><strong>Material Name:</strong> {material.name}</p>
                <p><strong>Price:</strong> {material.price}</p>
                <p><strong>Location:</strong> {material.location}</p>
              </div>
            ))
          ) : (
            <p></p>
          )}
        </div>
      </div> */}

      {/* Approved Payments Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-medium">Approved Payments</h2>
        <div className="mt-4 space-y-4">
          {approvedPayments.length > 0 ? (
            approvedPayments.map((payment) => (
              <div key={payment._id} className="border p-4 rounded-lg">
                <p><strong>Manufacturer ID:</strong> {payment.manufacturerWalletAddress}</p>
                <p><strong>Amount Paid:</strong> {payment.amountPaid}</p>
                <p><strong>Date:</strong> {new Date(payment.date).toLocaleDateString()}</p>
              </div>
            ))
          ) : (
            <p>No approved payments found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupplierDashboard;

