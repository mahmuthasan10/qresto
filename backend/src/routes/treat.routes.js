const express = require('express');
const router = express.Router();
const treatController = require('../controllers/treat.controller');
const { authenticate } = require('../middleware/authenticate');

// Public routes (for customer)
router.post('/', treatController.createTreat);
router.get('/active-tables', treatController.getActiveTables);

// Admin routes (protected)
router.use(authenticate);
router.get('/', treatController.getAllTreats);
router.patch('/:id/status', treatController.updateStatus);

module.exports = router;
