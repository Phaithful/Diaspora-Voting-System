const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Ballot = sequelize.define('Ballot', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  election_id: { type: DataTypes.UUID, allowNull: false },
  candidate_id: { type: DataTypes.UUID, allowNull: false },
  polling_unit_id: { type: DataTypes.UUID, allowNull: false },
  vote_token: { type: DataTypes.STRING(128), allowNull: false, unique: true },
  cast_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: 'ballots',
  underscored: true,
  timestamps: true,
  // No voter_id — vote anonymity is preserved by design
});

module.exports = Ballot;
