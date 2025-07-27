const express = require('express');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { Survey } = require('../models');
const { generateSessionId } = require('../utils/helpers');
const logger = require('../utils/logger');

const router = express.Router();

// Rate limiting spécifique aux enquêtes
const surveyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 3, // Maximum 3 enquêtes par heure par IP
  message: {
    success: false,
    message: 'Limite d\'enquêtes atteinte. Veuillez réessayer plus tard.'
  }
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
  surveyLimiter,
  [
    body('language')
      .isIn(['fr', 'ar', 'en'])
      .withMessage('Langue non supportée'),
    body('ratings')
      .isObject()
      .withMessage('Les évaluations doivent être un objet')
      .custom((ratings) => {
        const validCategories = [
          'accueil', 'securite', 'confort', 'services',
          'restauration', 'boutiques', 'proprete', 'signalisation'
        ];
        
        for (const [category, rating] of Object.entries(ratings)) {
          if (!validCategories.includes(category)) {
            throw new Error(`Catégorie invalide: ${category}`);
          }
          if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
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
      .isIn(['18-25', '26-35', '36-45', '46-55', '56-65', '65+'])
      .withMessage('Tranche d\'âge invalide'),
    body('personalInfo.travelPurpose')
      .optional()
      .isIn(['business', 'leisure', 'transit', 'other'])
      .withMessage('Motif de voyage invalide'),
    body('personalInfo.frequency')
      .optional()
      .isIn(['first-time', 'occasional', 'regular', 'frequent'])
      .withMessage('Fréquence de voyage invalide')
  ],
  async (req, res) => {
    try {
      // Vérification des erreurs de validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
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

      // Création de l'enquête
      const survey = await Survey.create({
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
      });

      logger.info('Nouvelle enquête soumise', {
        surveyId: survey.id,
        language: survey.language,
        ip: req.ip,
        ratingsCount: Object.keys(ratings).length
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

module.exports = router;
