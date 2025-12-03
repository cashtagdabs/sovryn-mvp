/**
 * Theme Context Provider
 * Manages global theme state and provides access throughout the application
 * Supports persistence to localStorage for user preferences
 */

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeType, ThemePalette, THEME_PALETTES } from '@/app/lib/theme';

interface ThemeContextValue {
  theme: ThemeType;
  palette: ThemePalette;
  setTheme: (theme: ThemeType) => void;
  updatePalette: (palette: Partial<ThemePalette>) => void;
  resetPalette: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeType>('gradient');
  const [palette, setPaletteState] = useState<ThemePalette>(THEME_PALETTES.gradient);
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('sovryn-theme') as ThemeType | null;
    const savedPalette = localStorage.getItem('sovryn-palette');

    if (savedTheme && savedTheme in THEME_PALETTES) {
      setThemeState(savedTheme);
      setPaletteState(THEME_PALETTES[savedTheme]);
    }

    if (savedPalette) {
      try {
        const customPalette = JSON.parse(savedPalette);
        setPaletteState({ ...THEME_PALETTES[savedTheme || 'gradient'], ...customPalette });
      } catch (e) {
        console.error('Failed to parse saved palette:', e);
      }
    }

    setMounted(true);
  }, []);

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
    setPaletteState(THEME_PALETTES[newTheme]);
    localStorage.setItem('sovryn-theme', newTheme);
    localStorage.removeItem('sovryn-palette');
  };

  const updatePalette = (newPalette: Partial<ThemePalette>) => {
    const updated = { ...palette, ...newPalette };
    setPaletteState(updated);
    localStorage.setItem('sovryn-palette', JSON.stringify(newPalette));
  };

  const resetPalette = () => {
    const defaultPalette = THEME_PALETTES[theme];
    setPaletteState(defaultPalette);
    localStorage.removeItem('sovryn-palette');
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        palette,
        setTheme,
        updatePalette,
        resetPalette,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
