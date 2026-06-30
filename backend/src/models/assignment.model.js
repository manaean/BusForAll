const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Assignment = sequelize.define('Assignment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  driverId: { type: DataTypes.INTEGER, allowNull: false },
  busId: { type: DataTypes.INTEGER, allowNull: false },
  routeId: { type: DataTypes.INTEGER, allowNull: false },
  assignmentDate: { type: DataTypes.DATEONLY, allowNull: false }
}, {
  tableName: 'assignments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    { fields: ['driver_id', 'assignment_date'] },
    { fields: ['bus_id'] },
    { fields: ['route_id'] }
  ]
});

module.exports = Assignment;
