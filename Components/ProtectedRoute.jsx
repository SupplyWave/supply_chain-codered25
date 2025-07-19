import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTracking } from '../Context/Tracking';

const ProtectedRoute = ({ children, requiredRole = null, requiredPermissions = [] }) => {
  const router = useRouter();
  const { 
    isAuthenticated, 
    userRole, 
    loading, 
    hasPermission,
    USER_ROLES 
  } = useTracking();

  useEffect(() => {
    if (loading) return; // Wait for loading to complete

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      router.push('/');
      return;
    }

    // If specific role is required and user doesn't have it
    if (requiredRole && userRole !== requiredRole) {
      router.push('/');
      return;
    }

    // Check required permissions
    if (requiredPermissions.length > 0) {
      const hasAllPermissions = requiredPermissions.every(permission => 
        hasPermission(permission)
      );
      
      if (!hasAllPermissions) {
        router.push('/');
        return;
      }
    }
  }, [isAuthenticated, userRole, loading, router, requiredRole, requiredPermissions, hasPermission]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show access denied if not authenticated or doesn't have required role/permissions
  if (!isAuthenticated || 
      (requiredRole && userRole !== requiredRole) ||
      (requiredPermissions.length > 0 && !requiredPermissions.every(permission => hasPermission(permission)))) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page.
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
