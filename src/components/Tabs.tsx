import React from 'react';
import { motion } from 'framer-motion';

export interface TabOption {
  id: string;
  label: string;
  icon?: React.ElementType;
  badge?: string | number;
}

interface TabsProps {
  options: TabOption[];
  activeTab: string;
  onTabChange: (id: string) => void;
  variant?: 'pills' | 'underline';
  fullWidth?: boolean;
}

const Tabs: React.FC<TabsProps> = ({ 
  options, 
  activeTab, 
  onTabChange, 
  variant = 'pills',
  fullWidth = false 
}) => {
  if (variant === 'underline') {
    return (
      <div style={{ 
        display: 'flex', 
        borderBottom: '1px solid var(--color-border)',
        width: fullWidth ? '100%' : 'auto',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }} className="no-scrollbar">
        {options.map((option) => {
          const isActive = activeTab === option.id;
          const Icon = option.icon;
          
          return (
            <button
              key={option.id}
              onClick={() => onTabChange(option.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '1rem 1.25rem',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                position: 'relative',
                color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.875rem',
                whiteSpace: 'nowrap',
                transition: 'color 0.2s ease',
                flex: fullWidth ? 1 : 'none',
                justifyContent: 'center'
              }}
            >
              {Icon && <Icon size={18} />}
              <span>{option.label}</span>
              {option.badge !== undefined && (
                <span style={{
                  fontSize: '0.7rem',
                  padding: '0.125rem 0.375rem',
                  borderRadius: '1rem',
                  backgroundColor: isActive ? 'rgba(var(--color-primary-rgb), 0.1)' : 'var(--color-bg)',
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  marginLeft: '0.25rem'
                }}>
                  {option.badge}
                </span>
              )}
              {isActive && (
                <motion.div
                  layoutId="underline"
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    backgroundColor: 'var(--color-primary)',
                    zIndex: 1
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Pills Variant (like the one in Calendar)
  return (
    <div style={{ 
      display: 'inline-flex', 
      background: 'var(--color-bg)', // Using background color for the track
      padding: '0.25rem', 
      borderRadius: '0.625rem',
      border: '1px solid var(--color-border)',
      width: fullWidth ? '100%' : 'auto',
      position: 'relative'
    }}>
      {options.map((option) => {
        const isActive = activeTab === option.id;
        const Icon = option.icon;
        
        return (
          <button
            key={option.id}
            onClick={() => onTabChange(option.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              position: 'relative',
              color: isActive ? 'var(--color-text)' : 'var(--color-text-muted)',
              fontWeight: 600,
              fontSize: '0.8125rem',
              whiteSpace: 'nowrap',
              zIndex: 1,
              flex: fullWidth ? 1 : 'none',
              justifyContent: 'center',
              transition: 'color 0.2s ease'
            }}
          >
            {isActive && (
              <motion.div
                layoutId="pill-background"
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'var(--color-surface)', // Using surface color for the active pill
                  borderRadius: '0.4rem',
                  boxShadow: 'var(--shadow-sm)',
                  zIndex: -1
                }}
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            {Icon && <Icon size={16} />}
            <span>{option.label}</span>
            {option.badge !== undefined && (
              <span style={{
                fontSize: '0.7rem',
                padding: '0.125rem 0.375rem',
                borderRadius: '1rem',
                backgroundColor: isActive ? 'var(--color-bg)' : 'rgba(0,0,0,0.05)',
                marginLeft: '0.25rem'
              }}>
                {option.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;
