const express = require('express');
const router = express.Router();
const publicController = require('../controllers/public.controller');

// GET /api/v1/public/menu/:tableQR - QR ile menü görüntüleme
router.get('/menu/:tableQR', publicController.getMenuByQR);

// GET /api/v1/public/restaurant/:slug - Restaurant bilgisi
router.get('/restaurant/:slug', publicController.getRestaurantBySlug);

// POST /api/v1/public/orders - Müşteri sipariş oluşturma
router.post('/orders', publicController.createOrder);

// GET /api/v1/public/orders/:orderNumber - Sipariş takibi
router.get('/orders/:orderNumber', publicController.getOrderStatus);

// POST /api/v1/public/location/verify - Lokasyon doğrulama
router.post('/location/verify', publicController.verifyLocation);

module.exports = router;
