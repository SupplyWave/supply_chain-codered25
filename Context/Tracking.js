import React, { createContext, useContext, useEffect, useState } from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";

// Internal import
import tracking from "../Context/Tracking.json";

const ContractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const ContractABI = tracking.abi;

const fetchContract = (signerOrProvider) =>
  new ethers.Contract(ContractAddress, ContractABI, signerOrProvider);

export const TrackingContext = createContext();

// User roles enum
export const USER_ROLES = {
  SUPPLIER: 'supplier',
  PRODUCER: 'producer', // Previously manufacturer
  CUSTOMER: 'customer'
};

// Role permissions
export const ROLE_PERMISSIONS = {
  [USER_ROLES.SUPPLIER]: {
    canAddRawMaterials: true,
    canViewRawMaterials: true,
    canViewProducers: true,
    canViewCustomers: false,
    canCreateShipments: true,
    canViewOwnShipments: true,
    dashboardPath: '/dashboard/supplier'
  },
  [USER_ROLES.PRODUCER]: {
    canBuyRawMaterials: true,
    canAddProducts: true,
    canViewProducts: true,
    canViewSuppliers: true,
    canViewCustomers: true,
    canCreateShipments: true,
    canViewOwnShipments: true,
    dashboardPath: '/dashboard/producer'
  },
  [USER_ROLES.CUSTOMER]: {
    canBuyProducts: true,
    canViewProducts: true,
    canViewSuppliers: false,
    canViewProducers: false,
    canViewOwnPurchases: true,
    dashboardPath: '/dashboard/customer'
  }
};

