const prisma = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const { redisClient } = require('../config/redis');

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
        const { qrCode, latitude, longitude, accuracy, deviceInfo } = req.body;

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

        // DEV MODE: Skip location check for testing
        const isDev = process.env.NODE_ENV === 'development';

        if (latitude && longitude) {
            distance = calculateDistance(
                parseFloat(latitude),
                parseFloat(longitude),
                parseFloat(table.restaurant.latitude),
                parseFloat(table.restaurant.longitude)
            );

            // accuracy cihazdan gelir, yoksa minimum 50 metre tolerans ver
            // Restoranın kendi yarıçapına +50 metre "kapalı alan sapma payı" ekle
            const accuracyTolerance = Math.min(Number(accuracy) || 50, 500);
            const baseRadius = Number(table.restaurant.locationRadius) || 50;
            const effectiveRadius = baseRadius + accuracyTolerance + 50;

            locationVerified = distance <= effectiveRadius;

            // In development, allow bypass if location fails
            if (!locationVerified && !isDev) {
                return res.status(403).json({
                    error: `Restoran alanından uzaktasınız. (Mesafe: ${Math.round(distance)}m, İzin Verilen: ${Math.round(effectiveRadius)}m)`,
                    distance: Math.round(distance),
                    maxDistance: Math.round(effectiveRadius)
                });
            }

            // DEV: Force verified in development
            if (isDev) {
                locationVerified = true;
            }
        } else if (isDev) {
            // DEV: If no location provided in dev, still allow
            locationVerified = true;
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

        // Save to Redis
        const sessionData = {
            id: session.id,
            sessionToken: session.sessionToken,
            restaurantId: table.restaurant.id,
            tableId: table.id,
            tableNumber: table.tableNumber,
            tableName: table.tableName,
            restaurantName: table.restaurant.name,
            restaurantSlug: table.restaurant.slug,
            expiresAt: expiresAt.toISOString()
        };

        await redisClient.set(
            `session:${session.sessionToken}`,
            JSON.stringify(sessionData),
            'EX',
            sessionTimeout * 60 // seconds
        );

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
        const token = req.params.token;

        // Try to get from Redis first
        const cachedSessionStr = await redisClient.get(`session:${token}`);

        if (cachedSessionStr) {
            const cachedSession = JSON.parse(cachedSessionStr);
            const expiresAt = new Date(cachedSession.expiresAt);
            const now = new Date();

            // Calculate remaining time
            const remainingMs = expiresAt.getTime() - now.getTime();
            const remainingMinutes = Math.floor(remainingMs / 1000 / 60);

            return res.json({
                valid: true,
                session: {
                    expiresAt: expiresAt,
                    remainingMinutes,
                    tableNumber: cachedSession.tableNumber,
                    tableName: cachedSession.tableName
                },
                restaurant: {
                    name: cachedSession.restaurantName,
                    slug: cachedSession.restaurantSlug
                }
            });
        }

        // Fallback to DB
        const session = await prisma.session.findUnique({
            where: { sessionToken: token },
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
            return res.json({
                error: 'Oturum süresi dolmuş',
                valid: false,
                expired: isExpired
            });
        }

        // If found in DB but not Redis (and valid), we could re-cache it, 
        // but for now let's just return it. 
        // Or re-cache for remaining time?
        const remainingMs = session.expiresAt.getTime() - now.getTime();
        const remainingSeconds = Math.round(remainingMs / 1000);

        if (remainingSeconds > 0) {
            const sessionData = {
                id: session.id,
                sessionToken: session.sessionToken,
                restaurantId: session.restaurantId,
                tableId: session.tableId,
                tableNumber: session.table.tableNumber,
                tableName: session.table.tableName,
                restaurantName: session.restaurant.name,
                restaurantSlug: session.restaurant.slug,
                expiresAt: session.expiresAt.toISOString()
            };

            await redisClient.set(
                `session:${session.sessionToken}`,
                JSON.stringify(sessionData),
                'EX',
                remainingSeconds
            );
        }

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
        const token = req.params.token;
        const session = await prisma.session.findUnique({
            where: { sessionToken: token },
            include: { restaurant: { select: { sessionTimeout: true } } }
        });

        if (!session || !session.isActive) {
            return res.status(404).json({ error: 'Aktif oturum bulunamadı' });
        }

        // Extend by 10 minutes (or whatever logic)
        // Note: The logic in original code was +10 mins. 
        const EXTEND_MINUTES = 10;
        const newExpiresAt = new Date();
        newExpiresAt.setMinutes(newExpiresAt.getMinutes() + EXTEND_MINUTES);

        const updated = await prisma.session.update({
            where: { id: session.id },
            data: {
                expiresAt: newExpiresAt,
                lastActivityAt: new Date()
            }
        });

        // Update Redis TTL
        const cachedSessionStr = await redisClient.get(`session:${token}`);
        if (cachedSessionStr) {
            const cachedSession = JSON.parse(cachedSessionStr);
            cachedSession.expiresAt = newExpiresAt.toISOString();

            // Calculate new TTL in seconds
            const now = new Date();
            const ttlSeconds = Math.round((newExpiresAt.getTime() - now.getTime()) / 1000);

            if (ttlSeconds > 0) {
                await redisClient.set(
                    `session:${token}`,
                    JSON.stringify(cachedSession),
                    'EX',
                    ttlSeconds
                );
            }
        }

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
        const token = req.params.token;

        // Remove from Redis
        await redisClient.del(`session:${token}`);

        const result = await prisma.session.updateMany({
            where: { sessionToken: token },
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

