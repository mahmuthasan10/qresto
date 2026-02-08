const prisma = require('../config/database');
const Joi = require('joi');

const categorySchema = Joi.object({
    name: Joi.string().min(1).max(100).required(),
    nameEn: Joi.string().max(100).optional().allow(''),
    icon: Joi.string().max(50).optional().allow(''),
    isActive: Joi.boolean().optional()
});

exports.getAll = async (req, res, next) => {
    try {
        const categories = await prisma.category.findMany({
            where: { restaurantId: req.restaurantId },
            include: {
                _count: { select: { menuItems: true } }
            },
            orderBy: { displayOrder: 'asc' }
        });

        res.json({ categories });
    } catch (error) {
        next(error);
    }
};

exports.create = async (req, res, next) => {
    try {
        const { error, value } = categorySchema.validate(req.body);
        if (error) {
            error.isJoi = true;
            throw error;
        }

        // Get max display order
        const maxOrder = await prisma.category.aggregate({
            where: { restaurantId: req.restaurantId },
            _max: { displayOrder: true }
        });

        const category = await prisma.category.create({
            data: {
                ...value,
                restaurantId: req.restaurantId,
                displayOrder: (maxOrder._max.displayOrder || 0) + 1
            }
        });

        res.status(201).json({ category });
    } catch (error) {
        next(error);
    }
};

exports.getById = async (req, res, next) => {
    try {
        const category = await prisma.category.findFirst({
            where: {
                id: parseInt(req.params.id),
                restaurantId: req.restaurantId
            },
            include: {
                menuItems: {
                    orderBy: { displayOrder: 'asc' }
                }
            }
        });

        if (!category) {
            return res.status(404).json({ error: 'Kategori bulunamadı' });
        }

        res.json({ category });
    } catch (error) {
        next(error);
    }
};

exports.update = async (req, res, next) => {
    try {
        const { error, value } = categorySchema.validate(req.body);
        if (error) {
            error.isJoi = true;
            throw error;
        }

        const category = await prisma.category.updateMany({
            where: {
                id: parseInt(req.params.id),
                restaurantId: req.restaurantId
            },
            data: value
        });

        if (category.count === 0) {
            return res.status(404).json({ error: 'Kategori bulunamadı' });
        }

        const updated = await prisma.category.findUnique({
            where: { id: parseInt(req.params.id) }
        });

        res.json({ category: updated });
    } catch (error) {
        next(error);
    }
};

exports.delete = async (req, res, next) => {
    try {
        const deleted = await prisma.category.deleteMany({
            where: {
                id: parseInt(req.params.id),
                restaurantId: req.restaurantId
            }
        });

        if (deleted.count === 0) {
            return res.status(404).json({ error: 'Kategori bulunamadı' });
        }

        res.json({ message: 'Kategori silindi' });
    } catch (error) {
        next(error);
    }
};

exports.reorder = async (req, res, next) => {
    try {
        const { orders } = req.body; // [{ id: 1, displayOrder: 0 }, ...]

        if (!Array.isArray(orders)) {
            return res.status(400).json({ error: 'Geçersiz sıralama verisi' });
        }

        await prisma.$transaction(
            orders.map(item =>
                prisma.category.updateMany({
                    where: {
                        id: item.id,
                        restaurantId: req.restaurantId
                    },
                    data: { displayOrder: item.displayOrder }
                })
            )
        );

        const categories = await prisma.category.findMany({
            where: { restaurantId: req.restaurantId },
            orderBy: { displayOrder: 'asc' }
        });

        res.json({ categories });
    } catch (error) {
        next(error);
    }
};
