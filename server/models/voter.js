const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Voter = sequelize.define('Voter', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  nin: { type: DataTypes.STRING(11), allowNull: false, unique: true },
  pvc_number: { type: DataTypes.STRING(20), allowNull: false, unique: true },
  full_name: { type: DataTypes.STRING(200), allowNull: false },
  email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
  passport_no: { type: DataTypes.STRING(20), allowNull: true },
  date_of_birth: { type: DataTypes.DATEONLY, allowNull: true },
  country_of_residence: { type: DataTypes.STRING(100), allowNull: false },
  polling_unit_id: { type: DataTypes.UUID, allowNull: true },
  status: {
    type: DataTypes.ENUM('REGISTERED', 'ACCREDITED', 'VOTED', 'SUSPENDED'),
    defaultValue: 'REGISTERED',
  },
}, {
  tableName: 'voters',
  underscored: true,
  timestamps: true,
});

module.exports = Voter;
