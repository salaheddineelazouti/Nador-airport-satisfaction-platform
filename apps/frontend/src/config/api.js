// 🌐 Configuration dynamique de l'API
const getApiBaseUrl = () => {
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
  
  console.log('🔗 URL construite:', url);
  console.log('📋 Configuration de la requête:', { endpoint, options });
  
  const config = {
    headers: API_CONFIG.defaultHeaders,
    ...options
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('API Request Error:', {
      url,
      error: error.message,
      config
    });
    throw error;
  }
};

export default API_CONFIG;
