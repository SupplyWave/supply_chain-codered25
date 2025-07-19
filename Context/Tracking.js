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

export const TrackingProvider = ({ children }) => {
  const DappName = "Tracking Dapp";
  const [currentUser, setCurrentUser] = useState("");

  // Helper to connect wallet
  const connectWallet = async () => {
    try {
      if (!window.ethereum) throw new Error("Please install MetaMask.");
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setCurrentUser(accounts[0]);
    } catch (error) {
      console.error("Error connecting wallet:", error.message || error);
    }
  };

  // Check wallet connection
  const checkWalletConnection = async () => {
    try {
      if (!window.ethereum) throw new Error("Please install MetaMask.");
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (accounts.length) setCurrentUser(accounts[0]);

      // Listen for account and network changes
      window.ethereum.on("accountsChanged", (accounts) => {
        setCurrentUser(accounts.length ? accounts[0] : "");
      });

      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
    } catch (error) {
      console.error("Error checking wallet connection:", error.message || error);
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

  useEffect(() => {
    checkWalletConnection();
  }, []);

  return (
    <TrackingContext.Provider
      value={{
        currentUser,
        connectWallet,
        createShipment,
        getAllShipments,
        getShipmentCount,
        completeShipment,
        getShipment,
        startShipment,
        DappName,
      }}
    >
      {children}
    </TrackingContext.Provider>
  );
};
