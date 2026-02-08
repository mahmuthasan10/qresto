const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { authenticate } = require('../middleware/authenticate');

router.use(authenticate);

// GET /api/v1/orders
router.get('/', orderController.getAll);

// GET /api/v1/orders/active
router.get('/active', orderController.getActive);

// GET /api/v1/orders/history
router.get('/history', orderController.getHistory);

// POST /api/v1/orders
router.post('/', orderController.create);

// GET /api/v1/orders/:id
router.get('/:id', orderController.getById);

// PATCH /api/v1/orders/:id/status
router.patch('/:id/status', orderController.updateStatus);

// DELETE /api/v1/orders/:id
router.delete('/:id', orderController.cancel);

module.exports = router;
