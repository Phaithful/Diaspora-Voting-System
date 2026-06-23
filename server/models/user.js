const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  voter_id: { type: DataTypes.UUID, allowNull: true },
  email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING(255), allowNull: false },
  role: {
    type: DataTypes.ENUM('VOTER', 'OFFICER', 'ADMIN'),
    defaultValue: 'VOTER',
  },
  full_name: { type: DataTypes.STRING(200), allowNull: true },
  otp: { type: DataTypes.STRING(6), allowNull: true },
  otp_expires_at: { type: DataTypes.DATE, allowNull: true },
  otp_attempts: { type: DataTypes.INTEGER, defaultValue: 0 },
  otp_locked_until: { type: DataTypes.DATE, allowNull: true },
  refresh_token: { type: DataTypes.TEXT, allowNull: true },
  last_login: { type: DataTypes.DATE, allowNull: true },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'users',
  underscored: true,
  timestamps: true,
});

module.exports = User;
