const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Candidate = sequelize.define('Candidate', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  election_id: { type: DataTypes.UUID, allowNull: false },
  full_name: { type: DataTypes.STRING(200), allowNull: false },
  party: { type: DataTypes.STRING(200), allowNull: false },
  party_acronym: { type: DataTypes.STRING(20), allowNull: false },
  photo_url: { type: DataTypes.STRING(500), allowNull: true },
  manifesto_url: { type: DataTypes.STRING(500), allowNull: true },
  bio: { type: DataTypes.TEXT, allowNull: true },
  position: { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
  tableName: 'candidates',
  underscored: true,
  timestamps: true,
});

module.exports = Candidate;
