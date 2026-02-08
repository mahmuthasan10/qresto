const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { authenticate } = require('../middleware/authenticate');

router.use(authenticate);

// GET /api/v1/categories
router.get('/', categoryController.getAll);

// POST /api/v1/categories
router.post('/', categoryController.create);

// GET /api/v1/categories/:id
router.get('/:id', categoryController.getById);

// PUT /api/v1/categories/:id
router.put('/:id', categoryController.update);

// DELETE /api/v1/categories/:id
router.delete('/:id', categoryController.delete);

// PATCH /api/v1/categories/reorder
router.patch('/reorder', categoryController.reorder);

module.exports = router;
