const logger = require('../utils/logger');

/**
 * Middleware de gestion des erreurs
 */
const errorHandler = (err, req, res, next) => {
  // Log de l'erreur
  logger.error('Erreur capturée:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Erreurs de validation Sequelize
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map(error => ({
      field: error.path,
      message: error.message
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Erreur de validation',
      errors
    });
  }

  // Erreurs de contrainte unique
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      success: false,
      message: 'Cette ressource existe déjà'
    });
  }

  // Erreurs de base de données
  if (err.name?.startsWith('Sequelize')) {
    return res.status(500).json({
      success: false,
      message: 'Erreur de base de données'
    });
  }

  // Erreurs de validation express-validator
  if (err.type === 'validation') {
    return res.status(400).json({
      success: false,
      message: 'Données invalides',
      errors: err.errors
    });
  }

  // Erreur générique
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Erreur interne du serveur' 
      : err.message
  });
};

module.exports = { errorHandler };
