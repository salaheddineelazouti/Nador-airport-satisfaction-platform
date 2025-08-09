import React, { useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

/**
 * Système de notification moderne pour remplacer alert()
 * @param {Object} props
 * @param {Array} props.notifications - Tableau des notifications
 * @param {Function} props.removeNotification - Fonction pour supprimer une notification
 */
const NotificationSystem = ({ notifications, removeNotification }) => {
  if (!notifications || notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          onRemove={removeNotification}
        />
      ))}
    </div>
  );
};

/**
 * Composant d'une notification individuelle
 */
const NotificationCard = ({ notification, onRemove }) => {
  const { id, type, title, message, duration = 5000, autoClose = true } = notification;

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        onRemove(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, autoClose, onRemove]);

  const getNotificationStyles = () => {
    const baseStyles = "flex items-start p-4 rounded-lg shadow-lg backdrop-blur-sm border animate-slide-in-right";
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-50 border-green-200 text-green-800`;
      case 'error':
        return `${baseStyles} bg-red-50 border-red-200 text-red-800`;
      case 'warning':
        return `${baseStyles} bg-yellow-50 border-yellow-200 text-yellow-800`;
      case 'info':
      default:
        return `${baseStyles} bg-blue-50 border-blue-200 text-blue-800`;
    }
  };

  const getIcon = () => {
    const iconProps = { className: "w-5 h-5 mt-0.5 flex-shrink-0" };
    
    switch (type) {
      case 'success':
        return <CheckCircle2 {...iconProps} className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-600" />;
      case 'error':
        return <AlertCircle {...iconProps} className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-600" />;
      case 'warning':
        return <AlertTriangle {...iconProps} className="w-5 h-5 mt-0.5 flex-shrink-0 text-yellow-600" />;
      case 'info':
      default:
        return <Info {...iconProps} className="w-5 h-5 mt-0.5 flex-shrink-0 text-blue-600" />;
    }
  };

  return (
    <div className={getNotificationStyles()}>
      {getIcon()}
      <div className="ml-3 flex-1 min-w-0">
        {title && (
          <h4 className="text-sm font-semibold mb-1">{title}</h4>
        )}
        <p className="text-sm">{message}</p>
      </div>
      <button
        onClick={() => onRemove(id)}
        className="ml-3 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Fermer la notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default NotificationSystem;
