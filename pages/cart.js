import { useState, useEffect } from "react";
import { useTracking } from "../Context/Tracking";
import ProtectedRoute from "../Components/ProtectedRoute";
import Link from "next/link";
import Web3 from "web3";
import { serializeTransactionReceipt, handleWeb3Error } from "../utils/blockchain";

export default function Cart() {
  const [cart, setCart] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingItem, setProcessingItem] = useState(null);

  const { 
    currentUser, 
    isAuthenticated, 
    userRole, 
    hasPermission,
    USER_ROLES 
  } = useTracking();

  useEffect(() => {
    if (isAuthenticated) {
      loadCart();
    }
  }, [isAuthenticated, currentUser]);

  const loadCart = () => {
    const savedCart = localStorage.getItem(`cart_${currentUser}`);
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const saveCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem(`cart_${currentUser}`, JSON.stringify(newCart));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const newCart = cart.map(item =>
      item.productId === productId
        ? { ...item, quantity: newQuantity }
        : item
    );
    saveCart(newCart);
  };

  const removeFromCart = (productId) => {
    const newCart = cart.filter(item => item.productId !== productId);
    saveCart(newCart);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCheckout = async (item) => {
    if (!hasPermission('canBuyProducts')) {
      alert("You don't have permission to buy products");
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

      // For now, we'll use a placeholder producer address
      // In a real app, this would come from the product data
      const recipient = "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87"; // Placeholder
      const totalPrice = item.price * item.quantity;
      const priceInWei = web3.utils.toWei(totalPrice.toString(), "ether");

      const balance = await web3.eth.getBalance(userAddress);
      if (Number(balance) < Number(priceInWei)) {
        alert("Insufficient balance.");
        return;
      }

      setIsProcessing(true);
      setProcessingItem(item.productId);

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
      const purchaseData = {
        productId: item.productId,
        productName: item.name,
        productDescription: "Product from cart",
        quantity: item.quantity,
        unitPrice: item.price,
        customerId: userAddress,
        producerId: recipient, // This should come from product data
        ...serializedReceipt,
        deliveryAddress: {
          street: "123 Main St",
          city: "City",
          state: "State",
          zipCode: "12345",
          country: "USA"
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
        // Remove item from cart after successful purchase
        removeFromCart(item.productId);
      } else {
        alert("Transaction successful, but failed to create purchase record: " + purchaseResult.message);
      }

    } catch (error) {
      console.error("Transaction error:", error);
      alert(handleWeb3Error(error));
    } finally {
      setIsProcessing(false);
      setProcessingItem(null);
    }
  };

  const clearCart = () => {
    if (confirm("Are you sure you want to clear your cart?")) {
      saveCart([]);
    }
  };

  return (
    <ProtectedRoute requiredRole={USER_ROLES.CUSTOMER}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="card shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-primary">Shopping Cart</h1>
                <p className="text-medium">{cart.length} items in your cart</p>
              </div>
              <div className="flex items-center space-x-4">
                <Link href="/shop">
                  <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                    Continue Shopping
                  </button>
                </Link>
                <Link href="/dashboard/customer">
                  <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors">
                    My Orders
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {cart.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cart.map((item) => (
                  <div key={item.productId} className="card p-6">
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgMTAwQzExNy4zOTQgMTAwIDEzMSA4Ni4zOTQyIDEzMSA2OUMxMzEgNTEuNjA1OCAxMTcuMzk0IDM4IDEwMCAzOEM4Mi42MDU4IDM4IDY5IDUxLjYwNTggNjkgNjlDNjkgODYuMzk0MiA4Mi42MDU4IDEwMCAxMDAgMTAwWk0xMDAgMTAwVjE2MiIgc3Ryb2tlPSIjOUM5QzlDIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K'}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-800">{item.name}</h3>
                        <p className="text-gray-600">${item.price} each</p>
                        
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                            >
                              -
                            </button>
                            <span className="w-12 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                            >
                              +
                            </button>
                          </div>
                          
                          <button
                            onClick={() => removeFromCart(item.productId)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-800">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                        <button
                          onClick={() => handleCheckout(item)}
                          disabled={isProcessing && processingItem === item.productId}
                          className="mt-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:bg-gray-400 transition-colors"
                        >
                          {isProcessing && processingItem === item.productId ? (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Processing...
                            </div>
                          ) : (
                            'Buy Now'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${getTotalPrice().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span>Free</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span>${getTotalPrice().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Click "Buy Now" on individual items to purchase them separately with blockchain transactions.
                    </p>
                    
                    <button
                      onClick={clearCart}
                      className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Clear Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🛒</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Your cart is empty</h3>
              <p className="text-gray-500 mb-6">
                Add some products to your cart to get started.
              </p>
              <Link href="/shop">
                <button className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors">
                  Start Shopping
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
