const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Schedule = sequelize.define('Schedule', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  routeId: { type: DataTypes.INTEGER, allowNull: false },
  departureTime: { type: DataTypes.TIME, allowNull: false },
  arrivalTime: { type: DataTypes.TIME, allowNull: false },
  days: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'Mon,Tue,Wed,Thu,Fri' }
}, {
  tableName: 'schedules',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [{ fields: ['route_id'] }]
});

module.exports = Schedule;
