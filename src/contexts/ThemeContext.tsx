import React, { createContext, useContext, useEffect, useState } from 'react';

export const ACCENTS = {
  EMERALD: '#059669',
  BLUE: '#2563eb',
  INDIGO: '#4f46e5',
  VIOLET: '#7c3aed',
  ROSE: '#e11d48',
  AMBER: '#d97706',
};

// Helper to convert hex to RGB
export const hexToRgb = (hex: string): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
};

// Helper to darken a color for hover state
export const darkenColor = (hex: string, amount: number = 20): string => {
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - amount);
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - amount);
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - amount);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  displayTheme: 'light' | 'dark';
  accentColor: string;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setAccentColor: (accent: string) => void;
  resetToDefault: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
      return savedTheme;
    }
    return 'system';
  });

  const [displayTheme, setDisplayTheme] = useState<'light' | 'dark'>('light');

  const [accentColor, setAccentColorState] = useState<string>(() => {
    const savedAccent = localStorage.getItem('accentColor');
    // If it's a preset key, map it to its hex, otherwise use the hex directly or default to EMERALD hex
    if (savedAccent && (ACCENTS as any)[savedAccent]) {
      return (ACCENTS as any)[savedAccent];
    }
    return savedAccent || ACCENTS.EMERALD;
  });

  useEffect(() => {
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
        setDisplayTheme(e.matches ? 'dark' : 'light');
      };
      
      handleChange(mediaQuery);
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      setDisplayTheme(theme);
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', displayTheme);
    localStorage.setItem('theme', theme);
  }, [theme, displayTheme]);

  useEffect(() => {
    // If it's a legacy preset key, we convert it to hex for the root styles
    const hex = (ACCENTS as any)[accentColor] || (accentColor.startsWith('#') ? accentColor : ACCENTS.EMERALD);
    
    const root = document.documentElement;
    root.style.setProperty('--color-primary', hex);
    root.style.setProperty('--color-primary-hover', darkenColor(hex));
    root.style.setProperty('--color-primary-rgb', hexToRgb(hex));
    localStorage.setItem('accentColor', accentColor);
  }, [accentColor]);

  const setTheme = React.useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  const toggleTheme = React.useCallback(() => {
    setThemeState((prev) => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'system';
      return 'light';
    });
  }, []);

  const setAccentColor = React.useCallback((accent: string) => {
    setAccentColorState(accent);
  }, []);

  const resetToDefault = React.useCallback(() => {
    setThemeState('system');
    setAccentColorState(ACCENTS.EMERALD);
    localStorage.removeItem('theme');
    localStorage.removeItem('accentColor');
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, displayTheme, accentColor, setTheme, toggleTheme, setAccentColor, resetToDefault }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
