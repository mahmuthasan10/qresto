const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/session.controller');

// POST /api/v1/sessions/start
router.post('/start', sessionController.start);

// GET /api/v1/sessions/:token/verify
router.get('/:token/verify', sessionController.verify);

// PATCH /api/v1/sessions/:token/extend
router.patch('/:token/extend', sessionController.extend);

// DELETE /api/v1/sessions/:token
router.delete('/:token', sessionController.end);

module.exports = router;
