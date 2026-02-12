const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const { logger } = require('../utils/logger');

// Cloudflare R2 Client Configuration
const R2_ACCOUNT_ID = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME;

// Public URL domain (mapped domain or R2.dev subdomain)
// If mapped domain: https://assets.qresto.com
// If R2.dev: https://pub-{hash}.r2.dev
const R2_PUBLIC_DOMAIN = process.env.CLOUDFLARE_R2_PUBLIC_DOMAIN;

const s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
});

/**
 * Upload image to R2 bucket
 * @param {Buffer} fileBuffer - The image buffer from multer
 * @param {string} pathPrefix - Folder path in bucket (e.g. 'restaurants/1/menu')
 * @returns {Promise<string>} - Public URL of the uploaded image
 */
exports.uploadImage = async (fileBuffer, pathPrefix) => {
    try {
        // 1. Optimize image (Resize & Convert to WebP)
        const optimizedBuffer = await sharp(fileBuffer)
            .resize({
                width: 800,
                height: 600,
                fit: 'inside', // Maintain aspect ratio
                withoutEnlargement: true
            })
            .webp({ quality: 80 })
            .toBuffer();

        // 2. Generate unique filename
        const filename = `${uuidv4()}.webp`;
        const key = `${pathPrefix}/${filename}`;

        // 3. Upload to R2
        await s3Client.send(new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: key,
            Body: optimizedBuffer,
            ContentType: 'image/webp',
            // ACL: 'public-read' // R2 buckets are usually private by default or public via policy. ACL might not be supported/needed depending on bucket settings.
        }));

        logger.info(`Image uploaded to R2: ${key}`);

        // 4. Return Public URL
        return `${R2_PUBLIC_DOMAIN}/${key}`;

    } catch (error) {
        logger.error('Image upload failed:', error);
        throw new Error('Resim yükleme işlemi başarısız oldu.');
    }
};

/**
 * Delete image from R2 bucket
 * @param {string} imageUrl - The full public URL of the image
 */
exports.deleteImage = async (imageUrl) => {
    try {
        if (!imageUrl) return;

        // Extract key from URL
        // URL format: https://domain.com/folder/filename.webp
        // Key: folder/filename.webp

        let key = imageUrl;
        if (imageUrl.startsWith(R2_PUBLIC_DOMAIN)) {
            key = imageUrl.replace(`${R2_PUBLIC_DOMAIN}/`, '');
        }

        await s3Client.send(new DeleteObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: key
        }));

        logger.info(`Image deleted from R2: ${key}`);
    } catch (error) {
        logger.error('Image delete failed:', error);
        // Don't throw error, just log it. Deletion failure shouldn't block main operation.
    }
};
