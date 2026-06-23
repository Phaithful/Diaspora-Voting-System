const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Incident = sequelize.define('Incident', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  officer_id: { type: DataTypes.UUID, allowNull: false },
  polling_unit_id: { type: DataTypes.UUID, allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: false },
  incident_type: { type: DataTypes.STRING(100), defaultValue: 'General' },
  status: {
    type: DataTypes.ENUM('OPEN', 'RESOLVED'),
    defaultValue: 'OPEN',
  },
  resolved_at: { type: DataTypes.DATE, allowNull: true },
  resolution_notes: { type: DataTypes.TEXT, allowNull: true },
}, {
  tableName: 'incidents',
  underscored: true,
  timestamps: true,
});

module.exports = Incident;
