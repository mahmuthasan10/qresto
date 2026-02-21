const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const { logger } = require('../utils/logger');

// Configure Cloudinary
const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

const isConfigured = CLOUD_NAME && API_KEY && API_SECRET
    && CLOUD_NAME !== 'demo' && API_KEY !== '12345678';

if (!isConfigured) {
    logger.warn('Cloudinary credentials not configured or using placeholder values. Image upload will not work.');
}

cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: API_KEY,
    api_secret: API_SECRET
});

class CloudinaryService {
    /**
     * Upload an image buffer to Cloudinary
     * @param {Buffer} buffer - The image buffer
     * @param {string} folder - Optional folder name
     * @returns {Promise<Object>} - Cloudinary upload result
     */
    static uploadImage(buffer, folder = 'qresto/menu-items') {
        if (!isConfigured) {
            const err = new Error(
                'Resim yükleme servisi yapılandırılmamış. Cloudinary hesabı oluşturup CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY ve CLOUDINARY_API_SECRET ortam değişkenlerini ayarlayın. (cloudinary.com adresinden ücretsiz hesap açabilirsiniz)'
            );
            err.statusCode = 503;
            return Promise.reject(err);
        }

        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: folder,
                    resource_type: 'image',
                    transformation: [
                        { quality: 'auto', fetch_format: 'auto' }
                    ]
                },
                (error, result) => {
                    if (error) {
                        logger.error('Cloudinary upload error:', error.message);
                        return reject(error);
                    }
                    resolve(result);
                }
            );

            streamifier.createReadStream(buffer).pipe(uploadStream);
        });
    }

    /**
     * Delete an image from Cloudinary
     * @param {string} publicId - The public ID of the image
     * @returns {Promise<Object>} - Cloudinary deletion result
     */
    static deleteImage(publicId) {
        return cloudinary.uploader.destroy(publicId);
    }

    /**
     * Extract public ID from Cloudinary URL
     * @param {string} url - The Cloudinary URL
     * @returns {string|null} - The public ID or null
     */
    static getPublicIdFromUrl(url) {
        try {
            // Extract public_id from Cloudinary URL
            // URL format: https://res.cloudinary.com/cloud/image/upload/v1234/folder/subfolder/filename.ext
            const uploadIndex = url.indexOf('/upload/');
            if (uploadIndex === -1) return null;
            const afterUpload = url.substring(uploadIndex + 8); // skip '/upload/'
            // Remove version prefix if present (v123456789/)
            const withoutVersion = afterUpload.replace(/^v\d+\//, '');
            // Remove file extension
            const publicId = withoutVersion.replace(/\.[^/.]+$/, '');
            return publicId;
        } catch (error) {
            return null;
        }
    }
}

module.exports = CloudinaryService;
