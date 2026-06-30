const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Favourite = sequelize.define('Favourite', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  routeId: { type: DataTypes.INTEGER, allowNull: false }
}, {
  tableName: 'favourites',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    { unique: true, fields: ['user_id', 'route_id'] },
    { fields: ['user_id'] }
  ]
});

module.exports = Favourite;
