const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurant.controller');
const { authenticate } = require('../middleware/authenticate');

// All routes require authentication
router.use(authenticate);

// GET /api/v1/restaurant/profile
router.get('/profile', restaurantController.getProfile);

// PUT /api/v1/restaurant/profile
router.put('/profile', restaurantController.updateProfile);

// PATCH /api/v1/restaurant/location
router.patch('/location', restaurantController.updateLocation);

// PATCH /api/v1/restaurant/settings
router.patch('/settings', restaurantController.updateSettings);

// GET /api/v1/restaurant/stats
router.get('/stats', restaurantController.getStats);

// GET /api/v1/restaurant/stats/daily
router.get('/stats/daily', restaurantController.getDailyStats);

module.exports = router;
