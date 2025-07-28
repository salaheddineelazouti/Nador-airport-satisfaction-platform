const express = require('express');
const logger = require('../utils/logger');

const router = express.Router();

// Mock data pour les vols (à remplacer par une vraie API)
const mockFlights = [
  {
    id: 'RAM101',
    airline: 'Royal Air Maroc',
    destination: 'Casablanca',
    departure: '10:30',
    status: 'À l\'heure',
    gate: 'A12',
    terminal: '1'
  },
  {
    id: 'AF456',
    airline: 'Air France',
    destination: 'Paris CDG',
    departure: '14:15',
    status: 'Retardé',
    gate: 'B08',
    terminal: '1'
  },
  {
    id: 'LH789',
    airline: 'Lufthansa',
    destination: 'Frankfurt',
    departure: '16:45',
    status: 'Embarquement',
    gate: 'A05',
    terminal: '1'
  }
];

/**
 * @swagger
 * /api/flights/departures:
 *   get:
 *     summary: Liste des vols au départ
 *     tags: [Flights]
 *     responses:
 *       200:
 *         description: Liste des vols récupérée
 */
router.get('/departures', (req, res) => {
  try {
    logger.info('Récupération des vols au départ');
    
    // Simulation d'un délai réseau
    setTimeout(() => {
      res.json({
        success: true,
        data: {
          flights: mockFlights,
          lastUpdated: new Date().toISOString(),
          total: mockFlights.length
        }
      });
    }, 500);

  } catch (error) {
    logger.error('Erreur lors de la récupération des vols:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

/**
 * @swagger
 * /api/flights/status/{flightId}:
 *   get:
 *     summary: Statut d'un vol spécifique
 *     tags: [Flights]
 *     parameters:
 *       - in: path
 *         name: flightId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Statut du vol récupéré
 *       404:
 *         description: Vol non trouvé
 */
router.get('/status/:flightId', (req, res) => {
  try {
    const { flightId } = req.params;
    const flight = mockFlights.find(f => f.id === flightId);
    
    if (!flight) {
      return res.status(404).json({
        success: false,
        message: 'Vol non trouvé'
      });
    }

    res.json({
      success: true,
      data: flight
    });

  } catch (error) {
    logger.error('Erreur lors de la récupération du statut du vol:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

module.exports = router;
