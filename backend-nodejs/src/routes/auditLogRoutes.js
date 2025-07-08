const express = require('express');
const AuditLogController = require('../controllers/AuditLogController');
const validate = require('../middlewares/validate');
const { auditLogFilterSchema } = require('../validations/schemas');

const router = express.Router();
const auditLogController = new AuditLogController();

// Get activity history for specific entity
router.get(
  '/history/:entityType/:entityId',
  auditLogController.getActivityHistory.bind(auditLogController)
);

// Get activity logs with filtering
router.get(
  '/',
  validate(auditLogFilterSchema, 'query'),
  auditLogController.getActivityLogs.bind(auditLogController)
);

// Cleanup old logs (admin endpoint)
router.post(
  '/cleanup',
  auditLogController.cleanupOldLogs.bind(auditLogController)
);

module.exports = router;
