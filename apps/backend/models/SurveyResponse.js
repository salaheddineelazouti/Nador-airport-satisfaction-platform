module.exports = (sequelize, DataTypes) => {
  const SurveyResponse = sequelize.define('SurveyResponse', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    survey_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'surveys',
        key: 'id'
      }
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['accueil', 'securite', 'confort', 'services', 'restauration', 'boutiques', 'proprete', 'signalisation']]
      }
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      }
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'survey_responses',
    indexes: [
      {
        fields: ['survey_id']
      },
      {
        fields: ['category']
      },
      {
        fields: ['rating']
      }
    ]
  });

  return SurveyResponse;
};
