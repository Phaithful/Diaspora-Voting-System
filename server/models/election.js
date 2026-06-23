const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Election = sequelize.define('Election', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING(300), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  election_type: { type: DataTypes.STRING(100), defaultValue: 'Presidential' },
  start_date: { type: DataTypes.DATE, allowNull: false },
  end_date: { type: DataTypes.DATE, allowNull: false },
  status: {
    type: DataTypes.ENUM('UPCOMING', 'ACTIVE', 'CLOSED'),
    defaultValue: 'UPCOMING',
  },
}, {
  tableName: 'elections',
  underscored: true,
  timestamps: true,
});

module.exports = Election;
