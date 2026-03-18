import React, { createContext, useContext, useEffect, useState } from 'react';

export type AccentColor = 'EMERALD' | 'BLUE' | 'INDIGO' | 'VIOLET' | 'ROSE' | 'AMBER';

export const ACCENTS: Record<AccentColor, { primary: string; hover: string; rgb: string }> = {
  EMERALD: { primary: '#059669', hover: '#047857', rgb: '5, 150, 105' },
  BLUE: { primary: '#2563eb', hover: '#1d4ed8', rgb: '37, 99, 235' },
  INDIGO: { primary: '#4f46e5', hover: '#4338ca', rgb: '79, 70, 229' },
  VIOLET: { primary: '#7c3aed', hover: '#6d28d9', rgb: '124, 58, 237' },
  ROSE: { primary: '#e11d48', hover: '#be123c', rgb: '225, 29, 72' },
  AMBER: { primary: '#d97706', hover: '#b45309', rgb: '217, 119, 6' },
};

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  displayTheme: 'light' | 'dark'; // The actual theme being displayed (resolved from system if theme is 'system')
  accentColor: AccentColor;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setAccentColor: (accent: AccentColor) => void;
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

  const [accentColor, setAccentColorState] = useState<AccentColor>(() => {
    const savedAccent = localStorage.getItem('accentColor') as AccentColor;
    return (ACCENTS[savedAccent] ? savedAccent : 'EMERALD') as AccentColor;
  });

  // Resolve display theme based on theme and system preference
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
    const accent = ACCENTS[accentColor];
    const root = document.documentElement;
    root.style.setProperty('--color-primary', accent.primary);
    root.style.setProperty('--color-primary-hover', accent.hover);
    root.style.setProperty('--color-primary-rgb', accent.rgb);
    localStorage.setItem('accentColor', accentColor);
  }, [accentColor]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'system';
      return 'light';
    });
  };

  const setAccentColor = (accent: AccentColor) => {
    setAccentColorState(accent);
  };

  return (
    <ThemeContext.Provider value={{ theme, displayTheme, accentColor, setTheme, toggleTheme, setAccentColor }}>
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
