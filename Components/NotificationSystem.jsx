import { useState, useEffect } from 'react';

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Listen for custom notification events
    const handleNotification = (event) => {
      const { message, type, duration = 5000 } = event.detail;
      const id = Date.now() + Math.random();
      
      const notification = {
        id,
        message,
        type: type || 'info',
        duration
      };

      setNotifications(prev => [...prev, notification]);

      // Auto remove after duration
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    };

    window.addEventListener('showNotification', handleNotification);
    return () => window.removeEventListener('showNotification', handleNotification);
  }, []);

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const getNotificationStyles = (type) => {
    switch (type) {
      case 'error':
        return 'bg-red-100 border-red-400 text-red-700';
      case 'warning':
        return 'bg-yellow-100 border-yellow-400 text-yellow-700';
      case 'success':
        return 'bg-green-100 border-green-400 text-green-700';
      default:
        return 'bg-blue-100 border-blue-400 text-blue-700';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'success':
        return '✅';
      default:
        return 'ℹ️';
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`flex items-center p-4 border rounded-lg shadow-lg max-w-sm animate-slide-in ${getNotificationStyles(notification.type)}`}
        >
          <span className="text-lg mr-3">{getNotificationIcon(notification.type)}</span>
          <div className="flex-1">
            <p className="text-sm font-medium">{notification.message}</p>
          </div>
          <button
            onClick={() => removeNotification(notification.id)}
            className="ml-3 text-lg hover:opacity-70 focus:outline-none"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

// Helper function to show notifications
export const showNotification = (message, type = 'info', duration = 5000) => {
  const event = new CustomEvent('showNotification', {
    detail: { message, type, duration }
  });
  window.dispatchEvent(event);
};

export default NotificationSystem;