export const TrackingProvider = ({ children }) => {
  const DappName = "Supply Chain Tracking DApp";
  const [currentUser, setCurrentUser] = useState("");
  const [userRole, setUserRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [authToken, setAuthToken] = useState(null);

  // Login with username/email and password
  const login = async (identifier, password) => {
    try {
      setLoading(true);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Login failed');
      }

      // Store authentication data
      const profile = {
        ...data.user,
        authenticatedAt: new Date().toISOString()
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userProfile', JSON.stringify(profile));
      }

      setAuthToken(data.token);
      setUserProfile(profile);
      setCurrentUser(data.user.walletAddress);
      setUserRole(data.user.role);
      setIsAuthenticated(true);
      setLoading(false);

      return profile;
    } catch (error) {
      console.error("Error during login:", error.message || error);
      setLoading(false);
      throw error;
    }
  };

  // Register new user
  const register = async (userData) => {
    try {
      setLoading(true);

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Registration failed');
      }

      setLoading(false);
      return data.user;
    } catch (error) {
      console.error("Error during registration:", error.message || error);
      setLoading(false);
      throw error;
    }
  };

  // Connect to MetaMask and verify it matches authenticated user
  const connectMetaMask = async () => {
    try {
      if (!window.ethereum) {
        // Show notification instead of throwing error
        if (typeof window !== 'undefined') {
          const event = new CustomEvent('showNotification', {
            detail: { 
              message: 'Please install MetaMask extension to connect your wallet.', 
              type: 'error',
              duration: 6000
            }
          });
          window.dispatchEvent(event);
        }
        return null;
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const connectedAddress = accounts[0];

      // If user is authenticated, verify the connected wallet matches
      if (isAuthenticated && currentUser) {
        if (connectedAddress.toLowerCase() !== currentUser.toLowerCase()) {
          // Show notification instead of throwing error
          if (typeof window !== 'undefined') {
            const event = new CustomEvent('showNotification', {
              detail: { 
                message: `Please connect the MetaMask wallet that matches your registered address: ${currentUser}`, 
                type: 'warning',
                duration: 8000
              }
            });
            window.dispatchEvent(event);
          }
          return null;
        }
      }

      // Show success notification
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('showNotification', {
          detail: { 
            message: 'MetaMask wallet connected successfully!', 
            type: 'success',
            duration: 3000
          }
        });
        window.dispatchEvent(event);
      }

      return connectedAddress;
    } catch (error) {
      console.error("Error connecting to MetaMask:", error.message || error);
      
      // Show notification instead of throwing error
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('showNotification', {
          detail: { 
            message: error.message === 'User rejected the request.' 
              ? 'MetaMask connection was cancelled.' 
              : 'Failed to connect to MetaMask. Please try again.', 
            type: 'error',
            duration: 5000
          }
        });
        window.dispatchEvent(event);
      }
      
      return null;
    }
  };

  // Verify MetaMask wallet matches authenticated user
  const verifyWalletConnection = async () => {
    try {
      if (!isAuthenticated || !currentUser) {
        return false;
      }

      if (!window.ethereum) {
        throw new Error("MetaMask not detected. Please install MetaMask.");
      }

      const accounts = await window.ethereum.request({ method: "eth_accounts" });

      if (accounts.length === 0) {
        throw new Error("No MetaMask accounts connected. Please connect your wallet.");
      }

      const connectedAddress = accounts[0];

      if (connectedAddress.toLowerCase() !== currentUser.toLowerCase()) {
        throw new Error(
          `Wallet mismatch! Please connect the MetaMask wallet that matches your registered address: ${currentUser}`
        );
      }

      return true;
    } catch (error) {
      console.error("Wallet verification error:", error.message || error);
      throw error;
    }
  };

  // Sync MetaMask with authenticated user
  const syncMetaMaskWithUser = async () => {
    try {
      if (!isAuthenticated || !currentUser) {
        return false;
      }

      // Check if MetaMask is available
      if (!window.ethereum) {
        console.warn("MetaMask not available");
        return false;
      }

      // Get connected accounts
      const accounts = await window.ethereum.request({ method: "eth_accounts" });

      if (accounts.length === 0) {
        // No accounts connected, prompt user to connect
        console.log("No MetaMask accounts connected");
        return false;
      }

      const connectedAddress = accounts[0];

      // Check if connected address matches authenticated user
      if (connectedAddress.toLowerCase() === currentUser.toLowerCase()) {
        console.log("MetaMask wallet matches authenticated user");
        return true;
      } else {
        console.warn("MetaMask wallet does not match authenticated user");
        return false;
      }
    } catch (error) {
      console.error("Error syncing MetaMask with user:", error);
      return false;
    }
  };

  // Logout user
  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userProfile');
    }
    setAuthToken(null);
    setCurrentUser("");
    setUserRole(null);
    setIsAuthenticated(false);
    setUserProfile(null);
  };

  // Check if user has permission
  const hasPermission = (permission) => {
    if (!userRole || !isAuthenticated) return false;
    return ROLE_PERMISSIONS[userRole]?.[permission] || false;
  };

  // Get role-specific dashboard path
  const getDashboardPath = () => {
    if (!userRole) return '/';
    return ROLE_PERMISSIONS[userRole]?.dashboardPath || '/';
  };

  // Restore user session from localStorage
  const restoreSession = async () => {
    try {
      setLoading(true);

      // Check if we're on the client side
      if (typeof window === 'undefined') {
        setLoading(false);
        return;
      }

      // Check for stored authentication data
      const storedToken = localStorage.getItem('authToken');
      const storedProfile = localStorage.getItem('userProfile');

      if (storedToken && storedProfile) {
        try {
          const profile = JSON.parse(storedProfile);

          // Basic token expiration check (decode without verification)
          const tokenParts = storedToken.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));

            if (payload.exp && payload.exp > Date.now() / 1000) {
              // Token is still valid
              setAuthToken(storedToken);
              setUserProfile(profile);
              setCurrentUser(profile.walletAddress);
              setUserRole(profile.role);
              setIsAuthenticated(true);
            } else {
              // Token expired
              logout();
            }
          } else {
            // Invalid token format
            logout();
          }
        } catch (error) {
          // Invalid token or profile data
          logout();
        }
      }

      setLoading(false);
    } catch (error) {
      console.error("Error restoring session:", error.message || error);
      setLoading(false);
    }
  };

  // Validate inputs
  const validateInputs = (inputs) => {
    for (const key in inputs) {
      if (!inputs[key]) throw new Error(`${key} is required.`);
    }
  };

  // Create shipment
  const createShipment = async (items) => {
    const { receiver, pickupTime, distance, price } = items;
    try {
      validateInputs({ receiver, pickupTime, distance, price });

      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const contract = fetchContract(signer);

      const createItem = await contract.createShipment(
        receiver,
        new Date(pickupTime).getTime(),
        distance,
        { value: ethers.utils.parseUnits(price, 18), gasLimit: 300000 }
      );
      await createItem.wait();
      console.log("Shipment created:", createItem);
    } catch (error) {
      console.error("Error creating shipment:", error.message || error);
    }
  };

  // Get all shipments
  const getAllShipments = async () => {
    try {
        const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545/");
        const contract = fetchContract(provider);

        const shipments = await contract.getAllTransactions();
        console.log("Fetched shipments:", shipments); // Log fetched shipments
        return shipments.map((shipment) => ({
            sender: shipment.sender,
            receiver: shipment.receiver,
            price: ethers.utils.formatEther(shipment.price.toString()),
            pickupTime: shipment.pickupTime.toNumber(),
            distance: shipment.distance.toNumber(),
            isPaid: shipment.isPaid,
            status: shipment.status,
        }));
    } catch (error) {
        console.error("Error fetching all shipments:", error.message || error);
    }
};

  // Get shipment count
  const getShipmentCount = async () => {
    try {
      if (!window.ethereum) throw new Error("Please install MetaMask.");
      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545/");
      const contract = fetchContract(provider);

      const shipmentsCount = await contract.getShipmentCount(accounts[0]);
      return shipmentsCount.toNumber();
    } catch (error) {
      console.error("Error getting shipments count:", error.message || error);
    }
  };

  // Start shipment
  const startShipment = async (getProduct) => {
    const { sender, index } = getProduct;
    try {
      validateInputs({ sender, index });

      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const contract = fetchContract(signer);

      const shipment = await contract.startShipment(
        sender,
        index,
        { gasLimit: 300000 }
      );
      await shipment.wait();
      console.log("Shipment started:", shipment);
    } catch (error) {
      console.error("Error starting shipment:", error.message || error);
    }
  };

  // Complete shipment
  const completeShipment = async (completeShip) => {
    const { sender, index } = completeShip;
    try {
      validateInputs({ sender, index });

      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const contract = fetchContract(signer);

      const transaction = await contract.completeShipment(
        sender,
        index,
        { gasLimit: 300000 }
      );
      await transaction.wait();
      console.log("Shipment completed:", transaction);
    } catch (error) {
      console.error("Error completing shipment:", error.message || error);
    }
  };

  // Get a single shipment
  const getShipment = async (index) => {
    try {
      validateInputs({ index });

      const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545/"); // Add network URL (Ropsten/Mainnet)
      const contract = fetchContract(provider);

      const shipment = await contract.getShipment(currentUser, index);
      return {
        sender: shipment[0],
        receiver: shipment[1],
        pickupTime: shipment[2].toNumber(),
        deliveryTime: shipment[3].toNumber(),
        distance: shipment[4].toNumber(),
        price: ethers.utils.formatEther(shipment[5].toString()),
        status: shipment[6],
        isPaid: shipment[7],
      };
    } catch (error) {
      console.error("Error getting shipment:", error.message || error);
    }
  };

  // Auto-sync MetaMask when user authentication changes
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      // Automatically check MetaMask connection when user logs in
      syncMetaMaskWithUser().then((isMatched) => {
        if (!isMatched) {
          console.log("MetaMask wallet does not match authenticated user. User may need to switch accounts.");
        }
      });
    }
  }, [isAuthenticated, currentUser]);

  // Listen for MetaMask account changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (isAuthenticated && currentUser && accounts.length > 0) {
          const connectedAddress = accounts[0];
          if (connectedAddress.toLowerCase() !== currentUser.toLowerCase()) {
            console.warn("MetaMask account changed and doesn't match authenticated user");
            // Optionally show a warning to the user
          } else {
            console.log("MetaMask account matches authenticated user");
          }
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
      };
    }
  }, [isAuthenticated, currentUser]);

  useEffect(() => {
    restoreSession();
  }, []);

  return (
    <TrackingContext.Provider
      value={{
        // User Authentication
        currentUser,
        userRole,
        isAuthenticated,
        loading,
        userProfile,
        authToken,
        login,
        register,
        logout,
        hasPermission,
        getDashboardPath,
        connectMetaMask,
        verifyWalletConnection,
        syncMetaMaskWithUser,

        // Blockchain Functions
        createShipment,
        getAllShipments,
        getShipmentCount,
        completeShipment,
        getShipment,
        startShipment,

        // Constants
        DappName,
        USER_ROLES,
        ROLE_PERMISSIONS,
      }}
    >
      {children}
    </TrackingContext.Provider>
  );
};

// Custom hook to use the tracking context
export const useTracking = () => {
  const context = useContext(TrackingContext);
  if (!context) {
    throw new Error('useTracking must be used within a TrackingProvider');
  }
  return context;
};
