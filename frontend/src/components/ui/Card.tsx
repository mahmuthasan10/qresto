'use client';

import { HTMLAttributes, forwardRef } from 'react';

type CardVariant = 'product' | 'order' | 'stat';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: CardVariant;
    hoverable?: boolean;
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> { }
interface CardBodyProps extends HTMLAttributes<HTMLDivElement> { }
interface CardFooterProps extends HTMLAttributes<HTMLDivElement> { }

const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className = '', variant = 'product', hoverable = false, children, ...props }, ref) => {
        const baseStyles = 'bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-200';

        const variants = {
            product: 'shadow-sm',
            order: 'shadow-md border-l-4 border-l-orange-500',
            stat: 'shadow-sm bg-gradient-to-br from-white to-gray-50',
        };

        const hoverStyles = hoverable ? 'hover:shadow-lg hover:-translate-y-1 cursor-pointer' : '';

        return (
            <div
                ref={ref}
                className={`${baseStyles} ${variants[variant]} ${hoverStyles} ${className}`}
                {...props}
            >
                {children}
            </div>
        );
    }
);

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
    ({ className = '', children, ...props }, ref) => (
        <div
            ref={ref}
            className={`px-4 py-3 border-b border-gray-100 ${className}`}
            {...props}
        >
            {children}
        </div>
    )
);

const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(
    ({ className = '', children, ...props }, ref) => (
        <div
            ref={ref}
            className={`p-4 ${className}`}
            {...props}
        >
            {children}
        </div>
    )
);

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
    ({ className = '', children, ...props }, ref) => (
        <div
            ref={ref}
            className={`px-4 py-3 bg-gray-50 border-t border-gray-100 ${className}`}
            {...props}
        >
            {children}
        </div>
    )
);

Card.displayName = 'Card';
CardHeader.displayName = 'CardHeader';
CardBody.displayName = 'CardBody';
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardBody, CardFooter };
export default Card;
