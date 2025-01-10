import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Web3 from "web3";

export default function CustomerDashboard() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null); // State to track selected product
  const [isProcessing, setIsProcessing] = useState(false); // State to show transaction processing

  useEffect(() => {
    // Fetch products
    fetchProducts();
  }, []);

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

  // Handle the Buy Click with MetaMask transaction
  const handleBuyClick = async (product) => {
    try {
      if (!window.ethereum) {
        alert("MetaMask not detected. Please install MetaMask.");
        return;
      }
  
      const web3 = new Web3(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const accounts = await web3.eth.getAccounts();
      const userAddress = accounts[0]; // Customer's MetaMask address
  
      if (!userAddress) {
        alert("Unable to fetch wallet address. Please try again.");
        return;
      }
  
      const recipient = product.addedBy; // Manufacturer's address (addedBy)
      const priceInWei = web3.utils.toWei(product.price.toString(), "ether");
  
      if (!web3.utils.isAddress(recipient)) {
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
  
      // Send payment details to the backend
      const updateResponse = await fetch("/api/updateProduct", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product._id, // Send correct productId
          buyer: userAddress,
          transactionHash: receipt.transactionHash,
          amountPaid: product.price, // Payment amount (price of the product)
          manufacturerName: product.addedBy, // Manufacturer's name
          manufacturerWalletAddress: product.addedBy, // Manufacturer's wallet address
        }),
      });
  
      const updateData = await updateResponse.json();
      if (updateData.success) {
        alert("Transaction successful! Product purchased.");
        fetchProducts(); // Refresh the list after purchase
      } else {
        alert("Failed to update the database. Please contact support.");
      }
    } catch (error) {
      console.error("Transaction error:", error.message || error);
      alert("Transaction failed. Please try again.");
    } finally {
      setIsProcessing(false);
      setSelectedProduct(null);
    }
  };
  

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Customer Dashboard</h1>
      <p>Browse and purchase products directly from manufacturers.</p>

      <div className="mt-6">
        <h2 className="text-xl font-semibold">Available Products</h2>
        <div className="mt-4 space-y-4">
          {products.length > 0 ? (
            products.map((product) => (
              <div key={product._id} className="border p-4 rounded-lg">
                <p>
                  <strong>Name:</strong> {product.name}
                </p>
                <p>
                  <strong>Price:</strong> {product.price} ETH
                </p>
                <p>
                  <strong>Description:</strong> {product.description}
                </p>
                <p>
                  <strong>Added By:</strong> {product.addedBy}
                </p>

                <button
                  onClick={() => handleBuyClick(product)}
                  className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg"
                  disabled={isProcessing && selectedProduct?._id === product._id}
                >
                  {isProcessing && selectedProduct?._id === product._id
                    ? "Processing..."
                    : "Buy"}
                </button>
              </div>
            ))
          ) : (
            <p>No products found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
