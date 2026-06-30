const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Delay = sequelize.define('Delay', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  routeId: { type: DataTypes.INTEGER, allowNull: false },
  delayMinutes: { type: DataTypes.INTEGER, allowNull: false },
  reason: { type: DataTypes.STRING(255), allowNull: true },
  isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
}, {
  tableName: 'delays',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    { fields: ['route_id', 'is_active'] }
  ]
});

module.exports = Delay;
