const nodemailer = require('nodemailer');
const { logger } = require('../utils/logger');

/**
 * Email Service - Nodemailer based
 * 
 * Supports any SMTP provider:
 * - Gmail (smtp.gmail.com, port 587)
 * - Outlook (smtp-mail.outlook.com, port 587)
 * - Yandex (smtp.yandex.com, port 465)
 * - Custom SMTP servers
 * 
 * Required env vars:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
 * Optional:
 *   SMTP_FROM (defaults to SMTP_USER)
 *   SMTP_SECURE (true for port 465, false for 587 with STARTTLS)
 */

class EmailService {
    constructor() {
        this.transporter = null;
        this.isConfigured = false;
        this._init();
    }

    _init() {
        const host = process.env.SMTP_HOST;
        const port = parseInt(process.env.SMTP_PORT) || 587;
        const user = process.env.SMTP_USER;
        const pass = process.env.SMTP_PASS;

        if (!host || !user || !pass) {
            logger.warn('Email service not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS env vars.');
            return;
        }

        const secure = process.env.SMTP_SECURE === 'true' || port === 465;

        this.transporter = nodemailer.createTransport({
            host,
            port,
            secure,
            auth: { user, pass },
            tls: {
                rejectUnauthorized: process.env.NODE_ENV === 'production'
            }
        });

        this.from = process.env.SMTP_FROM || `QResto <${user}>`;
        this.isConfigured = true;

        logger.info(`Email service configured: ${host}:${port}`);
    }

    /**
     * Send a raw email
     */
    async send({ to, subject, html, text }) {
        if (!this.isConfigured) {
            logger.warn(`Email not sent (not configured): to=${to}, subject=${subject}`);
            return false;
        }

        try {
            const info = await this.transporter.sendMail({
                from: this.from,
                to,
                subject,
                html,
                text
            });

            logger.info(`Email sent: ${info.messageId} to ${to}`);
            return true;
        } catch (error) {
            logger.error(`Email send failed to ${to}:`, error.message);
            return false;
        }
    }

    /**
     * Send password reset email
     */
    async sendPasswordReset(to, resetUrl, restaurantName) {
        const subject = 'QResto - Şifre Sıfırlama';

        const html = `
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #f4f4f7; padding: 40px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 32px 40px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">🍽️ QResto</h1>
                        </td>
                    </tr>
                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 16px; color: #1f2937; font-size: 22px;">Şifre Sıfırlama</h2>
                            <p style="margin: 0 0 8px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                                Merhaba <strong>${restaurantName || ''}</strong>,
                            </p>
                            <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                                Hesabınız için şifre sıfırlama talebinde bulundunuz. Aşağıdaki butona tıklayarak yeni şifrenizi belirleyebilirsiniz:
                            </p>
                            <!-- Button -->
                            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                                <tr>
                                    <td align="center" style="padding: 8px 0 32px;">
                                        <a href="${resetUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #f97316, #ea580c); color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                                            Şifremi Sıfırla
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                                Bu bağlantı <strong>1 saat</strong> içinde geçerliliğini yitirecektir.
                            </p>
                            <p style="margin: 0 0 24px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                                Eğer bu talebi siz yapmadıysanız, bu emaili güvenle yok sayabilirsiniz.
                            </p>
                            <!-- Fallback link -->
                            <div style="background-color: #f9fafb; border-radius: 8px; padding: 16px; margin-top: 16px;">
                                <p style="margin: 0 0 4px; color: #6b7280; font-size: 12px;">Buton çalışmıyorsa aşağıdaki bağlantıyı tarayıcınıza kopyalayın:</p>
                                <p style="margin: 0; color: #f97316; font-size: 12px; word-break: break-all;">${resetUrl}</p>
                            </div>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0; color: #9ca3af; font-size: 13px;">
                                © ${new Date().getFullYear()} QResto — Dijital Menü & Sipariş Yönetim Sistemi
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

        const text = `QResto - Şifre Sıfırlama\n\nMerhaba ${restaurantName || ''},\n\nŞifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:\n${resetUrl}\n\nBu bağlantı 1 saat içinde geçerliliğini yitirecektir.\n\nEğer bu talebi siz yapmadıysanız, bu emaili yok sayabilirsiniz.`;

        return this.send({ to, subject, html, text });
    }

    /**
     * Send welcome email after registration
     */
    async sendWelcome(to, restaurantName) {
        const subject = 'QResto\'ya Hoş Geldiniz! 🎉';
        const frontendUrl = process.env.FRONTEND_URL || process.env.CORS_ORIGIN;

        const html = `
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #f4f4f7; padding: 40px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                    <tr>
                        <td style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 32px 40px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">🍽️ QResto</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 16px; color: #1f2937; font-size: 22px;">Hoş Geldiniz! 🎉</h2>
                            <p style="margin: 0 0 16px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                                Merhaba <strong>${restaurantName}</strong>,
                            </p>
                            <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                                QResto'ya kaydınız başarıyla tamamlandı. Artık dijital menünüzü oluşturabilir, masa QR kodlarınızı ayarlayabilir ve siparişleri gerçek zamanlı olarak yönetebilirsiniz.
                            </p>
                            <h3 style="margin: 0 0 12px; color: #1f2937; font-size: 16px;">Başlamak için:</h3>
                            <ol style="margin: 0 0 24px; padding-left: 20px; color: #4b5563; font-size: 15px; line-height: 2;">
                                <li>Kategorilerinizi oluşturun</li>
                                <li>Menü ürünlerinizi ekleyin</li>
                                <li>Masalarınızı tanımlayın ve QR kodları indirin</li>
                                <li>Siparişleri mutfak ekranından takip edin</li>
                            </ol>
                            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                                <tr>
                                    <td align="center" style="padding: 8px 0;">
                                        <a href="${frontendUrl}/admin/dashboard" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #f97316, #ea580c); color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                                            Panele Git
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0; color: #9ca3af; font-size: 13px;">
                                © ${new Date().getFullYear()} QResto — Dijital Menü & Sipariş Yönetim Sistemi
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

        const text = `QResto'ya Hoş Geldiniz!\n\nMerhaba ${restaurantName},\n\nKaydınız başarıyla tamamlandı. Panele giriş yaparak menünüzü oluşturmaya başlayabilirsiniz.\n\n${frontendUrl}/admin/dashboard`;

        return this.send({ to, subject, html, text });
    }

    /**
     * Verify SMTP connection
     */
    async verify() {
        if (!this.isConfigured) return false;
        try {
            await this.transporter.verify();
            logger.info('SMTP connection verified successfully');
            return true;
        } catch (error) {
            logger.error('SMTP verification failed:', error.message);
            return false;
        }
    }
}

// Singleton
module.exports = new EmailService();
