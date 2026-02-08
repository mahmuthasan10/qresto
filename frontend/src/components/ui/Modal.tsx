'use client';

import { useEffect, useRef, ReactNode, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import Button from './Button';

type ModalVariant = 'confirmation' | 'form' | 'alert';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    variant?: ModalVariant;
    title?: string;
    children: ReactNode;
    size?: 'sm' | 'md' | 'lg';
    showCloseButton?: boolean;
    // Confirmation modal props
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    confirmVariant?: 'primary' | 'danger';
    isLoading?: boolean;
}

const Modal = ({
    isOpen,
    onClose,
    variant = 'form',
    title,
    children,
    size = 'md',
    showCloseButton = true,
    confirmText = 'Onayla',
    cancelText = 'İptal',
    onConfirm,
    confirmVariant = 'primary',
    isLoading = false,
}: ModalProps) => {
    const modalRef = useRef<HTMLDivElement>(null);

    const sizes = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
    };

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        },
        [onClose]
    );

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, handleKeyDown]);

    if (!isOpen) return null;

    const modalContent = (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            {/* Modal */}
            <div
                ref={modalRef}
                className={`relative w-full ${sizes[size]} bg-white rounded-xl shadow-xl transform transition-all duration-200 animate-in fade-in zoom-in-95`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                {(title || showCloseButton) && (
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                        {title && (
                            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                        )}
                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                )}

                {/* Body */}
                <div className="px-6 py-4">{children}</div>

                {/* Footer for confirmation/alert */}
                {(variant === 'confirmation' || variant === 'alert') && (
                    <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
                        {variant === 'confirmation' && (
                            <Button variant="ghost" onClick={onClose}>
                                {cancelText}
                            </Button>
                        )}
                        <Button
                            variant={confirmVariant}
                            onClick={onConfirm || onClose}
                            isLoading={isLoading}
                        >
                            {confirmText}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );

    if (typeof window === 'undefined') return null;

    return createPortal(modalContent, document.body);
};

export default Modal;
