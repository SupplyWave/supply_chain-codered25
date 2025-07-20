import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useTracking } from "../../Context/Tracking";
import Link from "next/link";

export default function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    walletAddress: "",
    role: "",
    name: "",
    address: "",
    company: "",
    phone: ""
  });
  
  const router = useRouter();
  
  const { 
    register, 
    isAuthenticated, 
    userRole, 
    loading,
    getDashboardPath,
    USER_ROLES 
  } = useTracking();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && userRole) {
      router.push(getDashboardPath());
    }
  }, [isAuthenticated, userRole, router, getDashboardPath]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });
    
    setError("");
    
    // Real-time password validation
    if (name === "password") {
      if (value.length > 0 && value.length < 6) {
        setPasswordError("Password must be at least 6 characters long");
      } else {
        setPasswordError("");
      }
    }
    
    // Clear password error when user starts typing and meets requirements
    if (name === "password" && value.length >= 6) {
      setPasswordError("");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setPasswordError("");

    // Client-side validation
    if (formData.password.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const userData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        walletAddress: formData.walletAddress,
        role: formData.role,
        profile: {
          name: formData.name,
          address: formData.address,
          company: formData.company,
          phone: formData.phone
        }
      };

      await register(userData);
      
      // Redirect to login page after successful registration
      router.push('/auth/login?message=Registration successful! Please login with your credentials.');
      
    } catch (error) {
      console.error("Registration failed:", error);
      setError(error.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-300" style={{
      background: 'linear-gradient(135deg, var(--bg-gradient-start) 0%, var(--bg-gradient-end) 100%)'
    }}>
      <div className="flex items-center justify-center p-4 min-h-screen">
        <div className="rounded-2xl shadow-2xl w-full max-w-2xl p-8 transition-colors duration-300" style={{
          backgroundColor: 'var(--bg-card)',
          color: 'var(--text-primary)'
        }}>
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="text-lg font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
              ← Back to Home
            </Link>
            <h1 className="text-3xl font-bold mb-2 mt-4" style={{ color: 'var(--text-primary)' }}>
              Create Account
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Join our blockchain supply chain platform
            </p>
          </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 border rounded-lg" style={{
            backgroundColor: 'rgba(231, 76, 60, 0.1)',
            borderColor: 'rgba(231, 76, 60, 0.3)',
            color: 'var(--error)'
          }}>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleRegister} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">
                Username *
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                placeholder="Choose a username"
                className="form-input"
              />
            </div>
            
            <div>
              <label className="form-label">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="your@email.com"
                className="form-input"
              />
            </div>
          </div>

          <div>
            <label className="form-label">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Your full name"
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">
              Address *
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
              placeholder="Your physical address"
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">
              MetaMask Wallet Address *
            </label>
            <input
              type="text"
              name="walletAddress"
              value={formData.walletAddress}
              onChange={handleInputChange}
              required
              placeholder="0x..."
              className="form-input"
            />
            <p className="text-xs text-gray-500 mt-1">
              This should be your MetaMask wallet address for blockchain transactions
            </p>
          </div>

          <div>
            <label className="form-label">
              Role *
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              required
              className="form-input"
            >
              <option value="">Select your role</option>
              <option value={USER_ROLES.SUPPLIER}>Supplier - Provide raw materials</option>
              <option value={USER_ROLES.PRODUCER}>Producer - Transform materials into products</option>
              <option value={USER_ROLES.CUSTOMER}>Customer - Purchase products</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">
                Password *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                placeholder="Create a strong password"
                className="form-input"
              />
              {passwordError && (
                <div className="mt-2 p-3 rounded-md border" style={{
                  backgroundColor: 'rgba(243, 156, 18, 0.1)',
                  borderColor: 'rgba(243, 156, 18, 0.3)'
                }}>
                  <p className="text-sm flex items-center" style={{ color: 'var(--warning)' }}>
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {passwordError}
                  </p>
                </div>
              )}
            </div>
            
            <div>
              <label className="form-label">
                Confirm Password *
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                placeholder="Confirm your password"
                className="form-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">
                Company (Optional)
              </label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                placeholder="Company name"
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">
                Phone (Optional)
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Phone number"
                className="form-input"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary w-full py-3"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Creating account...
              </div>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-8 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
          <p>
            Already have an account?{" "}
            <Link href="/auth/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Sign in here
            </Link>
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}
