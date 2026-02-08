const prisma = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// Haversine formula ile mesafe hesaplama (metre)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
};

exports.start = async (req, res, next) => {
    try {
        const { qrCode, latitude, longitude, deviceInfo } = req.body;

        if (!qrCode) {
            return res.status(400).json({ error: 'QR kod gerekli' });
        }

        // Find table by QR code
        const table = await prisma.table.findUnique({
            where: { qrCode },
            include: {
                restaurant: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        latitude: true,
                        longitude: true,
                        locationRadius: true,
                        sessionTimeout: true,
                        isActive: true
                    }
                }
            }
        });

        if (!table) {
            return res.status(404).json({ error: 'Geçersiz QR kod' });
        }

        if (!table.restaurant.isActive) {
            return res.status(403).json({ error: 'Bu restoran şu anda hizmet vermiyor' });
        }

        if (!table.isActive) {
            return res.status(403).json({ error: 'Bu masa şu anda aktif değil' });
        }

        // Verify location if provided
        let locationVerified = false;
        let distance = null;

        if (latitude && longitude) {
            distance = calculateDistance(
                parseFloat(latitude),
                parseFloat(longitude),
                parseFloat(table.restaurant.latitude),
                parseFloat(table.restaurant.longitude)
            );

            locationVerified = distance <= table.restaurant.locationRadius;

            if (!locationVerified) {
                return res.status(403).json({
                    error: 'Bu QR kod sadece restoran içinde kullanılabilir',
                    distance: Math.round(distance),
                    maxDistance: table.restaurant.locationRadius
                });
            }
        }

        // Close any existing active sessions for this table
        await prisma.session.updateMany({
            where: { tableId: table.id, isActive: true },
            data: { isActive: false }
        });

        // Create new session
        const sessionTimeout = table.restaurant.sessionTimeout || 30;
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + sessionTimeout);

        const session = await prisma.session.create({
            data: {
                restaurantId: table.restaurant.id,
                tableId: table.id,
                sessionToken: uuidv4(),
                customerLatitude: latitude ? parseFloat(latitude) : null,
                customerLongitude: longitude ? parseFloat(longitude) : null,
                deviceInfo: deviceInfo || null,
                expiresAt
            }
        });

        res.status(201).json({
            session: {
                token: session.sessionToken,
                expiresAt: session.expiresAt,
                tableNumber: table.tableNumber,
                tableName: table.tableName
            },
            restaurant: {
                id: table.restaurant.id,
                name: table.restaurant.name,
                slug: table.restaurant.slug
            },
            locationVerified,
            distance: distance ? Math.round(distance) : null
        });
    } catch (error) {
        next(error);
    }
};

exports.verify = async (req, res, next) => {
    try {
        const session = await prisma.session.findUnique({
            where: { sessionToken: req.params.token },
            include: {
                table: { select: { tableNumber: true, tableName: true } },
                restaurant: { select: { name: true, slug: true } }
            }
        });

        if (!session) {
            return res.status(404).json({ error: 'Oturum bulunamadı', valid: false });
        }

        const now = new Date();
        const isExpired = session.expiresAt < now;
        const isActive = session.isActive && !isExpired;

        if (!isActive) {
            return res.status(403).json({
                error: 'Oturum süresi dolmuş',
                valid: false,
                expired: isExpired
            });
        }

        // Calculate remaining time
        const remainingMs = session.expiresAt.getTime() - now.getTime();
        const remainingMinutes = Math.floor(remainingMs / 1000 / 60);

        res.json({
            valid: true,
            session: {
                expiresAt: session.expiresAt,
                remainingMinutes,
                tableNumber: session.table.tableNumber,
                tableName: session.table.tableName
            },
            restaurant: session.restaurant
        });
    } catch (error) {
        next(error);
    }
};

exports.extend = async (req, res, next) => {
    try {
        const session = await prisma.session.findUnique({
            where: { sessionToken: req.params.token },
            include: { restaurant: { select: { sessionTimeout: true } } }
        });

        if (!session || !session.isActive) {
            return res.status(404).json({ error: 'Aktif oturum bulunamadı' });
        }

        // Extend by 10 minutes
        const newExpiresAt = new Date();
        newExpiresAt.setMinutes(newExpiresAt.getMinutes() + 10);

        const updated = await prisma.session.update({
            where: { id: session.id },
            data: {
                expiresAt: newExpiresAt,
                lastActivityAt: new Date()
            }
        });

        res.json({
            session: {
                expiresAt: updated.expiresAt
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.end = async (req, res, next) => {
    try {
        const result = await prisma.session.updateMany({
            where: { sessionToken: req.params.token },
            data: { isActive: false }
        });

        if (result.count === 0) {
            return res.status(404).json({ error: 'Oturum bulunamadı' });
        }

        res.json({ message: 'Oturum sonlandırıldı' });
    } catch (error) {
        next(error);
    }
};
