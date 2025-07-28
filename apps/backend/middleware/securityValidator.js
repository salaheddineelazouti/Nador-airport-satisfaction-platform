/**
 * 🔐 MIDDLEWARE DE SÉCURITÉ AVANCÉ
 * Couche de validation et sécurité supplémentaire côté backend
 */

const logger = require('../utils/logger');
const { RateLimiterMemory } = require('rate-limiter-flexible');

// Mode debug pour le développement
const DEBUG_MODE = process.env.NODE_ENV === 'development';
const SECURITY_STRICT_MODE = process.env.SECURITY_STRICT_MODE === 'true';

// Rate limiter par IP pour détecter les abus
const bruteForceProtector = new RateLimiterMemory({
  keyGenerator: (req) => req.ip,
  points: 10, // 10 tentatives
  duration: 3600, // par heure
  blockDuration: 3600 // bloquer 1 heure
});

// Rate limiter par session pour éviter la duplication
const duplicateProtector = new RateLimiterMemory({
  keyGenerator: (req) => req.ip + req.get('User-Agent'),
  points: 3, // 3 soumissions
  duration: 1800, // par 30 minutes
  blockDuration: 1800
});

/**
 * 🛡️ VALIDATION DE SÉCURITÉ AVANCÉE
 */
const validateSecurityConstraints = (req, res, next) => {
  try {
    const { ratings, comments, personalInfo } = req.body;
    const securityErrors = [];
    
    // 1. VALIDATION ANTI-SPAM
    if (comments && typeof comments === 'object') {
      Object.entries(comments).forEach(([key, comment]) => {
        if (typeof comment === 'string') {
          // Détecter contenu malveillant
          const maliciousPatterns = [
            /<script.*?>.*?<\/script>/gi,
            /javascript:/gi,
            /on\w+\s*=.*?['"][^'"]*['"]/gi,
            /\beval\s*\(/gi,
            /<iframe/gi,
            /<object/gi,
            /<embed/gi
          ];
          
          if (maliciousPatterns.some(pattern => pattern.test(comment))) {
            securityErrors.push({
              field: `comments.${key}`,
              message: 'Contenu potentiellement malveillant détecté',
              code: 'SECURITY_MALICIOUS_CONTENT'
            });
          }
          
          // Limiter longueur excessive
          if (comment.length > 2000) {
            securityErrors.push({
              field: `comments.${key}`,
              message: 'Commentaire trop long (max 2000 caractères)',
              code: 'SECURITY_COMMENT_TOO_LONG'
            });
          }
          
          // Détecter spam (répétitions excessives)
          const repeatedPattern = /(.{3,})\1{5,}/g;
          if (repeatedPattern.test(comment)) {
            securityErrors.push({
              field: `comments.${key}`,
              message: 'Contenu répétitif détecté (possible spam)',
              code: 'SECURITY_SPAM_PATTERN'
            });
          }
        }
      });
    }
    
    // 2. VALIDATION COHÉRENCE BUSINESS
    if (ratings && typeof ratings === 'object') {
      const ratingValues = Object.values(ratings);
      
      // Détecter pattern suspect (toutes les notes identiques) - VERSION ASSOUPLIE
      // Seulement si + de 10 ratings ET toutes notes extrêmes (1 ou 5)
      if (ratingValues.length > 10 && ratingValues.every(rating => rating === ratingValues[0])) {
        const commonRating = ratingValues[0];
        // Seulement alerter si toutes les notes sont 1 ou 5 (vraiment suspect)
        if (commonRating === 1 || commonRating === 5) {
          securityErrors.push({
            field: 'ratings',
            message: `Pattern de notation extrême suspect détecté (${ratingValues.length} notes identiques de ${commonRating})`,
            code: 'SECURITY_EXTREME_RATING_PATTERN'
          });
          
          logger.warn('Pattern de notation extrême suspect détecté', {
            ip: req.ip,
            commonRating,
            count: ratingValues.length,
            userAgent: req.get('User-Agent')
          });
        } else {
          // Pour les notes moyennes (2,3,4), juste logger sans bloquer
          logger.info('Pattern de notation uniforme détecté (non bloquant)', {
            ip: req.ip,
            commonRating,
            count: ratingValues.length,
            userAgent: req.get('User-Agent')
          });
        }
      }
      
      // Vérifier nombre minimum de ratings pour éviter soumissions vides
      if (Object.keys(ratings).length < 1) {
        securityErrors.push({
          field: 'ratings',
          message: 'Au moins une évaluation est requise',
          code: 'SECURITY_INSUFFICIENT_RATINGS'
        });
      }
    }
    
    // 3. VALIDATION DONNÉES PERSONNELLES
    if (personalInfo && personalInfo.nationality) {
      // Vérifier caractères suspects dans nationalité
      const suspiciousChars = /[<>{}[\]\\\/\|`~!@#$%^&*()+=]/;
      if (suspiciousChars.test(personalInfo.nationality)) {
        securityErrors.push({
          field: 'personalInfo.nationality',
          message: 'Caractères non autorisés dans la nationalité',
          code: 'SECURITY_INVALID_NATIONALITY_CHARS'
        });
      }
    }
    
    // Si erreurs de sécurité détectées
    if (securityErrors.length > 0) {
      logger.warn('Erreurs de sécurité détectées', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        errors: securityErrors,
        body: DEBUG_MODE ? req.body : '[MASKED]'
      });
      
      return res.status(400).json({
        success: false,
        message: 'Données non conformes aux exigences de sécurité',
        errors: securityErrors,
        ...(DEBUG_MODE && {
          debug: {
            timestamp: new Date().toISOString(),
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            strictMode: SECURITY_STRICT_MODE
          }
        })
      });
    }
    
    // Ajouter métadonnées de sécurité à la requête
    req.securityMetadata = {
      validatedAt: new Date(),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      contentLength: JSON.stringify(req.body).length,
      ratingsCount: ratings ? Object.keys(ratings).length : 0,
      commentsCount: comments ? Object.keys(comments).length : 0
    };
    
    next();
    
  } catch (error) {
    logger.error('Erreur dans la validation de sécurité', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur de validation de sécurité'
    });
  }
};

/**
 * 🚫 PROTECTION CONTRE LA FORCE BRUTE
 */
const bruteForceProtection = async (req, res, next) => {
  try {
    await bruteForceProtector.consume(req.ip);
    next();
  } catch (rejRes) {
    const remainingTime = Math.round(rejRes.msBeforeNext / 1000 / 60);
    
    logger.warn('Tentative de force brute détectée', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      remainingTime: remainingTime
    });
    
    return res.status(429).json({
      success: false,
      message: `Trop de tentatives. Réessayez dans ${remainingTime} minutes.`,
      retryAfter: remainingTime * 60
    });
  }
};

/**
 * 🔄 PROTECTION CONTRE LA DUPLICATION
 */
const duplicateProtection = async (req, res, next) => {
  try {
    await duplicateProtector.consume(req.ip + req.get('User-Agent'));
    next();
  } catch (rejRes) {
    const remainingTime = Math.round(rejRes.msBeforeNext / 1000 / 60);
    
    logger.warn('Tentative de duplication détectée', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      remainingTime: remainingTime
    });
    
    return res.status(429).json({
      success: false,
      message: `Limite de soumissions atteinte. Réessayez dans ${remainingTime} minutes.`,
      retryAfter: remainingTime * 60
    });
  }
};

/**
 * 🔍 VALIDATION DE COHÉRENCE BUSINESS
 */
const validateBusinessLogic = (req, res, next) => {
  try {
    const { ratings, personalInfo, language } = req.body;
    const businessErrors = [];
    
    // Vérifier cohérence âge/motif de voyage
    if (personalInfo && personalInfo.age && personalInfo.travelPurpose) {
      // Logique business : les jeunes (18-25) en "affaires" sont rares
      if (personalInfo.age === '18-25' && personalInfo.travelPurpose === 'affaires') {
        logger.info('Pattern inhabituel détecté : jeune en voyage d\'affaires', {
          ip: req.ip,
          age: personalInfo.age,
          purpose: personalInfo.travelPurpose
        });
      }
    }
    
    // Vérifier cohérence langue/ratings
    // Par exemple, si la langue est 'ar', s'assurer que certains ratings sont présents
    
    // Ajouter plus de logiques business selon besoins
    
    if (businessErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Incohérences dans les données business',
        errors: businessErrors
      });
    }
    
    next();
    
  } catch (error) {
    logger.error('Erreur dans la validation business', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur de validation business'
    });
  }
};

/**
 * 📊 COLLECTEUR DE MÉTRIQUES DE SÉCURITÉ
 */
const collectSecurityMetrics = (req, res, next) => {
  const startTime = Date.now();
  
  // Hook sur la réponse pour collecter métriques
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - startTime;
    
    // Log des métriques de sécurité
    logger.info('Métriques de sécurité', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: duration,
      securityMetadata: req.securityMetadata || null
    });
    
    return originalSend.call(this, data);
  };
  
  next();
};

module.exports = {
  validateSecurityConstraints,
  bruteForceProtection,
  duplicateProtection,
  validateBusinessLogic,
  collectSecurityMetrics
};
