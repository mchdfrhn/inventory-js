const express = require('express');
const assetRoutes = require('./assetRoutes');
const categoryRoutes = require('./categoryRoutes');
const locationRoutes = require('./locationRoutes');
const auditLogRoutes = require('./auditLogRoutes');

const router = express.Router();

// API routes
router.use('/assets', assetRoutes);
router.use('/categories', categoryRoutes);
router.use('/locations', locationRoutes);
router.use('/audit-logs', auditLogRoutes);

module.exports = router;
