const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PollingUnit = sequelize.define('PollingUnit', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING(300), allowNull: false },
  country: { type: DataTypes.STRING(100), allowNull: false },
  city: { type: DataTypes.STRING(100), allowNull: false },
  address: { type: DataTypes.TEXT, allowNull: true },
  officer_id: { type: DataTypes.UUID, allowNull: true },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'polling_units',
  underscored: true,
  timestamps: true,
});

module.exports = PollingUnit;
