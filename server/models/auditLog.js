const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  actor_id: { type: DataTypes.UUID, allowNull: true },
  actor_role: { type: DataTypes.STRING(20), allowNull: true },
  actor_name: { type: DataTypes.STRING(200), allowNull: true },
  action: { type: DataTypes.STRING(100), allowNull: false },
  target_id: { type: DataTypes.STRING(100), allowNull: true },
  target_type: { type: DataTypes.STRING(50), allowNull: true },
  metadata: { type: DataTypes.JSONB, allowNull: true, defaultValue: {} },
  ip_address: { type: DataTypes.STRING(45), allowNull: true },
  status: { type: DataTypes.STRING(20), defaultValue: 'SUCCESS' },
  timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: 'audit_logs',
  underscored: true,
  timestamps: false,
});

module.exports = AuditLog;
