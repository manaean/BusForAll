const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RouteStop = sequelize.define('RouteStop', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  routeId: { type: DataTypes.INTEGER, allowNull: false },
  stopId: { type: DataTypes.INTEGER, allowNull: false },
  stopOrder: { type: DataTypes.INTEGER, allowNull: false }
}, {
  tableName: 'route_stops',
  timestamps: false,
  indexes: [
    { unique: true, fields: ['route_id', 'stop_order'] },
    { fields: ['route_id'] },
    { fields: ['stop_id'] }
  ]
});

module.exports = RouteStop;
