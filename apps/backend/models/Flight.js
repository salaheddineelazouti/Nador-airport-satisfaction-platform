module.exports = (sequelize, DataTypes) => {
  const Flight = sequelize.define('Flight', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    airline: {
      type: DataTypes.STRING,
      allowNull: false
    },
    destination: {
      type: DataTypes.STRING,
      allowNull: false
    },
    departure_time: {
      type: DataTypes.TIME,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('scheduled', 'delayed', 'boarding', 'departed', 'cancelled'),
      defaultValue: 'scheduled'
    },
    gate: {
      type: DataTypes.STRING,
      allowNull: true
    },
    terminal: {
      type: DataTypes.STRING,
      allowNull: true
    },
    aircraft_type: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'flights',
    indexes: [
      {
        fields: ['departure_time']
      },
      {
        fields: ['status']
      }
    ]
  });

  return Flight;
};
