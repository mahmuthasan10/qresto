'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';

interface Tab {
    id: string;
    label: string;
    icon?: ReactNode;
    disabled?: boolean;
}

interface TabsProps {
    tabs: Tab[];
    activeTab: string;
    onTabChange: (tabId: string) => void;
    variant?: 'default' | 'pills' | 'underline';
    fullWidth?: boolean;
}

const Tabs = ({
    tabs,
    activeTab,
    onTabChange,
    variant = 'default',
    fullWidth = false,
}: TabsProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [showLeftShadow, setShowLeftShadow] = useState(false);
    const [showRightShadow, setShowRightShadow] = useState(false);

    const checkScroll = () => {
        const container = containerRef.current;
        if (container) {
            setShowLeftShadow(container.scrollLeft > 0);
            setShowRightShadow(
                container.scrollLeft < container.scrollWidth - container.clientWidth - 1
            );
        }
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        return () => window.removeEventListener('resize', checkScroll);
    }, []);

    const baseTabStyles = 'flex items-center gap-2 font-medium transition-all duration-200 whitespace-nowrap';

    const variants = {
        default: {
            container: 'bg-gray-100 p-1 rounded-lg',
            tab: 'px-4 py-2 rounded-md text-gray-600 hover:text-gray-900',
            active: 'bg-white text-gray-900 shadow-sm',
        },
        pills: {
            container: 'gap-2',
            tab: 'px-4 py-2 rounded-full text-gray-600 hover:bg-gray-100',
            active: 'bg-orange-500 text-white hover:bg-orange-500',
        },
        underline: {
            container: 'border-b border-gray-200 gap-4',
            tab: 'px-1 py-3 text-gray-600 hover:text-gray-900 border-b-2 border-transparent -mb-px',
            active: 'text-orange-600 border-orange-500',
        },
    };

    const currentVariant = variants[variant];

    return (
        <div className="relative">
            {/* Left shadow */}
            {showLeftShadow && (
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
            )}

            {/* Tabs container */}
            <div
                ref={containerRef}
                className={`flex overflow-x-auto scrollbar-hide ${currentVariant.container}`}
                onScroll={checkScroll}
            >
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => !tab.disabled && onTabChange(tab.id)}
                        disabled={tab.disabled}
                        className={`
                            ${baseTabStyles}
                            ${currentVariant.tab}
                            ${activeTab === tab.id ? currentVariant.active : ''}
                            ${tab.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                            ${fullWidth ? 'flex-1 justify-center' : ''}
                        `}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Right shadow */}
            {showRightShadow && (
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
            )}
        </div>
    );
};

export default Tabs;
