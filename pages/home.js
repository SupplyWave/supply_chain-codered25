import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const [role, setRole] = useState(null);
  const [userAddress, setUserAddress] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Check if MetaMask is already connected
    if (window.ethereum && window.ethereum.selectedAddress) {
      setUserAddress(window.ethereum.selectedAddress);
    }
  }, []);

  const connectMetaMask = async () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed. Please install it to continue.");
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const address = accounts[0];
      setUserAddress(address);

      console.log("Connected MetaMask address:", address);

      // Redirect to the role-specific dashboard
      if (role === "supplier") router.push("/dashboard/supplier");
      else if (role === "manufacturer") router.push("/dashboard/manufacturer");
      else if (role === "customer") router.push("/dashboard/customer");
      else if (role === "other") router.push("/dashboard/other");
    } catch (error) {
      console.error("MetaMask connection failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Welcome to Supply Chain Management
        </h1>
        <p className="text-gray-600 mb-8">
          Please select your role to proceed:
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        <div
          onClick={() => setRole("supplier")}
          className={`bg-white p-6 rounded-lg shadow-md cursor-pointer hover:bg-gray-200 transition ${
            role === "supplier" ? "ring-2 ring-blue-500" : ""
          }`}
        >
          <h2 className="text-xl font-semibold">Supplier</h2>
          <p className="mt-2 text-gray-600">
            Manage your supplies and connect with manufacturers.
          </p>
        </div>
        <div
          onClick={() => setRole("manufacturer")}
          className={`bg-white p-6 rounded-lg shadow-md cursor-pointer hover:bg-gray-200 transition ${
            role === "manufacturer" ? "ring-2 ring-blue-500" : ""
          }`}
        >
          <h2 className="text-xl font-semibold">Manufacturer</h2>
          <p className="mt-2 text-gray-600">
            Coordinate production and track resources.
          </p>
        </div>
        <div
          onClick={() => setRole("customer")}
          className={`bg-white p-6 rounded-lg shadow-md cursor-pointer hover:bg-gray-200 transition ${
            role === "customer" ? "ring-2 ring-blue-500" : ""
          }`}
        >
          <h2 className="text-xl font-semibold">Customer</h2>
          <p className="mt-2 text-gray-600">
            View products and place orders seamlessly.
          </p>
        </div>
      </div>

      {role && (
        <div className="mt-8 text-center">
          {userAddress ? (
            <button
              onClick={() => connectMetaMask()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition"
            >
              Proceed to {role.charAt(0).toUpperCase() + role.slice(1)} Dashboard
            </button>
          ) : (
            <button
              onClick={connectMetaMask}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition"
            >
              Connect MetaMask and Proceed to Dashboard
            </button>
          )}
        </div>
      )}
    </div>
  );
}
