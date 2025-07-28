const { v4: uuidv4 } = require('uuid');

/**
 * Génère un ID de session unique
 * @returns {string} ID de session unique
 */
function generateSessionId() {
  return `session_${Date.now()}_${uuidv4().substring(0, 8)}`;
}

/**
 * Valide une adresse email
 * @param {string} email 
 * @returns {boolean}
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitise une chaîne de caractères
 * @param {string} str 
 * @returns {string}
 */
function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/[<>]/g, '');
}

/**
 * Calcul d'une note moyenne
 * @param {Object} ratings 
 * @returns {number}
 */
function calculateAverageRating(ratings) {
  const values = Object.values(ratings).filter(rating => 
    typeof rating === 'number' && rating >= 1 && rating <= 5
  );
  
  if (values.length === 0) return 0;
  
  return Math.round((values.reduce((sum, rating) => sum + rating, 0) / values.length) * 100) / 100;
}

module.exports = {
  generateSessionId,
  isValidEmail,
  sanitizeString,
  calculateAverageRating
};
