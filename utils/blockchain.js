/**
 * Utility functions for handling blockchain data and BigInt serialization
 */

/**
 * Safely converts BigInt values to serializable formats
 * @param {any} value - The value to convert
 * @returns {any} - Serializable value
 */
export function serializeBigInt(value) {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  
  if (Array.isArray(value)) {
    return value.map(serializeBigInt);
  }
  
  if (value && typeof value === 'object') {
    const serialized = {};
    for (const [key, val] of Object.entries(value)) {
      serialized[key] = serializeBigInt(val);
    }
    return serialized;
  }
  
  return value;
}

/**
 * Safely converts transaction receipt for API submission
 * @param {Object} receipt - Web3 transaction receipt
 * @returns {Object} - Serializable receipt data
 */
export function serializeTransactionReceipt(receipt) {
  return {
    transactionHash: receipt.transactionHash,
    blockNumber: receipt.blockNumber ? Number(receipt.blockNumber) : null,
    gasUsed: receipt.gasUsed ? Number(receipt.gasUsed) : null,
    gasPrice: receipt.gasPrice ? receipt.gasPrice.toString() : null,
    from: receipt.from,
    to: receipt.to,
    status: receipt.status ? Number(receipt.status) : null
  };
}

/**
 * Formats Wei to Ether with proper decimal places
 * @param {string|BigInt} weiValue - Value in Wei
 * @param {number} decimals - Number of decimal places (default: 4)
 * @returns {string} - Formatted Ether value
 */
export function formatWeiToEther(weiValue, decimals = 4) {
  if (!weiValue) return '0';
  
  try {
    const Web3 = require('web3');
    const web3 = new Web3();
    const etherValue = web3.utils.fromWei(weiValue.toString(), 'ether');
    return parseFloat(etherValue).toFixed(decimals);
  } catch (error) {
    console.error('Error formatting Wei to Ether:', error);
    return '0';
  }
}

/**
 * Validates Ethereum address format
 * @param {string} address - Ethereum address to validate
 * @returns {boolean} - True if valid address
 */
export function isValidEthereumAddress(address) {
  if (!address) return false;
  
  try {
    const Web3 = require('web3');
    const web3 = new Web3();
    return web3.utils.isAddress(address);
  } catch (error) {
    console.error('Error validating Ethereum address:', error);
    return false;
  }
}

/**
 * Formats transaction hash for display
 * @param {string} hash - Transaction hash
 * @param {number} startChars - Characters to show at start (default: 6)
 * @param {number} endChars - Characters to show at end (default: 4)
 * @returns {string} - Formatted hash
 */
export function formatTransactionHash(hash, startChars = 6, endChars = 4) {
  if (!hash || hash.length <= startChars + endChars) {
    return hash || '';
  }
  
  return `${hash.slice(0, startChars)}...${hash.slice(-endChars)}`;
}

/**
 * Formats wallet address for display
 * @param {string} address - Wallet address
 * @param {number} startChars - Characters to show at start (default: 6)
 * @param {number} endChars - Characters to show at end (default: 4)
 * @returns {string} - Formatted address
 */
export function formatWalletAddress(address, startChars = 6, endChars = 4) {
  if (!address || address.length <= startChars + endChars) {
    return address || '';
  }
  
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Handles common Web3 errors and returns user-friendly messages
 * @param {Error} error - The error object
 * @returns {string} - User-friendly error message
 */
export function handleWeb3Error(error) {
  if (!error) return 'Unknown error occurred';
  
  const message = error.message || error.toString();
  
  if (message.includes('User denied')) {
    return 'Transaction was cancelled by user.';
  }
  
  if (message.includes('insufficient funds')) {
    return 'Insufficient funds for this transaction.';
  }
  
  if (message.includes('BigInt')) {
    return 'Transaction processing error. Please try again.';
  }
  
  if (message.includes('network')) {
    return 'Network error. Please check your connection and try again.';
  }
  
  if (message.includes('gas')) {
    return 'Transaction failed due to gas issues. Please try again with higher gas limit.';
  }
  
  if (message.includes('nonce')) {
    return 'Transaction nonce error. Please try again.';
  }
  
  if (message.includes('MetaMask')) {
    return 'MetaMask error. Please check your wallet and try again.';
  }
  
  // Return original message if no specific handling
  return message.length > 100 ? 'Transaction failed. Please try again.' : message;
}

/**
 * Estimates gas for a transaction
 * @param {Object} web3 - Web3 instance
 * @param {Object} transaction - Transaction object
 * @returns {Promise<number>} - Estimated gas limit
 */
export async function estimateGas(web3, transaction) {
  try {
    const gasEstimate = await web3.eth.estimateGas(transaction);
    // Add 20% buffer to the estimate
    return Math.floor(Number(gasEstimate) * 1.2);
  } catch (error) {
    console.error('Gas estimation failed:', error);
    // Return default gas limit for simple transfers
    return 21000;
  }
}

/**
 * Gets current gas price from network
 * @param {Object} web3 - Web3 instance
 * @returns {Promise<string>} - Gas price in Wei
 */
export async function getCurrentGasPrice(web3) {
  try {
    const gasPrice = await web3.eth.getGasPrice();
    // Add 10% buffer to ensure transaction goes through
    return (BigInt(gasPrice) * BigInt(110) / BigInt(100)).toString();
  } catch (error) {
    console.error('Failed to get gas price:', error);
    // Return default gas price (20 Gwei)
    return web3.utils.toWei('20', 'gwei');
  }
}
