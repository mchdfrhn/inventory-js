const express = require('express');
const assetRoutes = require('./assetRoutes');
const categoryRoutes = require('./categoryRoutes');
const locationRoutes = require('./locationRoutes');
const auditLogRoutes = require('./auditLogRoutes');

const router = express.Router();

// API v1 routes
router.use('/v1/assets', assetRoutes);
router.use('/v1/categories', categoryRoutes);
router.use('/v1/locations', locationRoutes);
router.use('/v1/audit-logs', auditLogRoutes);

module.exports = router;
