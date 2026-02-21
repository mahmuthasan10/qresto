'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { uploadImage, getThumbnailUrl } from '@/lib/cloudinary';
import { X, Loader2, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
    value?: string;
    onChange: (url: string | null) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

export default function ImageUpload({
    value,
    onChange,
    placeholder = 'Resim yükle',
    className = '',
    disabled = false,
}: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setError(null);

        try {
            const result = await uploadImage(file, { folder: 'qresto/menu' });
            onChange(result.secure_url);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleRemove = () => {
        onChange(null);
    };

    const handleClick = () => {
        if (!disabled && !isUploading) {
            fileInputRef.current?.click();
        }
    };

    return (
        <div className={`${className}`}>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={disabled || isUploading}
            />

            {value ? (
                <div className="relative inline-block">
                    <img
                        src={getThumbnailUrl(value, 200)}
                        alt="Uploaded"
                        className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                    />
                    {!disabled && (
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            ) : (
                <button
                    type="button"
                    onClick={handleClick}
                    disabled={disabled || isUploading}
                    className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-orange-400 hover:text-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isUploading ? (
                        <>
                            <Loader2 className="w-8 h-8 animate-spin" />
                            <span className="text-xs">Yükleniyor...</span>
                        </>
                    ) : (
                        <>
                            <ImageIcon className="w-8 h-8" />
                            <span className="text-xs text-center px-2">{placeholder}</span>
                        </>
                    )}
                </button>
            )}

            {error && (
                <p className="text-red-500 text-sm mt-2">{error}</p>
            )}
        </div>
    );
}
