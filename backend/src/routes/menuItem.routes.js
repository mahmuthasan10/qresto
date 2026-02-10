const express = require('express');
const router = express.Router();
const menuItemController = require('../controllers/menuItem.controller');
const { authenticate } = require('../middleware/authenticate');
const multer = require('multer');

// Configure multer for memory storage (Cloudinary upload prefers buffer)
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

router.use(authenticate);

router.get('/', menuItemController.getAll);
router.post('/', menuItemController.create);
router.get('/:id', menuItemController.getById);
router.put('/:id', menuItemController.update);
router.delete('/:id', menuItemController.delete);
router.patch('/:id/toggle-availability', menuItemController.toggleAvailability);
router.patch('/:id/toggle-featured', menuItemController.toggleFeatured);

// Apply multer middleware to image upload route
router.post('/:id/image', upload.single('image'), menuItemController.uploadImage);

router.delete('/:id/image', menuItemController.deleteImage);

module.exports = router;
