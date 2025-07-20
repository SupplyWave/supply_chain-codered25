import { useState, useEffect } from 'react';
import { useTracking } from '../Context/Tracking';

export default function MetaMaskStatus() {
  const [metaMaskStatus, setMetaMaskStatus] = useState('checking'); // 'checking', 'not-installed', 'not-connected', 'wrong-account', 'connected'
  const [connectedAddress, setConnectedAddress] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const {
    currentUser,
    isAuthenticated,
    connectMetaMask,
    verifyWalletConnection,
    syncMetaMaskWithUser
  } = useTracking();

  useEffect(() => {
    checkMetaMaskStatus();
  }, [currentUser, isAuthenticated]);

  const checkMetaMaskStatus = async () => {
    try {
      if (!isAuthenticated || !currentUser) {
        setMetaMaskStatus('not-needed');
        return;
      }

      if (!window.ethereum) {
        setMetaMaskStatus('not-installed');
        return;
      }

      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      
      if (accounts.length === 0) {
        setMetaMaskStatus('not-connected');
        return;
      }

      const connected = accounts[0];
      setConnectedAddress(connected);

      if (connected.toLowerCase() === currentUser.toLowerCase()) {
        setMetaMaskStatus('connected');
      } else {
        setMetaMaskStatus('wrong-account');
      }
    } catch (error) {
      console.error('Error checking MetaMask status:', error);
      setMetaMaskStatus('error');
    }
  };

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      const result = await connectMetaMask();
      if (result) {
        await checkMetaMaskStatus();
      }
    } catch (error) {
      console.error('Error connecting MetaMask:', error);
      // Error notifications are now handled in the connectMetaMask function
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSwitchAccount = async () => {
    try {
      setIsConnecting(true);
      
      // Request account change
      await window.ethereum.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }]
      });
      
      await checkMetaMaskStatus();
    } catch (error) {
      console.error('Error switching account:', error);
      
      // Show notification instead of alert
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('showNotification', {
          detail: { 
            message: 'Please manually switch to the correct account in MetaMask', 
            type: 'info',
            duration: 5000
          }
        });
        window.dispatchEvent(event);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  if (!isAuthenticated || !currentUser) {
    return null; // Don't show if user is not authenticated
  }

  const getStatusColor = () => {
    switch (metaMaskStatus) {
      case 'connected': return 'bg-green-100 text-green-800 border-green-200';
      case 'wrong-account': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'not-connected': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'not-installed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = () => {
    switch (metaMaskStatus) {
      case 'connected': return '✅';
      case 'wrong-account': return '⚠️';
      case 'not-connected': return '🔗';
      case 'not-installed': return '❌';
      case 'checking': return '🔄';
      default: return '❓';
    }
  };

  const getStatusMessage = () => {
    switch (metaMaskStatus) {
      case 'connected':
        return `MetaMask connected with correct account`;
      case 'wrong-account':
        return `Wrong MetaMask account connected. Expected: ${currentUser?.slice(0, 6)}...${currentUser?.slice(-4)}`;
      case 'not-connected':
        return 'MetaMask not connected. Click to connect.';
      case 'not-installed':
        return 'MetaMask not installed. Please install MetaMask extension.';
      case 'checking':
        return 'Checking MetaMask status...';
      default:
        return 'Unknown MetaMask status';
    }
  };

  const getActionButton = () => {
    switch (metaMaskStatus) {
      case 'not-connected':
        return (
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="ml-3 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {isConnecting ? 'Connecting...' : 'Connect'}
          </button>
        );
      case 'wrong-account':
        return (
          <button
            onClick={handleSwitchAccount}
            disabled={isConnecting}
            className="ml-3 px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600 disabled:bg-gray-400"
          >
            {isConnecting ? 'Switching...' : 'Switch Account'}
          </button>
        );
      case 'not-installed':
        return (
          <a
            href="https://metamask.io/download/"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-3 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
          >
            Install MetaMask
          </a>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border ${getStatusColor()}`}>
      <div className="flex items-center">
        <span className="text-lg mr-2">{getStatusIcon()}</span>
        <div>
          <div className="font-medium text-sm">{getStatusMessage()}</div>
          {connectedAddress && (
            <div className="text-xs opacity-75">
              Connected: {connectedAddress.slice(0, 6)}...{connectedAddress.slice(-4)}
            </div>
          )}
        </div>
      </div>
      {getActionButton()}
    </div>
  );
}
