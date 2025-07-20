import { useState } from 'react';
import { showNotification } from '../Components/NotificationSystem';

export default function TestNotifications() {
  const testMetaMaskError = () => {
    showNotification("Failed to connect to MetaMask", "error", 5000);
  };

  const testMetaMaskWarning = () => {
    showNotification("Please connect the correct MetaMask wallet", "warning", 6000);
  };

  const testMetaMaskSuccess = () => {
    showNotification("MetaMask connected successfully!", "success", 3000);
  };

  const testMetaMaskInfo = () => {
    showNotification("Please install MetaMask to continue", "info", 5000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Test Notification System</h1>
        
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-4">MetaMask Notification Types</h2>
          
          <button
            onClick={testMetaMaskError}
            className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
          >
            Test Error Notification (MetaMask Connection Failed)
          </button>
          
          <button
            onClick={testMetaMaskWarning}
            className="w-full bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600"
          >
            Test Warning Notification (Wrong Wallet)
          </button>
          
          <button
            onClick={testMetaMaskSuccess}
            className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
          >
            Test Success Notification (Connected)
          </button>
          
          <button
            onClick={testMetaMaskInfo}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Test Info Notification (Install MetaMask)
          </button>
        </div>
        
        <p className="text-center mt-6 text-gray-600">
          Click the buttons above to test different notification types. 
          Notifications will appear in the top-right corner.
        </p>
      </div>
    </div>
  );
}
