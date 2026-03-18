import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import Button from './Button';

interface ThemeSelectorProps {
  variant?: 'ghost' | 'outline';
  showLabel?: boolean;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ 
  variant = 'ghost',
  showLabel = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const dropdownItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    width: '100%',
    padding: '0.5rem 0.75rem',
    border: 'none',
    background: 'none',
    borderRadius: '0.375rem',
    fontSize: '0.8125rem',
    color: 'var(--color-text)',
    cursor: 'pointer',
    textAlign: 'left',
    position: 'relative',
    transition: 'background-color 0.2s ease',
  };

  const dotStyle: React.CSSProperties = {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-primary)',
    position: 'absolute',
    right: '0.75rem',
    top: '50%',
    transform: 'translateY(-50%)'
  };

  return (
    <div style={{ position: 'relative' }} ref={containerRef}>
      <Button 
        variant={variant}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Theme settings"
        style={{ 
          borderRadius: showLabel ? 'var(--radius)' : '50%', 
          width: showLabel ? 'auto' : '40px', 
          height: '40px',
          padding: showLabel ? '0 1rem' : 0,
          backgroundColor: isOpen ? 'rgba(var(--color-primary-rgb), 0.05)' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem'
        }}
        title={`Theme: ${theme.charAt(0).toUpperCase() + theme.slice(1)}`}
      >
        {theme === 'light' ? <Sun size={20} /> : theme === 'dark' ? <Moon size={20} /> : <Monitor size={20} />}
        {showLabel && <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Theme</span>}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            style={{
              position: 'absolute',
              right: 0,
              top: '110%',
              width: '180px',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius)',
              boxShadow: 'var(--shadow-xl)',
              border: '1px solid var(--color-border)',
              overflow: 'hidden',
              padding: '0.4rem',
              zIndex: 1100
            }}
          >
            <button 
              onClick={() => { setTheme('light'); setIsOpen(false); }} 
              style={{ ...dropdownItemStyle, color: theme === 'light' ? 'var(--color-primary)' : 'var(--color-text)' }}
              className="theme-dropdown-item"
            >
              <Sun size={16} />
              <span>Light</span>
              {theme === 'light' && <div style={dotStyle} />}
            </button>
            <button 
              onClick={() => { setTheme('dark'); setIsOpen(false); }} 
              style={{ ...dropdownItemStyle, color: theme === 'dark' ? 'var(--color-primary)' : 'var(--color-text)' }}
              className="theme-dropdown-item"
            >
              <Moon size={16} />
              <span>Dark</span>
              {theme === 'dark' && <div style={dotStyle} />}
            </button>
            <button 
              onClick={() => { setTheme('system'); setIsOpen(false); }} 
              style={{ ...dropdownItemStyle, color: theme === 'system' ? 'var(--color-primary)' : 'var(--color-text)' }}
              className="theme-dropdown-item"
            >
              <Monitor size={16} />
              <span>System</span>
              {theme === 'system' && <div style={dotStyle} />}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeSelector;
