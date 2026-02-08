const express = require('express');
const router = express.Router();
const tableController = require('../controllers/table.controller');
const { authenticate } = require('../middleware/authenticate');

router.use(authenticate);

// GET /api/v1/tables
router.get('/', tableController.getAll);

// POST /api/v1/tables
router.post('/', tableController.create);

// GET /api/v1/tables/:id
router.get('/:id', tableController.getById);

// PUT /api/v1/tables/:id
router.put('/:id', tableController.update);

// DELETE /api/v1/tables/:id
router.delete('/:id', tableController.delete);

// GET /api/v1/tables/:id/qr
router.get('/:id/qr', tableController.getQRCode);

// POST /api/v1/tables/:id/qr/regenerate
router.post('/:id/qr/regenerate', tableController.regenerateQRCode);

module.exports = router;
