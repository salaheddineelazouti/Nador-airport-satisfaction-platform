const logger = require('../utils/logger');

/**
 * Middleware de logging des requêtes
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Capture de la fin de la réponse
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - start;
    
    logger.info('Requête HTTP', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      contentLength: res.get('content-length') || 0
    });
    
    originalSend.call(this, data);
  };
  
  next();
};

module.exports = { requestLogger };
