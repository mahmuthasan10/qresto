const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

class CloudinaryService {
    /**
     * Upload an image buffer to Cloudinary
     * @param {Buffer} buffer - The image buffer
     * @param {string} folder - Optional folder name
     * @returns {Promise<Object>} - Cloudinary upload result
     */
    static uploadImage(buffer, folder = 'qresto/menu-items') {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: folder,
                    resource_type: 'image'
                },
                (error, result) => {
                    if (error) return reject(error);
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
            const parts = url.split('/');
            const filename = parts[parts.length - 1];
            const publicId = filename.split('.')[0];
            const folder = parts[parts.length - 2];
            return `${folder}/${publicId}`; // Basic extraction, might need adjustment based on folder structure
        } catch (error) {
            return null;
        }
    }
}

module.exports = CloudinaryService;
