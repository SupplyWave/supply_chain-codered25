import { useState, useEffect } from 'react';
import { useTracking } from '../Context/Tracking';

export default function GPSTrackingUpdate({ order, onUpdate }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [description, setDescription] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const { currentUser, verifyWalletConnection } = useTracking();

  // Predefined tracking statuses (only values valid for both trackingEvents.status AND currentStatus)
  const trackingStatuses = [
    { value: 'payment_confirmed', label: 'Payment Confirmed', description: 'Payment has been confirmed' },
    { value: 'processing', label: 'Processing Order', description: 'Order is being processed' },
    { value: 'shipped', label: 'Shipped', description: 'Order has been shipped' },
    { value: 'in_transit', label: 'In Transit', description: 'Order is on the way to destination' },
    { value: 'out_for_delivery', label: 'Out for Delivery', description: 'Order is out for final delivery' },
    { value: 'delivered', label: 'Delivered', description: 'Order has been delivered successfully' },
    { value: 'cancelled', label: 'Cancelled', description: 'Order has been cancelled' }
  ];

  // Get current GPS location
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      setIsGettingLocation(true);
      setLocationError('');

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString()
          };
          
          // Get address from coordinates using reverse geocoding
          reverseGeocode(locationData.latitude, locationData.longitude)
            .then(address => {
              locationData.address = address;
              setLocation(locationData);
              setIsGettingLocation(false);
              resolve(locationData);
            })
            .catch(error => {
              console.warn('Reverse geocoding failed:', error);
              locationData.address = `${locationData.latitude.toFixed(6)}, ${locationData.longitude.toFixed(6)}`;
              setLocation(locationData);
              setIsGettingLocation(false);
              resolve(locationData);
            });
        },
        (error) => {
          setIsGettingLocation(false);
          let errorMessage = 'Unable to get location: ';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage += 'Location request timed out';
              break;
            default:
              errorMessage += 'Unknown error occurred';
              break;
          }
          setLocationError(errorMessage);
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  };

  // Reverse geocoding to get address from coordinates
  const reverseGeocode = async (lat, lng) => {
    try {
      // Using a free geocoding service (you can replace with your preferred service)
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );
      
      if (response.ok) {
        const data = await response.json();
        return `${data.locality || ''}, ${data.principalSubdivision || ''}, ${data.countryName || ''}`.replace(/^,\s*|,\s*$/g, '');
      }
    } catch (error) {
      console.warn('Geocoding service error:', error);
    }
    
    // Fallback to coordinates if geocoding fails
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  // Handle status update with GPS location
  const handleUpdateWithGPS = async () => {
    if (!selectedStatus) {
      alert('Please select a status to update');
      return;
    }

    try {
      setIsUpdating(true);
      
      // Verify wallet connection
      await verifyWalletConnection();

      // Get current GPS location
      const currentLocation = await getCurrentLocation();

      // Determine if this is a raw material order or regular product order
      const isRawMaterial = order.isRawMaterial || order.materialId;

      let updateData, apiEndpoint;

      if (isRawMaterial) {
        // Extract payment ID from order ID (format: materialId-paymentId)
        const paymentId = order._id.split('-')[1] || order.transactionHash;

        // Raw material tracking data
        updateData = {
          materialId: order.materialId,
          paymentId: paymentId,
          status: selectedStatus,
          description: description || trackingStatuses.find(s => s.value === selectedStatus)?.description || 'Status updated',
          location: {
            address: currentLocation.address,
            coordinates: {
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude
            },
            accuracy: currentLocation.accuracy,
            facilityType: 'supplier_facility',
            timestamp: currentLocation.timestamp
          },
          updatedBy: currentUser,
          notes: `GPS Location: ${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)} (±${Math.round(currentLocation.accuracy)}m)`,
          estimatedNextUpdate: getEstimatedNextUpdate(selectedStatus)
        };
        apiEndpoint = '/api/rawmaterial/tracking';
      } else {
        // Regular product tracking data
        updateData = {
          purchaseId: order.purchaseId,
          status: selectedStatus,
          description: description || trackingStatuses.find(s => s.value === selectedStatus)?.description || 'Status updated',
          location: {
            address: currentLocation.address,
            coordinates: {
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude
            },
            accuracy: currentLocation.accuracy,
            facilityType: 'factory',
            timestamp: currentLocation.timestamp
          },
          updatedBy: currentUser,
          notes: `GPS Location: ${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)} (±${Math.round(currentLocation.accuracy)}m)`,
          estimatedNextUpdate: getEstimatedNextUpdate(selectedStatus)
        };
        apiEndpoint = '/api/tracking/update';
      }

      // Send update to appropriate API
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (result.success) {
        const itemType = isRawMaterial ? 'Material shipment' : 'Order';
        alert(`${itemType} status updated successfully to: ${trackingStatuses.find(s => s.value === selectedStatus)?.label}`);

        // Reset form
        setSelectedStatus('');
        setDescription('');
        setLocation(null);

        // Notify parent component
        if (onUpdate) {
          onUpdate(result.data);
        }
      } else {
        const itemType = isRawMaterial ? 'material shipment' : 'order';
        alert(`Failed to update ${itemType} status: ` + result.message);
      }

    } catch (error) {
      const itemType = (order.isRawMaterial || order.materialId) ? 'material shipment' : 'order';
      console.error(`Error updating ${itemType} status:`, error);
      alert(`Error updating ${itemType} status: ` + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  // Get estimated next update time based on status
  const getEstimatedNextUpdate = (status) => {
    const now = new Date();
    const estimatedHours = {
      'payment_confirmed': 4,
      'processing': 8,
      'shipped': 2,
      'in_transit': 6,
      'out_for_delivery': 2,
      'delivered': 0,
      'cancelled': 0
    };

    const hours = estimatedHours[status] || 2;
    return new Date(now.getTime() + hours * 60 * 60 * 1000).toISOString();
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Update Delivery Status</h3>
        <div className="text-sm text-gray-500">
          Order: {order.purchaseId}
        </div>
      </div>

      {/* Current Location Display */}
      {location && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center mb-2">
            <span className="text-green-600 mr-2">📍</span>
            <span className="font-medium text-green-800">Current Location Captured</span>
          </div>
          <div className="text-sm text-green-700">
            <div>📍 {location.address}</div>
            <div>🎯 {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}</div>
            <div>📏 Accuracy: ±{Math.round(location.accuracy)}m</div>
          </div>
        </div>
      )}

      {/* Location Error */}
      {locationError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-700 text-sm">{locationError}</div>
          <button
            onClick={getCurrentLocation}
            className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Status Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Update Status *
        </label>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        >
          <option value="">Select new status...</option>
          {trackingStatuses.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>

      {/* Custom Description */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Notes (Optional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add any additional information about this update..."
          rows="3"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={getCurrentLocation}
          disabled={isGettingLocation}
          className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 disabled:bg-gray-400 transition-colors flex items-center justify-center"
        >
          {isGettingLocation ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Getting Location...
            </>
          ) : (
            <>
              📍 Get Current Location
            </>
          )}
        </button>

        <button
          onClick={handleUpdateWithGPS}
          disabled={isUpdating || !selectedStatus || !location}
          className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors flex items-center justify-center"
        >
          {isUpdating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Updating...
            </>
          ) : (
            'Update with GPS Location'
          )}
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="text-sm text-blue-800">
          <strong>📱 How it works:</strong>
          <ol className="mt-1 ml-4 list-decimal">
            <li>Click "Get Current Location" to capture your GPS position</li>
            <li>Select the appropriate delivery status</li>
            <li>Add any additional notes if needed</li>
            <li>Click "Update with GPS Location" to send the update</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
