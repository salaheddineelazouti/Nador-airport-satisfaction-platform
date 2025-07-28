const express = require('express');
const { Survey } = require('../models');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * @swagger
 * /api/analytics/dashboard:
 *   get:
 *     summary: Données du tableau de bord analytics
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: Données du dashboard récupérées
 */
router.get('/dashboard', async (req, res) => {
  try {
    // Statistiques globales
    const totalSurveys = await Survey.count({ where: { is_complete: true } });
    
    // Moyennes par catégorie
    const averages = await Survey.findAll({
      attributes: [
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
        ), 'avg_services'],
        [Survey.sequelize.fn('AVG', 
          Survey.sequelize.literal("(ratings->>'restauration')::float")
        ), 'avg_restauration'],
        [Survey.sequelize.fn('AVG', 
          Survey.sequelize.literal("(ratings->>'boutiques')::float")
        ), 'avg_boutiques'],
        [Survey.sequelize.fn('AVG', 
          Survey.sequelize.literal("(ratings->>'proprete')::float")
        ), 'avg_proprete'],
        [Survey.sequelize.fn('AVG', 
          Survey.sequelize.literal("(ratings->>'signalisation')::float")
        ), 'avg_signalisation']
      ],
      where: { is_complete: true },
      raw: true
    });

    // Distribution par langue
    const languageStats = await Survey.findAll({
      attributes: [
        'language',
        [Survey.sequelize.fn('COUNT', Survey.sequelize.col('id')), 'count']
      ],
      where: { is_complete: true },
      group: ['language'],
      raw: true
    });

    // Réponses par jour (7 derniers jours)
    const weeklyStats = await Survey.findAll({
      attributes: [
        [Survey.sequelize.fn('DATE', Survey.sequelize.col('submitted_at')), 'date'],
        [Survey.sequelize.fn('COUNT', Survey.sequelize.col('id')), 'count']
      ],
      where: {
        is_complete: true,
        submitted_at: {
          [Survey.sequelize.Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      },
      group: [Survey.sequelize.fn('DATE', Survey.sequelize.col('submitted_at'))],
      order: [[Survey.sequelize.fn('DATE', Survey.sequelize.col('submitted_at')), 'ASC']],
      raw: true
    });

    res.json({
      success: true,
      data: {
        summary: {
          totalSurveys,
          averageRatings: averages[0],
          lastUpdated: new Date().toISOString()
        },
        distributions: {
          languages: languageStats,
          weekly: weeklyStats
        }
      }
    });

  } catch (error) {
    logger.error('Erreur lors de la récupération du dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

/**
 * @swagger
 * /api/analytics/trends:
 *   get:
 *     summary: Tendances temporelles de satisfaction
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, quarter]
 *         description: Période d'analyse
 *     responses:
 *       200:
 *         description: Tendances récupérées
 */
router.get('/trends', async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    let dateFormat, intervalDays;
    switch (period) {
      case 'week':
        dateFormat = 'YYYY-MM-DD';
        intervalDays = 7;
        break;
      case 'quarter':
        dateFormat = 'YYYY-MM';
        intervalDays = 90;
        break;
      default:
        dateFormat = 'YYYY-MM-DD';
        intervalDays = 30;
    }

    const trends = await Survey.findAll({
      attributes: [
        [Survey.sequelize.fn('DATE_TRUNC', 'day', Survey.sequelize.col('submitted_at')), 'date'],
        [Survey.sequelize.fn('AVG', 
          Survey.sequelize.literal("(ratings->>'accueil')::float")
        ), 'avg_accueil'],
        [Survey.sequelize.fn('AVG', 
          Survey.sequelize.literal("(ratings->>'confort')::float")
        ), 'avg_confort'],
        [Survey.sequelize.fn('COUNT', Survey.sequelize.col('id')), 'count']
      ],
      where: {
        is_complete: true,
        submitted_at: {
          [Survey.sequelize.Op.gte]: new Date(Date.now() - intervalDays * 24 * 60 * 60 * 1000)
        }
      },
      group: [Survey.sequelize.fn('DATE_TRUNC', 'day', Survey.sequelize.col('submitted_at'))],
      order: [[Survey.sequelize.fn('DATE_TRUNC', 'day', Survey.sequelize.col('submitted_at')), 'ASC']],
      raw: true
    });

    res.json({
      success: true,
      data: {
        period,
        trends
      }
    });

  } catch (error) {
    logger.error('Erreur lors de la récupération des tendances:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

module.exports = router;
