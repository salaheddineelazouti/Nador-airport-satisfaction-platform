import { logger, criticalLogger } from '../utils/logger';

// 🌐 Configuration dynamique de l'API
const getApiBaseUrl = () => {
  logger.debug('Détection de l\'URL de base API');
  // Si variable d'environnement définie, l'utiliser
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Sinon, détecter automatiquement basé sur l'hostname actuel
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  
  // Si on est sur une IP réseau, utiliser la même IP pour l'API
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return `${protocol}//${hostname}:5000`;
  }
  
  // Fallback localhost
  return 'http://localhost:5000';
};

const API_CONFIG = {
  // URL de base de l'API backend - DYNAMIQUE 🚀
  get baseURL() {
    return getApiBaseUrl();
  },
  
  // Endpoints
  endpoints: {
    surveys: '/api/surveys',
    stats: '/api/surveys/stats',
    flights: '/api/flights/departures',
    analytics: '/api/analytics/dashboard'
  },

  // Configuration par défaut pour fetch
  defaultHeaders: {
    'Content-Type': 'application/json',
  }
};

// Fonction utilitaire pour construire les URLs complètes
export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.baseURL}${endpoint}`;
};

// Fonction utilitaire pour les requêtes API
export const apiRequest = async (endpoint, options = {}) => {
  const url = buildApiUrl(endpoint);
  
  logger.api(options.method || 'GET', url, options.body ? 'avec données' : '');
  
  const config = {
    headers: API_CONFIG.defaultHeaders,
    ...options
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      const errorMessage = data.message || `HTTP error! status: ${response.status}`;
      logger.error('Réponse API avec erreur:', { status: response.status, url, message: errorMessage });
      throw new Error(errorMessage);
    }
    
    logger.success('Réponse API réussie:', { status: response.status, url });
    return data;
  } catch (error) {
    criticalLogger.error('Erreur critique API:', error, {
      url,
      method: options.method || 'GET',
      hasBody: !!options.body
    });
    throw error;
  }
};

export default API_CONFIG;
