/**
 * Advanced Theme System Configuration
 * Supports light, dark, gradient, glassmorphism, and custom user palettes
 * Backed by design best practices from Apple, Google, and premium AI platforms
 */

export type ThemeType = 'dark' | 'light' | 'gradient' | 'glass' | 'custom';

export interface ThemePalette {
    primary: string;
    accent: string;
    secondary: string;
    glass: string;
    border: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    success: string;
    warning: string;
    error: string;
}

export const THEME_PALETTES: Record<ThemeType, ThemePalette> = {
    dark: {
        primary: '#a855f7', // purple-600
        accent: '#ec4899', // pink-500
        secondary: '#06b6d4', // cyan-500
        glass: 'rgba(30, 30, 35, 0.8)',
        border: 'rgba(255, 255, 255, 0.1)',
        background: 'bg-gradient-to-br from-[#18181b] via-[#23232a] to-[#0a0a0a]',
        surface: 'bg-white/5',
        text: '#ffffff',
        textSecondary: 'rgba(255, 255, 255, 0.6)',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
    },
    light: {
        primary: '#9333ea', // purple-600
        accent: '#ec4899', // pink-500
        secondary: '#06b6d4', // cyan-500
        glass: 'rgba(255, 255, 255, 0.85)',
        border: 'rgba(0, 0, 0, 0.1)',
        background: 'bg-gradient-to-br from-white via-gray-100 to-gray-200',
        surface: 'bg-white/80',
        text: '#111827',
        textSecondary: 'rgba(0, 0, 0, 0.6)',
        success: '#059669',
        warning: '#d97706',
        error: '#dc2626',
    },
    gradient: {
        primary: '#a855f7',
        accent: '#ec4899',
        secondary: '#f43f5e',
        glass: 'rgba(15, 5, 23, 0.9)',
        border: 'rgba(255, 255, 255, 0.15)',
        background: 'bg-gradient-to-br from-[#0f0517] via-[#1a0f2e] to-[#050210]',
        surface: 'bg-gradient-to-br from-purple-900/30 to-pink-900/20',
        text: '#ffffff',
        textSecondary: 'rgba(255, 255, 255, 0.7)',
        success: '#34d399',
        warning: '#fbbf24',
        error: '#f87171',
    },
    glass: {
        primary: '#06b6d4', // cyan-500
        accent: '#8b5cf6', // violet-500
        secondary: '#3b82f6', // blue-500
        glass: 'rgba(255, 255, 255, 0.12)',
        border: 'rgba(255, 255, 255, 0.18)',
        background: 'bg-gradient-to-br from-[#0f0517] via-[#1a0f2e] to-[#050210]',
        surface: 'backdrop-blur-lg bg-white/10',
        text: '#ffffff',
        textSecondary: 'rgba(255, 255, 255, 0.8)',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
    },
    custom: {
        primary: '#a855f7',
        accent: '#ec4899',
        secondary: '#06b6d4',
        glass: 'rgba(15, 5, 23, 0.85)',
        border: 'rgba(255, 255, 255, 0.12)',
        background: 'bg-gradient-to-br from-[#0f0517] via-[#1a0f2e] to-[#050210]',
        surface: 'bg-white/5',
        text: '#ffffff',
        textSecondary: 'rgba(255, 255, 255, 0.65)',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
    },
};

/**
 * Theme context value interface
 */
export interface ThemeContextValue {
    theme: ThemeType;
    palette: ThemePalette;
    setTheme: (theme: ThemeType) => void;
    setPalette: (palette: Partial<ThemePalette>) => void;
}

/**
 * Get theme-specific CSS classes
 */
export function getThemeClasses(theme: ThemeType, element: 'card' | 'button' | 'input' | 'badge') {
    const baseClasses = {
        card: 'rounded-2xl border shadow-xl backdrop-blur-lg transition-all duration-300',
        button: 'px-4 py-2 rounded-lg font-semibold transition-all duration-200 hover:scale-105 active:scale-95',
        input: 'rounded-lg border bg-white/5 px-4 py-2 transition-colors duration-200 focus:outline-none focus:border-current',
        badge: 'inline-block px-3 py-1 rounded-full text-sm font-semibold',
    };

    const themeSpecific = {
        card: {
            dark: `${baseClasses.card} border-white/10 bg-white/5`,
            light: `${baseClasses.card} border-gray-200 bg-white/80`,
            gradient: `${baseClasses.card} border-fuchsia-600/30 bg-gradient-to-br from-purple-900/20 to-pink-900/10`,
            glass: `${baseClasses.card} border-white/18 bg-white/10`,
            custom: `${baseClasses.card} border-white/15 bg-white/8`,
        },
        button: {
            dark: `${baseClasses.button} bg-purple-600 text-white hover:bg-purple-500`,
            light: `${baseClasses.button} bg-purple-500 text-white hover:bg-purple-600`,
            gradient: `${baseClasses.button} bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:from-purple-500 hover:to-pink-400`,
            glass: `${baseClasses.button} bg-cyan-600/80 text-white hover:bg-cyan-500`,
            custom: `${baseClasses.button} bg-purple-600 text-white hover:bg-purple-500`,
        },
        input: {
            dark: `${baseClasses.input} border-white/10 text-white placeholder:text-white/40`,
            light: `${baseClasses.input} border-gray-300 text-gray-900 placeholder:text-gray-400`,
            gradient: `${baseClasses.input} border-purple-600/40 text-white placeholder:text-white/50`,
            glass: `${baseClasses.input} border-white/20 text-white placeholder:text-white/60`,
            custom: `${baseClasses.input} border-white/15 text-white placeholder:text-white/40`,
        },
        badge: {
            dark: `${baseClasses.badge} bg-purple-600/30 text-purple-200 border border-purple-600/50`,
            light: `${baseClasses.badge} bg-purple-100 text-purple-900 border border-purple-200`,
            gradient: `${baseClasses.badge} bg-gradient-to-r from-purple-600/40 to-pink-600/40 text-white border border-fuchsia-500/50`,
            glass: `${baseClasses.badge} bg-cyan-600/30 text-cyan-200 border border-cyan-600/50`,
            custom: `${baseClasses.badge} bg-purple-600/30 text-purple-200 border border-purple-600/50`,
        },
    };

    return themeSpecific[element][theme];
}

/**
 * Generate dynamic inline styles for custom themes
 */
export function getThemeStyles(theme: ThemeType, palette?: Partial<ThemePalette>) {
    const basePalette = THEME_PALETTES[theme];
    const customPalette = { ...basePalette, ...palette };

    return {
        '--primary-color': customPalette.primary,
        '--accent-color': customPalette.accent,
        '--secondary-color': customPalette.secondary,
        '--text-color': customPalette.text,
        '--text-secondary-color': customPalette.textSecondary,
    } as React.CSSProperties;
}
