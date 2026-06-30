const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BusTracking = sequelize.define('BusTracking', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  routeId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  busId: { type: DataTypes.INTEGER, allowNull: true },
  progress: { type: DataTypes.DECIMAL(5, 4), allowNull: false, defaultValue: 0.0 },
  currentStopId: { type: DataTypes.INTEGER, allowNull: true },
  isRunning: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  lastUpdated: { type: DataTypes.DATE, allowNull: true }
}, {
  tableName: 'bus_tracking',
  timestamps: false,
  indexes: [
    { unique: true, fields: ['route_id'] },
    { fields: ['is_running'] }
  ]
});

module.exports = BusTracking;
