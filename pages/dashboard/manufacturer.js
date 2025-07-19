// import { useEffect, useState } from "react";
// import { useRouter } from "next/router";
// import Web3 from "web3";

// export default function SupplierDashboard() {
//   const router = useRouter();
//   const [rawMaterials, setRawMaterials] = useState([]);
//   const [selectedMaterial, setSelectedMaterial] = useState(null);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [showModal, setShowModal] = useState(false); // Modal visibility state
//   const [newProduct, setNewProduct] = useState({
//     name: "",
//     description: "",
//     price: "",
//     location: "",
//   });

//   useEffect(() => {
//     fetchRawMaterials();
//   }, []);

//   const fetchRawMaterials = async () => {
//     try {
//       const response = await fetch("/api/rawMaterial");
//       const data = await response.json();
//       if (data.success) {
//         setRawMaterials(data.data);
//       } else {
//         console.error("Failed to fetch raw materials.");
//       }
//     } catch (error) {
//       console.error("Error fetching raw materials:", error);
//     }
//   };

//   const handleAddProduct = async () => {
//     try {
//       const response = await fetch("/api/addProduct", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(newProduct),
//       });
//       const data = await response.json();
//       if (data.success) {
//         alert("Product added successfully!");
//         fetchRawMaterials();
//         setShowModal(false);
//         setNewProduct({ name: "", description: "", price: "", location: "" });
//       } else {
//         alert("Failed to add product.");
//       }
//     } catch (error) {
//       console.error("Error adding product:", error);
//       alert("Error adding product.");
//     }
//   };

//   const handleBuyClick = async (material) => {
//     try {
//       if (!window.ethereum) {
//         alert("MetaMask not detected. Please install MetaMask.");
//         return;
//       }
//       const web3 = new Web3(window.ethereum);
//       await window.ethereum.request({ method: "eth_requestAccounts" });
//       const accounts = await web3.eth.getAccounts();
//       const userAddress = accounts[0];
//       const recipient = material.addedBy;
//       const priceInWei = web3.utils.toWei(material.price.toString(), "ether");

//       if (!web3.utils.isAddress(recipient)) {
//         alert("Invalid recipient address.");
//         return;
//       }

//       const balance = await web3.eth.getBalance(userAddress);
//       if (Number(balance) < Number(priceInWei)) {
//         alert("Insufficient balance.");
//         return;
//       }

//       setIsProcessing(true);
//       setSelectedMaterial(material);

//       const transaction = {
//         from: userAddress,
//         to: recipient,
//         value: priceInWei,
//         gas: 21000,
//         gasPrice: web3.utils.toWei("20", "gwei"),
//       };

//       const receipt = await web3.eth.sendTransaction(transaction);
//       const updateResponse = await fetch("/api/updateRawMaterial", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           materialId: material._id,
//           buyer: userAddress,
//           transactionHash: receipt.transactionHash,
//           amountPaid: material.price,
//           manufacturerName: "Manufacturer Name",
//           manufacturerWalletAddress: userAddress,
//         }),
//       });

//       const updateData = await updateResponse.json();
//       if (updateData.success) {
//         alert("Transaction successful!");
//         fetchRawMaterials();
//       } else {
//         alert("Failed to update the database.");
//       }
//     } catch (error) {
//       console.error("Transaction error:", error.message || error);
//       alert("Transaction failed.");
//     } finally {
//       setIsProcessing(false);
//       setSelectedMaterial(null);
//     }
//   };

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold">Manufacturer Dashboard</h1>
//       <p>Manage your supplies and connect with manufacturers.</p>

//       <button
//         onClick={() => setShowModal(true)}
//         className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-4"
//       >
//         Add Product
//       </button>

//       {showModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
//           <div className="bg-white p-6 rounded-lg">
//             <h2 className="text-xl font-bold mb-4">Add New Product</h2>
//             <input
//               type="text"
//               placeholder="Name"
//               value={newProduct.name}
//               onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
//               className="border p-2 w-full mb-2"
//             />
//             <textarea
//               placeholder="Description"
//               value={newProduct.description}
//               onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
//               className="border p-2 w-full mb-2"
//             />
//             <input
//               type="number"
//               placeholder="Price (ETH)"
//               value={newProduct.price}
//               onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
//               className="border p-2 w-full mb-2"
//             />
//             <input
//               type="text"
//               placeholder="Location"
//               value={newProduct.location}
//               onChange={(e) => setNewProduct({ ...newProduct, location: e.target.value })}
//               className="border p-2 w-full mb-2"
//             />
//             <div className="flex justify-end space-x-2">
//               <button
//                 onClick={() => setShowModal(false)}
//                 className="bg-gray-500 text-white px-4 py-2 rounded-lg"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleAddProduct}
//                 className="bg-green-500 text-white px-4 py-2 rounded-lg"
//               >
//                 Add
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="mt-6">
//         <h2 className="text-xl font-semibold">Raw Materials</h2>
//         <div className="mt-4 space-y-4">
//           {rawMaterials.length > 0 ? (
//             rawMaterials.map((material) => (
//               <div key={material._id} className="border p-4 rounded-lg">
//                 <p>
//                   <strong>Name:</strong> {material.name}
//                 </p>
//                 <p>
//                   <strong>Price:</strong> {material.price} ETH
//                 </p>
//                 <p>
//                   <strong>Location:</strong> {material.location}
//                 </p>
//                 <p>
//                   <strong>Added By:</strong> {material.addedBy}
//                 </p>

