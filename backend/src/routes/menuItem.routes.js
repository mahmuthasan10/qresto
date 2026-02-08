const express = require('express');
const router = express.Router();
const menuItemController = require('../controllers/menuItem.controller');
const { authenticate } = require('../middleware/authenticate');

router.use(authenticate);

// GET /api/v1/menu-items
router.get('/', menuItemController.getAll);

// POST /api/v1/menu-items
router.post('/', menuItemController.create);

// GET /api/v1/menu-items/:id
router.get('/:id', menuItemController.getById);

// PUT /api/v1/menu-items/:id
router.put('/:id', menuItemController.update);

// DELETE /api/v1/menu-items/:id
router.delete('/:id', menuItemController.delete);

// PATCH /api/v1/menu-items/:id/toggle-availability
router.patch('/:id/toggle-availability', menuItemController.toggleAvailability);

// PATCH /api/v1/menu-items/:id/toggle-featured
router.patch('/:id/toggle-featured', menuItemController.toggleFeatured);

// POST /api/v1/menu-items/:id/image
router.post('/:id/image', menuItemController.uploadImage);

// DELETE /api/v1/menu-items/:id/image  
router.delete('/:id/image', menuItemController.deleteImage);

module.exports = router;
