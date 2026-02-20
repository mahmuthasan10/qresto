const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { authenticate } = require('../middleware/authenticate');

// All routes require authentication
router.use(authenticate);

// GET /api/v1/analytics/summary?period=7
router.get('/summary', analyticsController.getSummary);

// GET /api/v1/analytics/daily?period=7
router.get('/daily', analyticsController.getDailyTrend);

// GET /api/v1/analytics/top-items?period=7&limit=5
router.get('/top-items', analyticsController.getTopItems);

// GET /api/v1/analytics/status-distribution?period=7
router.get('/status-distribution', analyticsController.getStatusDistribution);

module.exports = router;