//                 <button
//                   onClick={() => handleBuyClick(material)}
//                   className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg"
//                   disabled={isProcessing && selectedMaterial?._id === material._id}
//                 >
//                   {isProcessing && selectedMaterial?._id === material._id
//                     ? "Processing..."
//                     : "Buy"}
//                 </button>
//               </div>
//             ))
//           ) : (
//             <p>No raw materials found.</p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
import { useEffect, useState } from "react";
import Web3 from "web3";

export default function ProducerDashboard() {
  const [rawMaterials, setRawMaterials] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    location: "",
  });
  const [walletAddress, setWalletAddress] = useState("");

  useEffect(() => {
    connectMetaMask();
    fetchRawMaterials();
    fetchProducts();
  }, []);

  const connectMetaMask = async () => {
    try {
      if (!window.ethereum) {
        alert("MetaMask not detected. Please install MetaMask.");
        return;
      }
      const web3 = new Web3(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const accounts = await web3.eth.getAccounts();
      setWalletAddress(accounts[0]);
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
    }
  };

  const fetchRawMaterials = async () => {
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
      const response = await fetch("/api/addProduct");
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

  const handleAddProduct = async () => {
    try {
      const response = await fetch("/api/addProduct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newProduct, addedBy: walletAddress }),
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
    try {
      if (!window.ethereum) {
        alert("MetaMask not detected. Please install MetaMask.");
        return;
      }
      const web3 = new Web3(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const accounts = await web3.eth.getAccounts();
      const userAddress = accounts[0];
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
      const updateResponse = await fetch("/api/updateRawMaterial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          materialId: material._id,
          buyer: userAddress,
          transactionHash: receipt.transactionHash,
          amountPaid: material.price,
          manufacturerName: "Manufacturer Name",
          manufacturerWalletAddress: userAddress,
        }),
      });

      const updateData = await updateResponse.json();
      if (updateData.success) {
        alert("Transaction successful!");
        fetchRawMaterials();
      } else {
        alert("Failed to update the database.");
      }
    } catch (error) {
      console.error("Transaction error:", error.message || error);
      alert("Transaction failed.");
    } finally {
      setIsProcessing(false);
      setSelectedMaterial(null);
    }
  };

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Raw Materials Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Raw Materials</h2>
        <div className="space-y-4">
          {rawMaterials.length > 0 ? (
            rawMaterials.map((material) => (
              <div
                key={material._id}
                className="border p-4 rounded-lg shadow-sm hover:shadow-md transition"
              >
                <p>
                  <strong>Name:</strong> {material.name}
                </p>
                <p>
                  <strong>Price:</strong> {material.price} ETH
                </p>
                <p>
                  <strong>Location:</strong> {material.location}
                </p>
                <p>
                  <strong>Added By:</strong> {material.addedBy}
                </p>

                <button
                  onClick={() => handleBuyClick(material)}
                  className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:bg-gray-400 w-20"
                  disabled={isProcessing && selectedMaterial?._id === material._id}
                >
                  {isProcessing && selectedMaterial?._id === material._id
                    ? "Processing..."
                    : "Buy"}
                </button>
              </div>
            ))
          ) : (
            <p>No raw materials found.</p>
          )}
        </div>
      </div>

      {/* Products Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Products</h2>
          <button
            onClick={() => setShowModal(true)}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
          >
            Add Product
          </button>
        </div>

        <div className="space-y-4">
          {products.length > 0 ? (
            products.map((product) => (
              <div
                key={product._id}
                className="border p-4 rounded-lg shadow-sm hover:shadow-md transition"
              >
                <p>
                  <strong>Name:</strong> {product.name}
                </p>
                <p>
                  <strong>Price:</strong> {product.price} ETH
                </p>
                <p>
                  <strong>Location:</strong> {product.location}
                </p>
                <p>
                  <strong>Description:</strong> {product.description}
                </p>
              </div>
            ))
          ) : (
            <p>No products found.</p>
          )}
        </div>
      </div>

      {/* Add Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Product</h2>
            <input
              type="text"
              placeholder="Name"
              value={newProduct.name}
              onChange={(e) =>
                setNewProduct({ ...newProduct, name: e.target.value })
              }
              className="border p-2 w-full mb-2 rounded"
            />
            <textarea
              placeholder="Description"
              value={newProduct.description}
              onChange={(e) =>
                setNewProduct({ ...newProduct, description: e.target.value })
              }
              className="border p-2 w-full mb-2 rounded"
            />
            <input
              type="number"
              placeholder="Price (ETH)"
              value={newProduct.price}
              onChange={(e) =>
                setNewProduct({ ...newProduct, price: e.target.value })
              }
              className="border p-2 w-full mb-2 rounded"
            />
            <input
              type="text"
              placeholder="Location"
              value={newProduct.location}
              onChange={(e) =>
                setNewProduct({ ...newProduct, location: e.target.value })
              }
              className="border p-2 w-full mb-2 rounded"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button onClick={handleAddProduct}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
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

