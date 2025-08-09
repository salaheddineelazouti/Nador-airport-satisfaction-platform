import { useState, useCallback } from 'react';

/**
 * Hook pour gérer le système de notifications
 * Remplace les alert() par un système moderne
 */
export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  /**
   * Ajouter une nouvelle notification
   * @param {Object} notification - Configuration de la notification
   * @param {string} notification.type - Type: 'success', 'error', 'warning', 'info'
   * @param {string} notification.title - Titre (optionnel)
   * @param {string} notification.message - Message principal
   * @param {number} notification.duration - Durée en ms (défaut: 5000)
   * @param {boolean} notification.autoClose - Auto-fermeture (défaut: true)
   */
  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      type: 'info',
      duration: 5000,
      autoClose: true,
      ...notification
    };

    setNotifications(prev => [...prev, newNotification]);
    return id;
  }, []);

  /**
   * Supprimer une notification par ID
   */
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  /**
   * Vider toutes les notifications
   */
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  /**
   * Méthodes raccourcies pour chaque type
   */
  const notifySuccess = useCallback((message, title = null, options = {}) => {
    return addNotification({
      type: 'success',
      title,
      message,
      ...options
    });
  }, [addNotification]);

  const notifyError = useCallback((message, title = null, options = {}) => {
    return addNotification({
      type: 'error',
      title,
      message,
      duration: 8000, // Erreurs restent plus longtemps
      ...options
    });
  }, [addNotification]);

  const notifyWarning = useCallback((message, title = null, options = {}) => {
    return addNotification({
      type: 'warning',
      title,
      message,
      ...options
    });
  }, [addNotification]);

  const notifyInfo = useCallback((message, title = null, options = {}) => {
    return addNotification({
      type: 'info',
      title,
      message,
      ...options
    });
  }, [addNotification]);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo
  };
};

export default useNotifications;
