'use client';

import { HTMLAttributes, forwardRef } from 'react';

type BadgeVariant = 'status' | 'count';
type BadgeStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: BadgeVariant;
    status?: BadgeStatus;
    count?: number;
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
    ({ className = '', variant = 'status', status = 'pending', count, children, ...props }, ref) => {
        const baseStyles = 'inline-flex items-center justify-center font-medium rounded-full';

        const statusStyles: Record<BadgeStatus, string> = {
            pending: 'bg-yellow-100 text-yellow-800 px-3 py-1 text-xs',
            confirmed: 'bg-blue-100 text-blue-800 px-3 py-1 text-xs',
            preparing: 'bg-orange-100 text-orange-800 px-3 py-1 text-xs',
            ready: 'bg-green-100 text-green-800 px-3 py-1 text-xs',
            completed: 'bg-gray-100 text-gray-800 px-3 py-1 text-xs',
            cancelled: 'bg-red-100 text-red-800 px-3 py-1 text-xs',
        };

        const statusLabels: Record<BadgeStatus, string> = {
            pending: 'Bekliyor',
            confirmed: 'Onaylandı',
            preparing: 'Hazırlanıyor',
            ready: 'Hazır',
            completed: 'Tamamlandı',
            cancelled: 'İptal',
        };

        if (variant === 'count') {
            return (
                <span
                    ref={ref}
                    className={`${baseStyles} bg-orange-500 text-white min-w-[20px] h-5 px-1.5 text-xs ${className}`}
                    {...props}
                >
                    {count !== undefined ? (count > 99 ? '99+' : count) : children}
                </span>
            );
        }

        return (
            <span
                ref={ref}
                className={`${baseStyles} ${statusStyles[status]} ${className}`}
                {...props}
            >
                {children || statusLabels[status]}
            </span>
        );
    }
);

Badge.displayName = 'Badge';

export default Badge;
