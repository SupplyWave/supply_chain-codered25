import { Disclosure } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useTracking } from "../Context/Tracking";
import { useRouter } from "next/router";
import ProfileDropdown from "./ProfileDropdown";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const NavBar = () => {
  const router = useRouter();
  const {
    currentUser,
    isAuthenticated,
    userRole,
    USER_ROLES,
  } = useTracking();

  // Get role-based dashboard path
  const getDashboardPath = () => {
    if (userRole === USER_ROLES.SUPPLIER) {
      return "/dashboard/supplier";
    } else if (userRole === USER_ROLES.PRODUCER) {
      return "/dashboard/producer";
    } else if (userRole === USER_ROLES.CUSTOMER) {
      return "/dashboard/customer";
    }
    return "/dashboard";
  };

  return (
    <Disclosure as="nav" className="bg-primary shadow-soft">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-300 hover:bg-white hover:bg-opacity-10 hover:text-white transition-all duration-200">
              <Bars3Icon className="block h-6 w-6" />
              <XMarkIcon className="hidden h-6 w-6" />
            </Disclosure.Button>
          </div>

          {/* Company Name and Navigation */}
          <div className="flex items-center space-x-8">
            {/* Company Name */}
            <div className="flex-shrink-0">
              <div className="flex items-center">
                <h1 className="text-white font-bold text-xl">SupplyChain</h1>
                <p className="text-gray-200 text-xs ml-2 hidden sm:block">Blockchain Platform</p>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="hidden sm:flex items-center space-x-6">
              <button
                onClick={() => router.push('/')}
                className={classNames(
                  "text-gray-200 hover:bg-white hover:bg-opacity-10 hover:text-white",
                  "rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
                  router.pathname === '/' && "bg-white bg-opacity-20 text-white shadow-soft"
                )}
              >
                Home
              </button>

              {isAuthenticated && (
                <button
                  onClick={() => router.push(getDashboardPath())}
                  className={classNames(
                    "text-gray-200 hover:bg-white hover:bg-opacity-10 hover:text-white",
                    "rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
                    router.pathname.includes('/dashboard') && "bg-white bg-opacity-20 text-white shadow-soft"
                  )}
                >
                  Dashboard
                </button>
              )}
            </div>
          </div>

          {/* User Account Section - Right Side */}
          <div className="flex items-center space-x-3">
            {isAuthenticated && currentUser ? (
              <ProfileDropdown />
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={() => router.push('/auth/login')}
                  className="btn btn-secondary text-sm px-4 py-2"
                >
                  Login
                </button>
                <button
                  onClick={() => router.push('/auth/register')}
                  className="btn btn-outline border-white text-white hover:bg-white hover:text-primary text-sm px-4 py-2"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Disclosure.Panel className="sm:hidden bg-primary border-t border-white border-opacity-20">
        <div className="space-y-1 px-2 pb-3 pt-2">
          <button
            onClick={() => router.push('/')}
            className={classNames(
              "block w-full text-left rounded-lg px-4 py-3 text-base font-medium",
              "text-gray-200 hover:bg-white hover:bg-opacity-10 hover:text-white transition-all duration-200",
              router.pathname === '/' && "bg-white bg-opacity-20 text-white"
            )}
          >
            Home
          </button>

          {isAuthenticated && (
            <button
              onClick={() => router.push(getDashboardPath())}
              className={classNames(
                "block w-full text-left rounded-lg px-4 py-3 text-base font-medium",
                "text-gray-200 hover:bg-white hover:bg-opacity-10 hover:text-white transition-all duration-200",
                router.pathname.includes('/dashboard') && "bg-white bg-opacity-20 text-white"
              )}
            >
              Dashboard
            </button>
          )}
        </div>
      </Disclosure.Panel>
    </Disclosure>
  );
};

export default NavBar;
