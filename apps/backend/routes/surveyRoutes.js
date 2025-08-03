const express = require('express');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { Op } = require('sequelize');
const { Survey } = require('../models');
const { generateSessionId } = require('../utils/helpers');
const logger = require('../utils/logger');
const {
  validateSecurityConstraints,
  bruteForceProtection,
  duplicateProtection,
  validateBusinessLogic,
  collectSecurityMetrics
} = require('../middleware/securityValidator');
const securityMonitor = require('../utils/securityMonitor');

const router = express.Router();

// Rate limiting spécifique aux enquêtes
const surveyLimiter = rateLimit({
  windowMs: process.env.NODE_ENV === 'development' ? 5 * 60 * 1000 : 60 * 60 * 1000, // 5 min en dev, 1h en prod
  max: process.env.NODE_ENV === 'development' ? 50 : 3, // 50 en dev, 3 en prod
  message: {
    success: false,
    message: 'Limite d\'enquêtes atteinte. Veuillez réessayer plus tard.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Survey:
 *       type: object
 *       required:
 *         - language
 *         - ratings
 *       properties:
 *         language:
 *           type: string
 *           enum: [fr, ar, en]
 *         personalInfo:
 *           type: object
 *           properties:
 *             age:
 *               type: string
 *             nationality:
 *               type: string
 *             travelPurpose:
 *               type: string
 *             frequency:
 *               type: string
 *         ratings:
 *           type: object
 *         comments:
 *           type: object
 */

/**
 * @swagger
 * /api/surveys:
 *   post:
 *     summary: Soumettre une nouvelle enquête de satisfaction
 *     tags: [Surveys]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Survey'
 *     responses:
 *       201:
 *         description: Enquête soumise avec succès
 *       400:
 *         description: Données invalides
 *       429:
 *         description: Limite de soumission atteinte
 */
router.post('/', 
  // 🛡️ COUCHES DE SÉCURITÉ SUPPLÉMENTAIRES
  collectSecurityMetrics,    // Collecte des métriques
  bruteForceProtection,      // Protection contre la force brute
  duplicateProtection,       // Protection contre la duplication
  surveyLimiter,             // Rate limiting existant
  validateSecurityConstraints, // Validation de sécurité avancée
  validateBusinessLogic,     // Validation de cohérence business
  [
    // 📋 VALIDATIONS EXPRESS-VALIDATOR EXISTANTES
    body('language')
      .isIn(['fr', 'ar', 'en'])
      .withMessage('Langue non supportée'),
    body('ratings')
      .isObject()
      .withMessage('Les évaluations doivent être un objet')
      .custom((ratings) => {
        const validCategories = [
          // Catégories originales (compatibilité)
          'accueil', 'securite', 'confort', 'services',
          'restauration', 'boutiques', 'proprete', 'signalisation',
          
          // === SYNC COMPLET AVEC FRONTEND ===
          // Accès terminal (6 questions: 0-5)
          'acces_terminal_0', 'acces_terminal_1', 'acces_terminal_2',
          'acces_terminal_3', 'acces_terminal_4', 'acces_terminal_5',
          
          // Enregistrement et contrôles (9 questions: 0-8)
          'enregistrement_controles_0', 'enregistrement_controles_1', 'enregistrement_controles_2',
          'enregistrement_controles_3', 'enregistrement_controles_4', 'enregistrement_controles_5',
          'enregistrement_controles_6', 'enregistrement_controles_7', 'enregistrement_controles_8',
          
          // Zones d'attente (4 questions: 0-3)
          'zones_attente_0', 'zones_attente_1', 'zones_attente_2', 'zones_attente_3',
          
          // Services et commodités (6 questions: 0-5)
          'services_commodites_0', 'services_commodites_1', 'services_commodites_2',
          'services_commodites_3', 'services_commodites_4', 'services_commodites_5',
          
          // Hygiène et infrastructure (4 questions: 0-3)
          'hygiene_infrastructure_0', 'hygiene_infrastructure_1',
          'hygiene_infrastructure_2', 'hygiene_infrastructure_3',
          
          // Personnel et service (2 questions: 0-1)
          'personnel_service_0', 'personnel_service_1'
        ];
        
        for (const [category, rating] of Object.entries(ratings)) {
          if (!validCategories.includes(category)) {
            throw new Error(`Catégorie invalide: ${category}`);
          }
          const numRating = Number(rating);
          if (!Number.isInteger(numRating) || numRating < 1 || numRating > 5) {
            throw new Error(`Note invalide pour ${category}: doit être entre 1 et 5`);
          }
        }
        return true;
      }),
    body('comments')
      .optional()
      .isObject()
      .withMessage('Les commentaires doivent être un objet'),
    body('personalInfo.age')
      .optional()
      .isIn(['18-25', '26-35', '36-50', '51-65', '65+'])
      .withMessage('Tranche d\'âge invalide'),
    body('personalInfo.travelPurpose')
      .optional()
      .isIn(['business', 'leisure', 'transit', 'other', 'tourisme', 'affaires', 'famille', 'autre'])
      .withMessage('Motif de voyage invalide'),
    body('personalInfo.frequency')
      .optional()
      .isIn(['first-time', 'occasional', 'regular', 'frequent', 'premiere', 'occasionnel', 'regulier'])
      .withMessage('Fréquence de voyage invalide')
  ],
  async (req, res) => {
    try {
      // Debug: Log des données reçues
      console.log('📛 Données reçues:', JSON.stringify(req.body, null, 2));
      console.log('🗺 URL demandée:', req.url);
      
      // 🔍 VÉRIFICATION DES ERREURS DE VALIDATION
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('❌ Erreurs de validation:', errors.array());
        
        // 📊 Enregistrer l'erreur dans le monitoring
        securityMonitor.recordValidationError(req.ip, 'VALIDATION_FAILED', {
          errors: errors.array(),
          userAgent: req.get('User-Agent'),
          body: req.body
        });
        
        return res.status(400).json({
          success: false,
          message: 'Données invalides',
          errors: errors.array()
        });
      }

      const { language, personalInfo = {}, ratings, comments = {} } = req.body;
      
      // Génération d'un ID de session unique
      const sessionId = generateSessionId();
      
      // Calcul du temps de completion (simulé pour le moment)
      const completionTime = Math.floor(Math.random() * 300) + 60; // 1-5 minutes

      // Préparation des données pour la création
      const surveyData = {
        session_id: sessionId,
        language,
        age_range: personalInfo.age,
        nationality: personalInfo.nationality,
        travel_purpose: personalInfo.travelPurpose,
        frequency: personalInfo.frequency,
        ratings,
        comments,
        ip_address: req.ip,
        user_agent: req.get('User-Agent'),
        completion_time: completionTime,
        is_complete: true
      };
      
      console.log('🔄 Tentative de création de l\'enquête avec les données:', JSON.stringify(surveyData, null, 2));
      
      // Création de l'enquête
      const survey = await Survey.create(surveyData);

      logger.info('Nouvelle enquête soumise', {
        surveyId: survey.id,
        language: survey.language,
        ip: req.ip,
        ratingsCount: Object.keys(ratings).length
      });
      
      // 📊 Enregistrer la soumission réussie dans le monitoring
      securityMonitor.recordSubmission(req.ip, {
        surveyId: survey.id,
        language: survey.language,
        ratingsCount: Object.keys(ratings).length,
        hasPersonalInfo: Object.keys(personalInfo).some(key => personalInfo[key]),
        userAgent: req.get('User-Agent'),
        securityMetadata: req.securityMetadata
      });

      res.status(201).json({
        success: true,
        message: 'Enquête soumise avec succès',
        data: {
          id: survey.id,
          sessionId: survey.session_id,
          submittedAt: survey.submitted_at
        }
      });

    } catch (error) {
      console.log('💥 ERREUR DÉTAILLÉE:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        sql: error.sql || 'N/A'
      });
      logger.error('Erreur lors de la soumission de l\'enquête', error);
      
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({
          success: false,
          message: 'Cette enquête a déjà été soumise'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }
);

/**
 * @swagger
 * /api/surveys:
 *   get:
 *     summary: Obtenir la liste des enquêtes avec pagination et filtres
 *     tags: [Surveys] 
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *           enum: [fr, ar, en]
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *       - in: query
 *         name: maxRating
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *     responses:
 *       200:
 *         description: Liste des enquêtes récupérée avec succès
 */
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      language,
      dateFrom,
      dateTo,
      minRating,
      maxRating
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    // Construction des conditions de filtrage
    const where = { is_complete: true };
    
    if (language) {
      where.language = language;
    }
    
    if (dateFrom || dateTo) {
      where.submitted_at = {};
      if (dateFrom) {
        where.submitted_at[Op.gte] = new Date(dateFrom);
      }
      if (dateTo) {
        where.submitted_at[Op.lte] = new Date(dateTo + 'T23:59:59');
      }
    }

    // Pour le filtrage par rating, on doit calculer la moyenne
    let havingClause = null;
    if (minRating || maxRating) {
      const ratingConditions = [];
      if (minRating) {
        ratingConditions.push(`avg_rating >= ${parseFloat(minRating)}`);
      }
      if (maxRating) {
        ratingConditions.push(`avg_rating <= ${parseFloat(maxRating)}`);
      }
      havingClause = ratingConditions.join(' AND ');
    }

    // Requête principale avec calcul de la moyenne des ratings
    const surveysQuery = `
      SELECT 
        id,
        session_id,
        language,
        age_range,
        nationality,
        travel_purpose,
        frequency,
        ratings,
        comments,
        submitted_at,
        (
          SELECT AVG(value::float)
          FROM jsonb_each_text(ratings) 
          WHERE value ~ '^[0-9]+(\\.[0-9]+)?$'
        ) as avg_rating
      FROM surveys 
      WHERE is_complete = true
        ${language ? `AND language = '${language}'` : ''}
        ${dateFrom ? `AND submitted_at >= '${dateFrom}'` : ''}
        ${dateTo ? `AND submitted_at <= '${dateTo} 23:59:59'` : ''}
      ${havingClause ? `HAVING (
        SELECT AVG(value::float)
        FROM jsonb_each_text(ratings) 
        WHERE value ~ '^[0-9]+(\\.[0-9]+)?$'
      ) ${havingClause.replace('avg_rating', '')}` : ''}
      ORDER BY submitted_at DESC
      LIMIT ${limitNum} OFFSET ${offset}
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM (
        SELECT 
          id,
          (
            SELECT AVG(value::float)
            FROM jsonb_each_text(ratings) 
            WHERE value ~ '^[0-9]+(\\.[0-9]+)?$'
          ) as avg_rating
        FROM surveys 
        WHERE is_complete = true
          ${language ? `AND language = '${language}'` : ''}
          ${dateFrom ? `AND submitted_at >= '${dateFrom}'` : ''}
          ${dateTo ? `AND submitted_at <= '${dateTo} 23:59:59'` : ''}
        ${havingClause ? `HAVING (
          SELECT AVG(value::float)
          FROM jsonb_each_text(ratings) 
          WHERE value ~ '^[0-9]+(\\.[0-9]+)?$'
        ) ${havingClause.replace('avg_rating', '')}` : ''}
      ) as filtered_surveys
    `;

    const [surveys, countResult] = await Promise.all([
      Survey.sequelize.query(surveysQuery, {
        type: Survey.sequelize.QueryTypes.SELECT
      }),
      Survey.sequelize.query(countQuery, {
        type: Survey.sequelize.QueryTypes.SELECT
      })
    ]);

    const total = parseInt(countResult[0]?.total || 0);
    const totalPages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      data: {
        surveys,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: total,
          itemsPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        },
        filters: {
          language,
          dateFrom,
          dateTo,
          minRating,
          maxRating
        }
      }
    });

  } catch (error) {
    logger.error('Erreur lors de la récupération des enquêtes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

/**
 * @swagger
 * /api/surveys/stats:
 *   get:
 *     summary: Obtenir les statistiques générales des enquêtes
 *     tags: [Surveys]
 *     responses:
 *       200:
 *         description: Statistiques récupérées avec succès
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await Survey.findAll({
      attributes: [
        [Survey.sequelize.fn('COUNT', Survey.sequelize.col('id')), 'total_surveys'],
        [Survey.sequelize.fn('AVG', 
          Survey.sequelize.literal("(ratings->>'accueil')::float")
        ), 'avg_accueil'],
        [Survey.sequelize.fn('AVG', 
          Survey.sequelize.literal("(ratings->>'securite')::float")
        ), 'avg_securite'],
        [Survey.sequelize.fn('AVG', 
          Survey.sequelize.literal("(ratings->>'confort')::float")
        ), 'avg_confort'],
        [Survey.sequelize.fn('AVG', 
          Survey.sequelize.literal("(ratings->>'services')::float")
        ), 'avg_services']
      ],
      where: {
        is_complete: true
      },
      raw: true
    });

    const languageDistribution = await Survey.findAll({
      attributes: [
        'language',
        [Survey.sequelize.fn('COUNT', Survey.sequelize.col('id')), 'count']
      ],
      where: {
        is_complete: true
      },
      group: ['language'],
      raw: true
    });

    res.json({
      success: true,
      data: {
        overall: stats[0],
        languageDistribution
      }
    });

  } catch (error) {
    logger.error('Erreur lors de la récupération des statistiques', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

/**
 * @swagger
 * /api/surveys/{sessionId}:
 *   get:
 *     summary: Récupérer une enquête par son ID de session
 *     tags: [Surveys]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Enquête trouvée
 *       404:
 *         description: Enquête non trouvée
 */
router.get('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const survey = await Survey.findOne({
      where: { session_id: sessionId },
      attributes: { exclude: ['ip_address', 'user_agent'] }
    });

    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Enquête non trouvée'
      });
    }

    res.json({
      success: true,
      data: survey
    });

  } catch (error) {
    logger.error('Erreur lors de la récupération de l\'enquête', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

/**
 * @swagger
 * /api/surveys/security/metrics:
 *   get:
 *     summary: Obtenir les métriques de sécurité (admin seulement)
 *     tags: [Surveys]
 *     responses:
 *       200:
 *         description: Métriques récupérées avec succès
 */
router.get('/security/metrics', async (req, res) => {
  try {
    // TODO: Ajouter une authentification admin ici
    
    const metrics = securityMonitor.getMetrics();
    const patterns = await securityMonitor.analyzeSubmissionPatterns();
    
    res.json({
      success: true,
      data: {
        metrics,
        suspiciousPatterns: patterns,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    logger.error('Erreur lors de la récupération des métriques de sécurité', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

module.exports = router;
