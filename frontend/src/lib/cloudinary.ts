'use client';

// Cloudinary configuration
// To use: Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in .env.local

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'demo';
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'unsigned_preset';

export interface CloudinaryUploadResult {
    secure_url: string;
    public_id: string;
    width: number;
    height: number;
    format: string;
    bytes: number;
}

export interface UploadOptions {
    folder?: string;
    maxFileSize?: number; // in bytes, default 5MB
    transformation?: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function uploadImage(
    file: File,
    options: UploadOptions = {}
): Promise<CloudinaryUploadResult> {
    const { folder = 'qresto', maxFileSize = MAX_FILE_SIZE } = options;

    // Validate file size
    if (file.size > maxFileSize) {
        throw new Error(`Dosya boyutu çok büyük. Maksimum ${maxFileSize / 1024 / 1024}MB`);
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
        throw new Error('Sadece resim dosyaları yüklenebilir');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', folder);

    // Auto format conversion to webp for optimization
    formData.append('transformation', 'f_webp,q_auto');

    try {
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
            {
                method: 'POST',
                body: formData,
            }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Resim yüklenirken hata oluştu');
        }

        const result = await response.json();
        return {
            secure_url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
        };
    } catch (error: any) {
        console.error('Cloudinary upload error:', error);
        throw new Error(error.message || 'Resim yüklenirken hata oluştu');
    }
}

export async function deleteImage(publicId: string): Promise<boolean> {
    // Note: Deletion requires server-side implementation with API secret
    // This is a placeholder - implement on backend
    console.log('Delete image:', publicId);
    return true;
}

// Helper to generate optimized image URLs
export function getOptimizedImageUrl(
    url: string,
    options: {
        width?: number;
        height?: number;
        crop?: 'fill' | 'fit' | 'scale' | 'thumb';
        quality?: 'auto' | number;
    } = {}
): string {
    if (!url || !url.includes('cloudinary.com')) {
        return url;
    }

    const { width, height, crop = 'fill', quality = 'auto' } = options;

    // Build transformation string
    const transforms: string[] = [];
    if (width) transforms.push(`w_${width}`);
    if (height) transforms.push(`h_${height}`);
    if (crop) transforms.push(`c_${crop}`);
    transforms.push(`q_${quality}`);
    transforms.push('f_auto');

    const transformString = transforms.join(',');

    // Insert transformation into URL
    return url.replace('/upload/', `/upload/${transformString}/`);
}

// Thumbnail URL generator
export function getThumbnailUrl(url: string, size: number = 150): string {
    return getOptimizedImageUrl(url, {
        width: size,
        height: size,
        crop: 'thumb',
    });
}
