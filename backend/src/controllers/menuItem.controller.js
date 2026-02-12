const prisma = require('../config/database');
const Joi = require('joi');
const ImageService = require('../services/image.service');

const menuItemSchema = Joi.object({
    categoryId: Joi.number().integer().optional().allow(null),
    name: Joi.string().min(1).max(255).required(),
    nameEn: Joi.string().max(255).optional().allow(''),
    description: Joi.string().optional().allow(''),
    descriptionEn: Joi.string().optional().allow(''),
    price: Joi.number().positive().required(),
    isAvailable: Joi.boolean().optional(),
    isFeatured: Joi.boolean().optional(),
    allergens: Joi.array().items(Joi.string()).optional(),
    dietaryInfo: Joi.array().items(Joi.string()).optional(),
    preparationTime: Joi.number().integer().min(0).optional().allow(null)
});

exports.getAll = async (req, res, next) => {
    try {
        const { categoryId, available, featured } = req.query;

        const where = { restaurantId: req.restaurantId };
        if (categoryId) where.categoryId = parseInt(categoryId);
        if (available === 'true') where.isAvailable = true;
        if (featured === 'true') where.isFeatured = true;

        const menuItems = await prisma.menuItem.findMany({
            where,
            include: { category: { select: { id: true, name: true } } },
            orderBy: [{ categoryId: 'asc' }, { displayOrder: 'asc' }]
        });

        res.json({ menuItems });
    } catch (error) {
        next(error);
    }
};

exports.create = async (req, res, next) => {
    try {
        const { error, value } = menuItemSchema.validate(req.body);
        if (error) {
            error.isJoi = true;
            throw error;
        }

        // Verify category belongs to restaurant
        if (value.categoryId) {
            const category = await prisma.category.findFirst({
                where: { id: value.categoryId, restaurantId: req.restaurantId }
            });
            if (!category) {
                return res.status(400).json({ error: 'Geçersiz kategori' });
            }
        }

        const maxOrder = await prisma.menuItem.aggregate({
            where: { restaurantId: req.restaurantId, categoryId: value.categoryId || null },
            _max: { displayOrder: true }
        });

        const menuItem = await prisma.menuItem.create({
            data: {
                ...value,
                restaurantId: req.restaurantId,
                displayOrder: (maxOrder._max.displayOrder || 0) + 1
            },
            include: { category: { select: { id: true, name: true } } }
        });

        res.status(201).json({ menuItem });
    } catch (error) {
        next(error);
    }
};

exports.getById = async (req, res, next) => {
    try {
        const menuItem = await prisma.menuItem.findFirst({
            where: { id: parseInt(req.params.id), restaurantId: req.restaurantId },
            include: { category: { select: { id: true, name: true } } }
        });

        if (!menuItem) {
            return res.status(404).json({ error: 'Ürün bulunamadı' });
        }

        res.json({ menuItem });
    } catch (error) {
        next(error);
    }
};

exports.update = async (req, res, next) => {
    try {
        const { error, value } = menuItemSchema.validate(req.body);
        if (error) {
            error.isJoi = true;
            throw error;
        }

        if (value.categoryId) {
            const category = await prisma.category.findFirst({
                where: { id: value.categoryId, restaurantId: req.restaurantId }
            });
            if (!category) {
                return res.status(400).json({ error: 'Geçersiz kategori' });
            }
        }

        const result = await prisma.menuItem.updateMany({
            where: { id: parseInt(req.params.id), restaurantId: req.restaurantId },
            data: value
        });

        if (result.count === 0) {
            return res.status(404).json({ error: 'Ürün bulunamadı' });
        }

        const menuItem = await prisma.menuItem.findUnique({
            where: { id: parseInt(req.params.id) },
            include: { category: { select: { id: true, name: true } } }
        });

        res.json({ menuItem });
    } catch (error) {
        next(error);
    }
};

exports.delete = async (req, res, next) => {
    try {
        const deleted = await prisma.menuItem.deleteMany({
            where: { id: parseInt(req.params.id), restaurantId: req.restaurantId }
        });

        if (deleted.count === 0) {
            return res.status(404).json({ error: 'Ürün bulunamadı' });
        }

        res.json({ message: 'Ürün silindi' });
    } catch (error) {
        next(error);
    }
};

exports.toggleAvailability = async (req, res, next) => {
    try {
        const menuItem = await prisma.menuItem.findFirst({
            where: { id: parseInt(req.params.id), restaurantId: req.restaurantId }
        });

        if (!menuItem) {
            return res.status(404).json({ error: 'Ürün bulunamadı' });
        }

        const updated = await prisma.menuItem.update({
            where: { id: menuItem.id },
            data: { isAvailable: !menuItem.isAvailable }
        });

        // Emit menu update event
        const io = req.app.get('io');
        io.to(`restaurant_${req.restaurantId}`).emit('menu_updated', { type: 'availability', itemId: menuItem.id });

        res.json({ menuItem: updated });
    } catch (error) {
        next(error);
    }
};

exports.toggleFeatured = async (req, res, next) => {
    try {
        const menuItem = await prisma.menuItem.findFirst({
            where: { id: parseInt(req.params.id), restaurantId: req.restaurantId }
        });

        if (!menuItem) {
            return res.status(404).json({ error: 'Ürün bulunamadı' });
        }

        const updated = await prisma.menuItem.update({
            where: { id: menuItem.id },
            data: { isFeatured: !menuItem.isFeatured }
        });

        res.json({ menuItem: updated });
    } catch (error) {
        next(error);
    }
};



// ... existing imports ...

// ... inside handler ...

exports.uploadImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Lütfen bir resim dosyası yükleyin' });
        }

        const menuItem = await prisma.menuItem.findFirst({
            where: { id: parseInt(req.params.id), restaurantId: req.restaurantId }
        });

        if (!menuItem) {
            return res.status(404).json({ error: 'Ürün bulunamadı' });
        }

        // Upload to Cloudflare R2
        const imageUrl = await ImageService.uploadImage(req.file.buffer, `restaurants/${req.restaurantId}/menu`);

        // If there was an old image, try to delete it
        if (menuItem.imageUrl) {
            await ImageService.deleteImage(menuItem.imageUrl);
        }

        // Update database
        const updated = await prisma.menuItem.update({
            where: { id: menuItem.id },
            data: { imageUrl }
        });

        res.json({
            message: 'Resim başarıyla yüklendi',
            imageUrl: updated.imageUrl
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteImage = async (req, res, next) => {
    try {
        const menuItem = await prisma.menuItem.findFirst({
            where: { id: parseInt(req.params.id), restaurantId: req.restaurantId }
        });

        if (!menuItem) {
            return res.status(404).json({ error: 'Ürün bulunamadı' });
        }

        if (menuItem.imageUrl) {
            await ImageService.deleteImage(menuItem.imageUrl);
        }

        await prisma.menuItem.update({
            where: { id: menuItem.id },
            data: { imageUrl: null }
        });

        res.json({ message: 'Görsel silindi' });
    } catch (error) {
        next(error);
    }
};
