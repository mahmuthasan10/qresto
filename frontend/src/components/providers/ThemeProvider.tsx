'use client';

import { useEffect } from 'react';

interface ThemeSettings {
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
    borderRadius?: string;
}

interface ThemeProviderProps {
    themeSettings?: ThemeSettings | null;
    children: React.ReactNode;
}

export default function ThemeProvider({ themeSettings, children }: ThemeProviderProps) {
    useEffect(() => {
        if (themeSettings) {
            const root = document.documentElement;

            if (themeSettings.primaryColor) {
                root.style.setProperty('--primary', themeSettings.primaryColor);
                // Calculate darker shade for hover if needed, or just use CSS color-mix in global css
            }

            if (themeSettings.secondaryColor) {
                root.style.setProperty('--secondary', themeSettings.secondaryColor);
            }

            if (themeSettings.fontFamily) {
                root.style.setProperty('--font-family', themeSettings.fontFamily);
            }

            if (themeSettings.borderRadius) {
                root.style.setProperty('--radius', themeSettings.borderRadius);
            }
        }
    }, [themeSettings]);

    return <>{children}</>;
}
