const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Bus = sequelize.define('Bus', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  plateNumber: { type: DataTypes.STRING(20), allowNull: false, unique: true },
  capacity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 50 },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'maintenance'),
    allowNull: false,
    defaultValue: 'active'
  }
}, {
  tableName: 'buses',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    { unique: true, fields: ['plate_number'] },
    { fields: ['status'] }
  ]
});

module.exports = Bus;
