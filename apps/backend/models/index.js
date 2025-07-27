const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

// Configuration de la base de données
const sequelize = new Sequelize(
  process.env.DB_NAME || 'nador_airport_satisfaction',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    }
  }
);

// Import des modèles
const Survey = require('./Survey')(sequelize, Sequelize.DataTypes);
const SurveyResponse = require('./SurveyResponse')(sequelize, Sequelize.DataTypes);
const Flight = require('./Flight')(sequelize, Sequelize.DataTypes);
const Analytics = require('./Analytics')(sequelize, Sequelize.DataTypes);
const Admin = require('./Admin')(sequelize, Sequelize.DataTypes);

// Définition des associations
Survey.hasMany(SurveyResponse, {
  foreignKey: 'survey_id',
  as: 'responses'
});

SurveyResponse.belongsTo(Survey, {
  foreignKey: 'survey_id',
  as: 'survey'
});

// Export des modèles et de la connexion
module.exports = {
  sequelize,
  Sequelize,
  Survey,
  SurveyResponse,
  Flight,
  Analytics,
  Admin
};
