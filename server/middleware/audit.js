const AuditLog = require('../models/AuditLog');

/**
 * Middleware factory to log an action.
 * Must be placed after the auth middleware so req.user exists.
 * @param {String} action The enum action name to log
 */
const logAction = (action) => {
  return async (req, res, next) => {
    // We capture the original res.send to log only on success
    const originalSend = res.send;

    res.send = function (data) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Save audit asynchronously to not block the response
        AuditLog.create({
          action,
          user: req.user ? req.user._id : null,
          details: `Action executed on route: ${req.originalUrl}`,
          ipAddress: req.ip || req.connection.remoteAddress
        }).catch(err => console.error('Audit Log Error:', err));
      }
      originalSend.apply(res, arguments);
    };

    next();
  };
};

module.exports = { logAction };
