const express = require('express');
const { Survey } = require('../models');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * @swagger
 * /api/admin/reports:
 *   get:
 *     summary: Rapports détaillés pour l'administration
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Rapports récupérés
 */
router.get('/reports', async (req, res) => {
  try {
    const { startDate, endDate, language } = req.query;
    
    let whereClause = { is_complete: true };
    
    // Filtres de date
    if (startDate || endDate) {
      whereClause.submitted_at = {};
      if (startDate) whereClause.submitted_at[Survey.sequelize.Op.gte] = new Date(startDate);
      if (endDate) whereClause.submitted_at[Survey.sequelize.Op.lte] = new Date(endDate);
    }
    
    // Filtre de langue
    if (language) {
      whereClause.language = language;
    }

    const surveys = await Survey.findAll({
      where: whereClause,
      attributes: { exclude: ['ip_address', 'user_agent'] },
      order: [['submitted_at', 'DESC']],
      limit: 100
    });

    res.json({
      success: true,
      data: {
        surveys,
        total: surveys.length,
        filters: { startDate, endDate, language }
      }
    });

  } catch (error) {
    logger.error('Erreur lors de la génération des rapports:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

/**
 * @swagger
 * /api/admin/export:
 *   post:
 *     summary: Exporter les données d'enquête
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               format:
 *                 type: string
 *                 enum: [json, csv]
 *               filters:
 *                 type: object
 *     responses:
 *       200:
 *         description: Export généré
 */
router.post('/export', async (req, res) => {
  try {
    const { format = 'json', filters = {} } = req.body;
    
    let whereClause = { is_complete: true };
    
    // Appliquer les filtres
    if (filters.startDate || filters.endDate) {
      whereClause.submitted_at = {};
      if (filters.startDate) whereClause.submitted_at[Survey.sequelize.Op.gte] = new Date(filters.startDate);
      if (filters.endDate) whereClause.submitted_at[Survey.sequelize.Op.lte] = new Date(filters.endDate);
    }
    
    if (filters.language) {
      whereClause.language = filters.language;
    }

    const surveys = await Survey.findAll({
      where: whereClause,
      order: [['submitted_at', 'DESC']]
    });

    if (format === 'csv') {
      // Génération CSV simple
      const csvHeaders = 'ID,Language,Age,Nationality,Travel Purpose,Frequency,Submitted At\n';
      const csvData = surveys.map(survey => 
        `${survey.id},${survey.language},${survey.age_range || ''},${survey.nationality || ''},${survey.travel_purpose || ''},${survey.frequency || ''},${survey.submitted_at}`
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=survey-export.csv');
      res.send(csvHeaders + csvData);
    } else {
      res.json({
        success: true,
        data: {
          surveys,
          exportedAt: new Date().toISOString(),
          total: surveys.length
        }
      });
    }

  } catch (error) {
    logger.error('Erreur lors de l\'export:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

module.exports = router;
