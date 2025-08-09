/**
 * 🔧 SYSTÈME DE LOGS CONDITIONNEL
 * Logs actifs seulement en développement
 */

const isDevelopment = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

/**
 * Logger conditionnel qui n'affiche les logs qu'en développement
 */
export const logger = {
  /**
   * Log d'information (bleu)
   */
  info: (message, ...args) => {
    if (isDevelopment) {
      console.log(`ℹ️ ${message}`, ...args);
    }
  },

  /**
   * Log de succès (vert)
   */
  success: (message, ...args) => {
    if (isDevelopment) {
      console.log(`✅ ${message}`, ...args);
    }
  },

  /**
   * Log d'avertissement (jaune)
   */
  warn: (message, ...args) => {
    if (isDevelopment) {
      console.warn(`⚠️ ${message}`, ...args);
    }
  },

  /**
   * Log d'erreur (rouge) - affiché aussi en production pour le debugging
   */
  error: (message, error, ...args) => {
    if (isDevelopment || !isTest) {
      console.error(`❌ ${message}`, error, ...args);
    }
  },

  /**
   * Log de debug (gris) - uniquement en développement
   */
  debug: (message, ...args) => {
    if (isDevelopment) {
      console.debug(`🔍 ${message}`, ...args);
    }
  },

  /**
   * Log de performance (violet)
   */
  perf: (label, ...args) => {
    if (isDevelopment) {
      console.log(`⚡ PERF: ${label}`, ...args);
    }
  },

  /**
   * Log d'API (bleu clair)
   */
  api: (method, url, data = null) => {
    if (isDevelopment) {
      console.log(`🌐 API [${method}] ${url}`, data ? data : '');
    }
  },

  /**
   * Log de langue (globe)
   */
  language: (message, ...args) => {
    if (isDevelopment) {
      console.log(`🌍 LANG: ${message}`, ...args);
    }
  },

  /**
   * Log de validation (bouclier)
   */
  validation: (message, ...args) => {
    if (isDevelopment) {
      console.log(`🛡️ VALIDATION: ${message}`, ...args);
    }
  },

  /**
   * Log de sécurité (cadenas)
   */
  security: (message, ...args) => {
    if (isDevelopment) {
      console.log(`🔒 SECURITY: ${message}`, ...args);
    }
  },

  /**
   * Grouper les logs
   */
  group: (label, callback) => {
    if (isDevelopment) {
      console.group(label);
      callback();
      console.groupEnd();
    }
  },

  /**
   * Timer de performance
   */
  time: (label) => {
    if (isDevelopment) {
      console.time(label);
    }
  },

  timeEnd: (label) => {
    if (isDevelopment) {
      console.timeEnd(label);
    }
  }
};

/**
 * Logger spécialisé pour les erreurs critiques
 * Toujours actif, même en production
 */
export const criticalLogger = {
  error: (message, error, context = {}) => {
    console.error(`🚨 CRITICAL: ${message}`, {
      error: error?.message || error,
      stack: error?.stack,
      timestamp: new Date().toISOString(),
      ...context
    });
  },

  security: (message, details = {}) => {
    console.error(`🔐 SECURITY ALERT: ${message}`, {
      timestamp: new Date().toISOString(),
      ...details
    });
  }
};

export default logger;
