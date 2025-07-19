import { Disclosure } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useTracking } from "../Context/Tracking";
import { useRouter } from "next/router";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const NavBar = () => {
  const router = useRouter();
  const {
    currentUser,
    isAuthenticated,
    userRole,
    logout,
    hasPermission,
    USER_ROLES,

  } = useTracking();

  // Get role-based navigation items
  const getNavigationItems = () => {
    const baseItems = [
      { name: "Home", href: "/" }
    ];

    if (!isAuthenticated) {
      return baseItems;
    }

    const roleItems = [];

    // Add role-specific dashboard
    if (userRole === USER_ROLES.SUPPLIER) {
      roleItems.push({ name: "Dashboard", href: "/dashboard/supplier" });
    } else if (userRole === USER_ROLES.PRODUCER) {
      roleItems.push({ name: "Dashboard", href: "/dashboard/producer" });
    } else if (userRole === USER_ROLES.CUSTOMER) {
      roleItems.push({ name: "Dashboard", href: "/dashboard/customer" });
    }

    // Add tracking if user has permission (but not for producers)
    if (hasPermission('canViewOwnShipments') && userRole !== USER_ROLES.PRODUCER) {
      roleItems.push({ name: "Tracking", href: "/table_dispaly" });
    }

    return [...baseItems, ...roleItems];
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const navigation = getNavigationItems();

  return (
    <Disclosure as="nav" className="bg-gray-800">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white">
              <Bars3Icon className="block h-6 w-6" />
              <XMarkIcon className="hidden h-6 w-6" />
            </Disclosure.Button>
          </div>

          {/* Logo Section */}
          <div className="flex flex-shrink-0 items-center">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-xl">SC</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-white font-bold text-xl">SupplyChain</h1>
                <p className="text-gray-300 text-xs">Blockchain Platform</p>
              </div>
            </div>
          </div>

          {/* Navigation Links - Centered */}
          <div className="flex-1 flex justify-center">
            <div className="hidden sm:block">
              <div className="flex space-x-4">
                {navigation.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => router.push(item.href)}
                    className={classNames(
                      "text-gray-300 hover:bg-gray-700 hover:text-white",
                      "rounded-md px-3 py-2 text-sm font-medium transition-colors"
                    )}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* User Account Section - Right Side */}
          <div className="flex items-center space-x-3">
            {isAuthenticated && currentUser ? (
              <>
                <div className="text-white text-sm">
                  <div className="font-medium capitalize">{userRole}</div>
                  <div className="text-gray-300 text-xs">
                    {currentUser.slice(0, 6)}...{currentUser.slice(-4)}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-white px-3 py-2 bg-red-600 hover:bg-red-700 rounded-md text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={() => router.push('/auth/login')}
                  className="text-white px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => router.push('/auth/register')}
                  className="text-indigo-600 px-4 py-2 bg-white hover:bg-gray-100 rounded-md text-sm font-medium transition-colors"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Disclosure.Panel className="sm:hidden">
        <div className="space-y-1 px-2 pb-3 pt-2">
          {navigation.map((item) => (
            <button
              key={item.name}
              onClick={() => router.push(item.href)}
              className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            >
              {item.name}
            </button>
          ))}
        </div>
      </Disclosure.Panel>
    </Disclosure>
  );
};

export default NavBar;
