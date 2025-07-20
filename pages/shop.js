import { useState, useEffect } from "react";
import { useTracking } from "../Context/Tracking";
import ProtectedRoute from "../Components/ProtectedRoute";
import Link from "next/link";

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [cart, setCart] = useState([]);

  const { 
    currentUser, 
    isAuthenticated, 
    userRole, 
    hasPermission,
    USER_ROLES 
  } = useTracking();

  const categories = [
    "All", "Electronics", "Clothing", "Food", "Automotive", 
    "Healthcare", "Industrial", "Home & Garden", "Sports", "Books"
  ];

  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts();
      loadCart();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm, selectedCategory, priceRange, sortBy]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/products/enhanced");
      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
      } else {
        console.error("Failed to fetch products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

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

  const filterAndSortProducts = () => {
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (product.tags && product.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
      
      const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
      
      const matchesPrice = product.price >= priceRange.min && product.price <= priceRange.max;
      
      return matchesSearch && matchesCategory && matchesPrice && product.isAvailable;
    });

    // Sort products
    switch (sortBy) {
      case "price_low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price_high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => b.averageRating - a.averageRating);
        break;
      case "popular":
        filtered.sort((a, b) => b.purchaseCount - a.purchaseCount);
        break;
      case "newest":
      default:
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }

    setFilteredProducts(filtered);
  };

  const addToCart = (product, quantity = 1, customizations = {}) => {
    const existingItem = cart.find(item => item.productId === product._id);
    
    let newCart;
    if (existingItem) {
      newCart = cart.map(item =>
        item.productId === product._id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      newCart = [...cart, {
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.images?.[0]?.url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgMTAwQzExNy4zOTQgMTAwIDEzMSA4Ni4zOTQyIDEzMSA2OUMxMzEgNTEuNjA1OCAxMTcuMzk0IDM4IDEwMCAzOEM4Mi42MDU4IDM4IDY5IDUxLjYwNTggNjkgNjlDNjkgODYuMzk0MiA4Mi42MDU4IDEwMCAxMDAgMTAwWk0xMDAgMTAwVjE2MiIgc3Ryb2tlPSIjOUM5QzlDIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K',
        quantity,
        customizations,
        addedDate: new Date()
      }];
    }
    
    saveCart(newCart);
    alert(`${product.name} added to cart!`);
  };

  const ProductCard = ({ product }) => (
    <div className="card hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden">
      {/* Product Image */}
      <div className="relative h-48 bg-gray-200">
        <img
          src={product.images?.[0]?.url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgMTAwQzExNy4zOTQgMTAwIDEzMSA4Ni4zOTQyIDEzMSA2OUMxMzEgNTEuNjA1OCAxMTcuMzk0IDM4IDEwMCAzOEM4Mi42MDU4IDM4IDY5IDUxLjYwNTggNjkgNjlDNjkgODYuMzk0MiA4Mi42MDU4IDEwMCAxMDAgMTAwWk0xMDAgMTAwVjE2MiIgc3Ryb2tlPSIjOUM5QzlDIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K'}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        {product.isNew && (
          <span className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            NEW
          </span>
        )}
        {product.isFeatured && (
          <span className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            FEATURED
          </span>
        )}
        {product.discount > 0 && (
          <span className="absolute bottom-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            -{product.discount}%
          </span>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-lg text-primary line-clamp-2">{product.name}</h3>
          <div className="flex items-center ml-2">
            <span className="text-yellow-400">★</span>
            <span className="text-sm text-medium ml-1">
              {product.averageRating.toFixed(1)} ({product.totalReviews})
            </span>
          </div>
        </div>
        
        <p className="text-medium text-sm mb-3 line-clamp-2">{product.description}</p>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm bg-gray-100 px-2 py-1 rounded">{product.category}</span>
            {product.brand && (
              <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">{product.brand}</span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-green-600">${product.price}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-light line-through">${product.originalPrice}</span>
            )}
          </div>
          <div className="text-sm text-light">
            Stock: {product.stock}
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => addToCart(product)}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors font-medium"
            disabled={product.stock === 0}
          >
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <ProtectedRoute requiredRole={USER_ROLES.CUSTOMER}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-light">Loading products...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole={USER_ROLES.CUSTOMER}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="card shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-primary">Shop</h1>
                <p className="text-medium">Discover amazing products from verified producers</p>
              </div>
              <div className="flex items-center space-x-4">
                <Link href="/cart">
                  <button className="relative bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                    Cart ({cart.length})
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
          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input"
                />
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="form-input"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="form-input"
                >
                  <option value="newest">Newest First</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>
            </div>

            {/* Price Range */}
            <div className="mt-4 flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Price Range:</span>
              <input
                type="number"
                placeholder="Min"
                value={priceRange.min}
                onChange={(e) => setPriceRange({...priceRange, min: Number(e.target.value)})}
                className="w-24 p-2 border border-gray-300 rounded"
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Max"
                value={priceRange.max}
                onChange={(e) => setPriceRange({...priceRange, max: Number(e.target.value)})}
                className="w-24 p-2 border border-gray-300 rounded"
              />
              <div className="flex items-center space-x-2 ml-auto">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                  List
                </button>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-600">
              Showing {filteredProducts.length} of {products.length} products
            </p>
          </div>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {filteredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No products found</h3>
              <p className="text-gray-500">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
