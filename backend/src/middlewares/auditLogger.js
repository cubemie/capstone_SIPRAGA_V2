// backend/src/middlewares/auditLogger.js

const pool = require('../config/db');

/**
 * Simple audit middleware — log setiap request superadmin (non-factory).
 * Digunakan langsung di route array: [...guard, handler]
 */
const auditLogger = async (req, res, next) => {
  const originalJson = res.json.bind(res);

  res.json = async (body) => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      try {
        const user = req.user || req.rtRwUser;
        if (user) {
          const actorId   = user.id_warga || user.id;
          const actorRole = user.role;
          const actorName = user.nama || user.username || '';
          const action    = `${req.method} ${req.path}`;
          const targetId  = req.params?.id || req.params?.rw_id || null;

          await pool.query(
            `INSERT INTO system_logs
               (actor_id, actor_role, actor_name, action, target_type, target_id, ip_address)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [actorId, actorRole, actorName, action, 'superadmin', targetId,
             req.ip || req.connection?.remoteAddress]
          );
        }
      } catch (err) {
        console.error('[AuditLog]', err.message);
      }
    }
    return originalJson(body);
  };

  next();
};

/**
 * Factory versi — buat middleware audit dengan action & target type spesifik.
 * @param {string} action - nama action (e.g. 'APPROVE_LETTER')
 * @param {string} targetType - tipe target (e.g. 'letter')
 * @param {Function} getTargetId - fungsi (req) => string id
 */
const createAuditLog = (action, targetType, getTargetId = () => null) => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = async (body) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          const user = req.user || req.rtRwUser;
          if (user) {
            const actorId   = user.id_warga || user.id;
            const actorRole = user.role;
            const actorName = user.nama || user.username || '';
            const targetId  = getTargetId(req);

            await pool.query(
              `INSERT INTO system_logs
                 (actor_id, actor_role, actor_name, action, target_type, target_id, ip_address)
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [actorId, actorRole, actorName, action, targetType, targetId,
               req.ip || req.connection?.remoteAddress]
            );
          }
        } catch (err) {
          console.error('[AuditLog]', err.message);
        }
      }
      return originalJson(body);
    };

    next();
  };
};

module.exports = auditLogger;
module.exports.createAuditLog = createAuditLog;