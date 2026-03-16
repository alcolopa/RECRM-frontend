import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Option {
  value: string | number;
  label: string;
}

interface CustomSelectProps {
  label?: string;
  options: Option[];
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  icon?: LucideIcon;
  error?: string;
  searchable?: boolean;
  disabled?: boolean;
  id?: string;
  name?: string;
  required?: boolean;
  style?: React.CSSProperties;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select an option...',
  icon: Icon,
  error,
  searchable = false,
  disabled = false,
  id,
  required,
  style
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  
  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (option: Option) => {
    onChange(option.value);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', width: '100%', position: 'relative' }}>
      {label && (
        <label htmlFor={id} style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)' }}>
          {label}{required && '*'}
        </label>
      )}

      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius)',
          border: `1px solid ${error ? 'var(--color-error)' : (isOpen ? 'var(--color-primary)' : 'var(--color-border)')}`,
          background: disabled ? 'var(--color-bg)' : 'var(--color-surface)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          minHeight: '2.75rem',
          transition: 'all 0.2s ease',
          opacity: disabled ? 0.6 : 1,
          boxShadow: isOpen ? '0 0 0 2px rgba(var(--color-primary-rgb), 0.1)' : 'none',
          ...style
        }}
      >
        {Icon && <Icon size={18} color="var(--muted-foreground)" style={{ flexShrink: 0 }} />}
        
        <div style={{ flex: 1, minWidth: 0 }}>
          {selectedOption ? (
            <span style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--color-text)' }}>
              {selectedOption.label}
            </span>
          ) : (
            <span style={{ fontSize: '0.9375rem', color: 'var(--muted-foreground)' }}>
              {placeholder}
            </span>
          )}
        </div>

        <ChevronDown 
          size={18} 
          color="var(--muted-foreground)"
          style={{ 
            transform: isOpen ? 'rotate(180deg)' : 'none', 
            transition: 'transform 0.2s',
            flexShrink: 0 
          }} 
        />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '0.5rem',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 1000,
              overflow: 'hidden'
            }}
          >
            {searchable && (
              <div style={{ padding: '0.75rem', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)' }}>
                <div style={{ position: 'relative' }}>
                  <Search 
                    size={14} 
                    style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} 
                  />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    onClick={e => e.stopPropagation()}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem 0.5rem 2.25rem',
                      borderRadius: '0.375rem',
                      border: '1px solid var(--color-border)',
                      background: 'var(--color-surface)',
                      outline: 'none',
                      fontSize: '0.8125rem',
                      color: 'var(--color-text)'
                    }}
                  />
                </div>
              </div>
            )}

            <div style={{ maxHeight: '250px', overflowY: 'auto', padding: '0.25rem' }}>
              {filteredOptions.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {filteredOptions.map(option => (
                    <div
                      key={option.value}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(option);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.625rem 0.75rem',
                        borderRadius: '0.375rem',
                        cursor: 'pointer',
                        background: value === option.value ? 'rgba(var(--color-primary-rgb), 0.05)' : 'transparent',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(var(--color-primary-rgb), 0.05)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = value === option.value ? 'rgba(var(--color-primary-rgb), 0.05)' : 'transparent')}
                    >
                      <span style={{ 
                        fontSize: '0.875rem', 
                        fontWeight: value === option.value ? 600 : 400,
                        color: value === option.value ? 'var(--color-primary)' : 'var(--color-text)'
                      }}>
                        {option.label}
                      </span>
                      {value === option.value && (
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-primary)' }} />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--muted-foreground)', fontSize: '0.8125rem' }}>
                  No options found
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <span style={{ fontSize: '0.75rem', color: 'var(--color-error)', marginTop: '0.125rem' }}>
          {error}
        </span>
      )}
    </div>
  );
};

export default CustomSelect;
