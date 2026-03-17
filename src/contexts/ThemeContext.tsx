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

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  accentColor: AccentColor;
  toggleTheme: () => void;
  setAccentColor: (accent: AccentColor) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  const [accentColor, setAccentColorState] = useState<AccentColor>(() => {
    const savedAccent = localStorage.getItem('accentColor') as AccentColor;
    return (ACCENTS[savedAccent] ? savedAccent : 'EMERALD') as AccentColor;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const accent = ACCENTS[accentColor];
    const root = document.documentElement;
    root.style.setProperty('--color-primary', accent.primary);
    root.style.setProperty('--color-primary-hover', accent.hover);
    root.style.setProperty('--color-primary-rgb', accent.rgb);
    localStorage.setItem('accentColor', accentColor);
  }, [accentColor]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setAccentColor = (accent: AccentColor) => {
    setAccentColorState(accent);
  };

  return (
    <ThemeContext.Provider value={{ theme, accentColor, toggleTheme, setAccentColor }}>
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
