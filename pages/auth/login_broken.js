import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useTracking } from "../../Context/Tracking";
import Link from "next/link";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });
  
  const router = useRouter();
  
  const { 
    login, 
    isAuthenticated, 
    userRole, 
    loading,
    getDashboardPath
  } = useTracking();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && userRole) {
      router.push(getDashboardPath());
    }
  }, [isAuthenticated, userRole, router, getDashboardPath]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await login(formData.identifier, formData.password);
      // Navigation will be handled by useEffect above
    } catch (error) {
      console.error("Login failed:", error);
      setError(error.message || "Login failed. Please try again.");
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
        <div className="rounded-2xl shadow-2xl w-full max-w-md p-8 transition-colors duration-300" style={{
          backgroundColor: 'var(--bg-card)',
          color: 'var(--text-primary)'
        }}>
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="text-2xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
              ← Back to Home
            </Link>
            <h1 className="text-3xl font-bold mb-2 mt-4" style={{ color: 'var(--text-primary)' }}>
              Welcome Back
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Sign in to your account
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

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="form-label">
                Username or Email
              </label>
            <input
              type="text"
              name="identifier"
              value={formData.identifier}
              onChange={handleInputChange}
              required
              placeholder="Enter username or email"
              className="form-input"
            />
          </div>
          
          <div>
            <label className="form-label">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              placeholder="Enter password"
              className="form-input"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary w-full py-3"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Signing in...
              </div>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Register Link */}
        <div className="mt-8 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
          <p>
            Don't have an account?{" "}
            <Link href="/auth/register" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Create one here
            </Link>
          </p>
        </div>

        {/* Info Section */}
        <div className="mt-8 p-4 rounded-lg" style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-light)'
        }}>
          <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Secure Login</h4>
          <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
            <li>• Your credentials are encrypted and secure</li>
            <li>• Access your role-specific dashboard</li>
            <li>• Manage your blockchain transactions</li>
          </ul>
        </div>
        </div>
      </div>
    </div>
  );
}
