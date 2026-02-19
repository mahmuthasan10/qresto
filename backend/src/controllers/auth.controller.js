const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const prisma = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const { logger } = require('../utils/logger');
const emailService = require('../services/email.service');

// Validation schemas
const registerSchema = Joi.object({
    name: Joi.string().min(2).max(255).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(100).required(),
    phone: Joi.string().max(20).optional(),
    address: Joi.string().optional(),
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required()
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

// Generate tokens
const generateTokens = (restaurantId) => {
    const accessToken = jwt.sign(
        { restaurantId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    const refreshToken = jwt.sign(
        { restaurantId, type: 'refresh' },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    return { accessToken, refreshToken };
};

// Generate slug from name
const generateSlug = (name) => {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
};

exports.register = async (req, res, next) => {
    try {
        // Validate input
        const { error, value } = registerSchema.validate(req.body);
        if (error) {
            error.isJoi = true;
            throw error;
        }

        const { name, email, password, phone, address, latitude, longitude } = value;

        // Check if email exists
        const existingRestaurant = await prisma.restaurant.findUnique({
            where: { email }
        });

        if (existingRestaurant) {
            return res.status(409).json({ error: 'Bu email zaten kayıtlı' });
        }

        // Generate slug
        let slug = generateSlug(name);
        const existingSlug = await prisma.restaurant.findUnique({ where: { slug } });
        if (existingSlug) {
            slug = `${slug}-${uuidv4().slice(0, 6)}`;
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // Create restaurant
        const restaurant = await prisma.restaurant.create({
            data: {
                name,
                slug,
                email,
                passwordHash,
                phone,
                address,
                latitude,
                longitude
            },
            select: {
                id: true,
                name: true,
                slug: true,
                email: true,
                phone: true,
                address: true,
                latitude: true,
                longitude: true,
                locationRadius: true,
                sessionTimeout: true,
                subscriptionPlan: true,
                createdAt: true
            }
        });

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(restaurant.id);

        // Send welcome email (non-blocking)
        emailService.sendWelcome(email, name).catch(() => {});

        res.status(201).json({
            message: 'Kayıt başarılı',
            restaurant,
            accessToken,
            refreshToken
        });
    } catch (error) {
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        // Validate input
        const { error, value } = loginSchema.validate(req.body);
        if (error) {
            error.isJoi = true;
            throw error;
        }

        const { email, password } = value;
        const fs = require('fs');

        // Find restaurant
        let restaurant;
        try {
            restaurant = await prisma.restaurant.findUnique({
                where: { email }
            });
        } catch (dbError) {
            fs.appendFileSync('backend_error.log', `DB Error findUnique: ${dbError.message}\n`);
            // Fallback
            restaurant = await prisma.restaurant.findFirst({
                where: { email }
            });
        }

        if (!restaurant) {
            return res.status(401).json({ error: 'Email veya şifre hatalı' });
        }

        if (!restaurant.isActive) {
            return res.status(403).json({ error: 'Bu hesap devre dışı' });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, restaurant.passwordHash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Email veya şifre hatalı' });
        }

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(restaurant.id);

        // Return restaurant without sensitive data
        const { passwordHash, ...restaurantData } = restaurant;

        res.json({
            message: 'Giriş başarılı',
            restaurant: restaurantData,
            accessToken,
            refreshToken
        });
    } catch (error) {
        next(error);
    }
};

exports.refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ error: 'Refresh token gerekli' });
        }

        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        if (decoded.type !== 'refresh') {
            return res.status(401).json({ error: 'Geçersiz token tipi' });
        }

        // Check if restaurant exists
        const restaurant = await prisma.restaurant.findUnique({
            where: { id: decoded.restaurantId }
        });

        if (!restaurant || !restaurant.isActive) {
            return res.status(401).json({ error: 'Geçersiz token' });
        }

        // Generate new tokens
        const tokens = generateTokens(restaurant.id);

        res.json({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        });
    } catch (error) {
        next(error);
    }
};

exports.forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email adresi gerekli' });
        }

        const restaurant = await prisma.restaurant.findUnique({
            where: { email }
        });

        // Always return success for security (don't reveal if email exists)
        if (restaurant) {
            // Generate a secure reset token
            const crypto = require('crypto');
            const resetToken = crypto.randomBytes(32).toString('hex');
            const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

            await prisma.restaurant.update({
                where: { id: restaurant.id },
                data: { resetToken, resetTokenExpiry }
            });

            // Build reset URL
            const frontendUrl = process.env.FRONTEND_URL || process.env.CORS_ORIGIN || 'http://localhost:3000';
            const resetUrl = `${frontendUrl}/admin/reset-password?token=${resetToken}`;

            logger.info(`Password reset requested for: ${email}`);

            // Send reset email
            const emailSent = await emailService.sendPasswordReset(email, resetUrl, restaurant.name);
            if (!emailSent) {
                logger.warn(`Password reset email could not be sent to: ${email}`);
                logger.info(`Reset URL (fallback): ${resetUrl}`);
            }
        }

        res.json({
            message: 'Eğer bu email kayıtlıysa, şifre sıfırlama bağlantısı gönderilecektir'
        });
    } catch (error) {
        next(error);
    }
};

exports.resetPassword = async (req, res, next) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ error: 'Token ve yeni şifre gerekli' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'Şifre en az 6 karakter olmalı' });
        }

        // Find restaurant by reset token
        const restaurant = await prisma.restaurant.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: { gt: new Date() }
            }
        });

        if (!restaurant) {
            return res.status(400).json({ error: 'Geçersiz veya süresi dolmuş token' });
        }

        // Hash new password and clear reset token
        const passwordHash = await bcrypt.hash(newPassword, 12);

        await prisma.restaurant.update({
            where: { id: restaurant.id },
            data: {
                passwordHash,
                resetToken: null,
                resetTokenExpiry: null
            }
        });

        logger.info(`Password reset completed for: ${restaurant.email}`);

        res.json({
            message: 'Şifre başarıyla değiştirildi'
        });
    } catch (error) {
        next(error);
    }
};
