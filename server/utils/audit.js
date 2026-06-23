const { AuditLog } = require('../models');

const log = async (req, action, options = {}) => {
  try {
    await AuditLog.create({
      actor_id: req.user?.id || null,
      actor_role: req.user?.role || 'ANONYMOUS',
      actor_name: req.user?.full_name || req.user?.email || null,
      action,
      target_id: options.targetId || null,
      target_type: options.targetType || null,
      metadata: options.metadata || {},
      ip_address: req.ip || req.connection?.remoteAddress || null,
      status: options.status || 'SUCCESS',
    });
  } catch (err) {
    console.error('[AuditLog] Failed to write:', err.message);
  }
};

module.exports = { log };
