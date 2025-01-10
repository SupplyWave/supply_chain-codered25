import { useEffect, useState } from "react";

export default function TrackingTable() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/addProduct"); // Adjust the endpoint as needed
        const data = await response.json();
        if (data.success) {
          setProducts(data.data);
        } else {
          console.error("Failed to fetch products");
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-8">
      <div className="items-start justify-between md:flex">
        <div className="max-w-lg">
          <h3 className="text-gray-800 text-xl font-bold sm:text-2xl text-center mt-10">
            Product Tracking
          </h3>
          
        </div>
      </div>

      <div className="mt-12 shadow-sm border rounded-lg overflow-x-auto">
        <table className="w-full table-auto text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 font-medium border-b">
            <tr>
              <th className="py-3 px-6">Product Name</th>
              <th className="py-3 px-6">Description</th>
              <th className="py-3 px-6">Price</th>
              <th className="py-3 px-6">Location</th>
              <th className="py-3 px-6">Added By</th>
              <th className="py-3 px-6">Customer Name</th>
              <th className="py-3 px-6">Amount Paid</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 divide-y">
            {products.length > 0 ? (
              products.map((product, idx) => (
                <tr key={idx}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.name.length > 15
                      ? product.name.slice(0, 15) + "..."
                      : product.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.description.length > 15
                      ? product.description.slice(0, 15) + "..."
                      : product.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{product.price}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.location.length > 15
                      ? product.location.slice(0, 15) + "..."
                      : product.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.addedBy.slice(0, 15)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.approvedPayments.length > 0
                      ? product.approvedPayments[0].manufacturerName
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.approvedPayments.length > 0
                      ? product.approvedPayments[0].amountPaid
                      : "N/A"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center px-6 py-4">
                  No products available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
