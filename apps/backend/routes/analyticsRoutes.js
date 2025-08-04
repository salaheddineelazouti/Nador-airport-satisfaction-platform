const express = require('express');
const { Survey } = require('../models');
const { Op } = require('sequelize');
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
    
    // Moyennes par catégorie principales (calculées individuellement)
    const surveys = await Survey.findAll({
      where: { is_complete: true },
      attributes: ['ratings'],
      raw: true
    });

    // Calcul manuel des moyennes pour chaque catégorie
    const calculateCategoryAverage = (surveys, categoryKeys) => {
      let totalSum = 0;
      let totalCount = 0;
      
      surveys.forEach(survey => {
        const ratings = survey.ratings || {};
        let categorySum = 0;
        let categoryCount = 0;
        
        categoryKeys.forEach(key => {
          if (ratings[key] && !isNaN(parseFloat(ratings[key]))) {
            categorySum += parseFloat(ratings[key]);
            categoryCount++;
          }
        });
        
        if (categoryCount > 0) {
          totalSum += categorySum / categoryCount;
          totalCount++;
        }
      });
      
      return totalCount > 0 ? (totalSum / totalCount) : null;
    };

    const averages = [{
      avg_acces_terminal: calculateCategoryAverage(surveys, [
        'acces_terminal_0', 'acces_terminal_1', 'acces_terminal_2', 
        'acces_terminal_3', 'acces_terminal_4', 'acces_terminal_5'
      ]),
      avg_enregistrement_controles: calculateCategoryAverage(surveys, [
        'enregistrement_controles_0', 'enregistrement_controles_1', 'enregistrement_controles_2',
        'enregistrement_controles_3', 'enregistrement_controles_4', 'enregistrement_controles_5',
        'enregistrement_controles_6', 'enregistrement_controles_7', 'enregistrement_controles_8'
      ]),
      avg_zones_attente: calculateCategoryAverage(surveys, [
        'zones_attente_0', 'zones_attente_1', 'zones_attente_2', 'zones_attente_3'
      ]),
      avg_services_commodites: calculateCategoryAverage(surveys, [
        'services_commodites_0', 'services_commodites_1', 'services_commodites_2',
        'services_commodites_3', 'services_commodites_4', 'services_commodites_5'
      ]),
      avg_hygiene_infrastructure: calculateCategoryAverage(surveys, [
        'hygiene_infrastructure_0', 'hygiene_infrastructure_1', 
        'hygiene_infrastructure_2', 'hygiene_infrastructure_3'
      ]),
      avg_personnel_service: calculateCategoryAverage(surveys, [
        'personnel_service_0', 'personnel_service_1'
      ])
    }];

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
          [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
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
          Survey.sequelize.literal(`(
            COALESCE((ratings->>'acces_terminal_0')::float, 0) +
            COALESCE((ratings->>'acces_terminal_1')::float, 0) +
            COALESCE((ratings->>'acces_terminal_2')::float, 0) +
            COALESCE((ratings->>'acces_terminal_3')::float, 0) +
            COALESCE((ratings->>'acces_terminal_4')::float, 0) +
            COALESCE((ratings->>'acces_terminal_5')::float, 0)
          ) / 6`)
        ), 'avg_acces_terminal'],
        [Survey.sequelize.fn('AVG', 
          Survey.sequelize.literal(`(
            COALESCE((ratings->>'services_commodites_0')::float, 0) +
            COALESCE((ratings->>'services_commodites_1')::float, 0) +
            COALESCE((ratings->>'services_commodites_2')::float, 0) +
            COALESCE((ratings->>'services_commodites_3')::float, 0) +
            COALESCE((ratings->>'services_commodites_4')::float, 0) +
            COALESCE((ratings->>'services_commodites_5')::float, 0)
          ) / 6`)
        ), 'avg_services_commodites'],
        [Survey.sequelize.fn('COUNT', Survey.sequelize.col('id')), 'count']
      ],
      where: {
        is_complete: true,
        submitted_at: {
          [Op.gte]: new Date(Date.now() - intervalDays * 24 * 60 * 60 * 1000)
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
