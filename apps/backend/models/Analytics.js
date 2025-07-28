module.exports = (sequelize, DataTypes) => {
  const Analytics = sequelize.define('Analytics', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    metric_type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['daily_surveys', 'average_rating', 'category_breakdown', 'language_distribution']]
      }
    },
    metric_value: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    calculated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'analytics',
    indexes: [
      {
        fields: ['date', 'metric_type'],
        unique: true
      },
      {
        fields: ['metric_type']
      }
    ]
  });

  return Analytics;
};
