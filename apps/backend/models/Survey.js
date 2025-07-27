module.exports = (sequelize, DataTypes) => {
  const Survey = sequelize.define('Survey', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    session_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: 'Identifiant unique de session pour éviter les doublons'
    },
    language: {
      type: DataTypes.ENUM('fr', 'ar', 'en'),
      allowNull: false,
      defaultValue: 'fr'
    },
    // Informations personnelles
    age_range: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isIn: [['18-25', '26-35', '36-45', '46-55', '56-65', '65+']]
      }
    },
    nationality: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [2, 100]
      }
    },
    travel_purpose: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isIn: [['business', 'leisure', 'transit', 'other']]
      }
    },
    frequency: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isIn: [['first-time', 'occasional', 'regular', 'frequent']]
      }
    },
    // Évaluations par catégorie
    ratings: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
      comment: 'Notations par catégorie (1-5 étoiles)'
    },
    comments: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      comment: 'Commentaires par catégorie'
    },
    // Métadonnées
    ip_address: {
      type: DataTypes.INET,
      allowNull: true
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    completion_time: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Temps de completion en secondes'
    },
    is_complete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    submitted_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'surveys',
    indexes: [
      {
        fields: ['session_id']
      },
      {
        fields: ['submitted_at']
      },
      {
        fields: ['language']
      },
      {
        fields: ['is_complete']
      }
    ],
    hooks: {
      beforeCreate: (survey) => {
        if (survey.is_complete && !survey.submitted_at) {
          survey.submitted_at = new Date();
        }
      },
      beforeUpdate: (survey) => {
        if (survey.changed('is_complete') && survey.is_complete && !survey.submitted_at) {
          survey.submitted_at = new Date();
        }
      }
    }
  });

  return Survey;
};
