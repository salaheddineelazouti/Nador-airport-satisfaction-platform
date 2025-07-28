const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const winston = require('winston');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

// Import des routes
const surveyRoutes = require('./routes/surveyRoutes');
const flightRoutes = require('./routes/flightRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Import des middlewares
const { errorHandler } = require('./middleware/errorHandler');
const { requestLogger } = require('./middleware/logger');

// Configuration
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Configuration du logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Configuration Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Nador Airport Satisfaction API',
      version: '1.0.0',
      description: 'API pour la plateforme de satisfaction de l\'aéroport de Nador'
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Serveur de développement'
      }
    ]
  },
  apis: ['./routes/*.js']
};

const specs = swaggerJsdoc(swaggerOptions);

// Middlewares de sécurité
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://192.168.1.84:3000',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite de 100 requêtes par fenêtre
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.',
  standardHeaders: true,
  legacyHeaders: false
});

app.use(limiter);

// Middlewares d'application
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Documentation API
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use('/api/surveys', surveyRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);

// Route racine - GET
app.get('/', (req, res) => {
  res.json({
    message: 'Nador Airport Satisfaction API',
    version: '1.0.0',
    endpoints: {
      surveys: '/api/surveys',
      flights: '/api/flights',
      analytics: '/api/analytics',
      health: '/health',
      docs: '/api-docs'
    }
  });
});

// Route racine - POST (pour déboguer les requêtes mal dirigées)
app.post('/', (req, res) => {
  console.log(' ALERTE: Requête POST reçue sur la route racine /');
  console.log(' Headers:', req.headers);
  console.log(' Body:', req.body);
  console.log(' URL originale:', req.originalUrl);
  console.log(' URL:', req.url);
  
  res.status(400).json({
    error: 'Requête mal dirigée',
    message: 'Cette requête devrait être envoyée vers /api/surveys',
    correctEndpoint: '/api/surveys',
    receivedUrl: req.url,
    method: req.method
  });
});

// Route de santé
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Middleware de gestion d'erreurs
app.use(errorHandler);

// Gestion des routes non trouvées
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée'
  });
});

// Initialisation de la base de données
const { sequelize } = require('./models');

async function startServer() {
  try {
    // Test de la connexion à la base de données
    await sequelize.authenticate();
    logger.info('Connexion à la base de données établie avec succès.');

    // Synchronisation des modèles
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      logger.info('Modèles synchronisés avec la base de données.');
    }

    // Démarrage du serveur
    app.listen(PORT, () => {
      logger.info(`Serveur démarré sur le port ${PORT}`);
      logger.info(`Documentation API disponible sur http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    logger.error('Impossible de démarrer le serveur:', error);
    process.exit(1);
  }
}

// Gestion propre de l'arrêt du serveur
process.on('SIGTERM', async () => {
  logger.info('SIGTERM reçu, arrêt gracieux du serveur...');
  await sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT reçu, arrêt gracieux du serveur...');
  await sequelize.close();
  process.exit(0);
});

startServer();

module.exports = app;
