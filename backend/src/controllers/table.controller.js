const prisma = require('../config/database');
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');

const tableSchema = Joi.object({
    tableNumber: Joi.string().min(1).max(20).required(),
    tableName: Joi.string().max(100).optional().allow(''),
    capacity: Joi.number().integer().min(1).optional().allow(null)
});

const generateQRCode = (restaurantId, tableId) => {
    return `qr_${restaurantId}_${tableId}_${uuidv4().slice(0, 8)}`;
};

exports.getAll = async (req, res, next) => {
    try {
        const tables = await prisma.table.findMany({
            where: { restaurantId: req.restaurantId },
            include: {
                sessions: {
                    where: { isActive: true, expiresAt: { gt: new Date() } },
                    select: { id: true, expiresAt: true }
                }
            },
            orderBy: { tableNumber: 'asc' }
        });

        res.json({ tables });
    } catch (error) {
        next(error);
    }
};

exports.create = async (req, res, next) => {
    try {
        const { error, value } = tableSchema.validate(req.body);
        if (error) {
            error.isJoi = true;
            throw error;
        }

        // Generate unique QR code
        const tempId = Date.now();
        const qrCode = generateQRCode(req.restaurantId, tempId);

        const table = await prisma.table.create({
            data: {
                ...value,
                restaurantId: req.restaurantId,
                qrCode
            }
        });

        // Update QR with actual ID
        const updatedTable = await prisma.table.update({
            where: { id: table.id },
            data: { qrCode: generateQRCode(req.restaurantId, table.id) }
        });

        res.status(201).json({ table: updatedTable });
    } catch (error) {
        next(error);
    }
};

exports.getById = async (req, res, next) => {
    try {
        const table = await prisma.table.findFirst({
            where: { id: parseInt(req.params.id), restaurantId: req.restaurantId },
            include: {
                sessions: {
                    where: { isActive: true },
                    orderBy: { startedAt: 'desc' },
                    take: 1
                }
            }
        });

        if (!table) {
            return res.status(404).json({ error: 'Masa bulunamadı' });
        }

        res.json({ table });
    } catch (error) {
        next(error);
    }
};

exports.update = async (req, res, next) => {
    try {
        const { error, value } = tableSchema.validate(req.body);
        if (error) {
            error.isJoi = true;
            throw error;
        }

        const result = await prisma.table.updateMany({
            where: { id: parseInt(req.params.id), restaurantId: req.restaurantId },
            data: value
        });

        if (result.count === 0) {
            return res.status(404).json({ error: 'Masa bulunamadı' });
        }

        const table = await prisma.table.findUnique({
            where: { id: parseInt(req.params.id) }
        });

        res.json({ table });
    } catch (error) {
        next(error);
    }
};

exports.delete = async (req, res, next) => {
    try {
        const deleted = await prisma.table.deleteMany({
            where: { id: parseInt(req.params.id), restaurantId: req.restaurantId }
        });

        if (deleted.count === 0) {
            return res.status(404).json({ error: 'Masa bulunamadı' });
        }

        res.json({ message: 'Masa silindi' });
    } catch (error) {
        next(error);
    }
};

exports.getQRCode = async (req, res, next) => {
    try {
        const table = await prisma.table.findFirst({
            where: { id: parseInt(req.params.id), restaurantId: req.restaurantId },
            include: { restaurant: { select: { name: true, slug: true } } }
        });

        if (!table) {
            return res.status(404).json({ error: 'Masa bulunamadı' });
        }

        // Generate QR code URL
        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const qrUrl = `${baseUrl}/menu/${table.qrCode}`;

        res.json({
            table: {
                id: table.id,
                tableNumber: table.tableNumber,
                tableName: table.tableName,
                qrCode: table.qrCode,
                qrUrl
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.regenerateQRCode = async (req, res, next) => {
    try {
        const table = await prisma.table.findFirst({
            where: { id: parseInt(req.params.id), restaurantId: req.restaurantId }
        });

        if (!table) {
            return res.status(404).json({ error: 'Masa bulunamadı' });
        }

        const newQrCode = generateQRCode(req.restaurantId, table.id);

        const updated = await prisma.table.update({
            where: { id: table.id },
            data: { qrCode: newQrCode }
        });

        // Invalidate old sessions
        await prisma.session.updateMany({
            where: { tableId: table.id, isActive: true },
            data: { isActive: false }
        });

        res.json({ table: updated });
    } catch (error) {
        next(error);
    }
};
