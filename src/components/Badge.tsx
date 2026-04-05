import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: React.CSSProperties;
}

const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '',
  style = {}
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary': return { backgroundColor: 'var(--color-primary)', color: '#fff' };
      case 'secondary': return { backgroundColor: 'var(--bg-secondary)', color: 'var(--color-text)' };
      case 'success': return { backgroundColor: 'var(--color-success)', color: '#fff' };
      case 'warning': return { backgroundColor: 'var(--color-warning)', color: '#fff' };
      case 'danger': return { backgroundColor: 'var(--color-error)', color: '#fff' };
      case 'info': return { backgroundColor: '#3b82f6', color: '#fff' };
      case 'outline': return { backgroundColor: 'transparent', color: 'var(--color-text-muted)', border: '1px solid var(--border)' };
      default: return { backgroundColor: 'var(--color-primary)', color: '#fff' };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm': return { padding: '0.125rem 0.375rem', fontSize: '0.65rem' };
      case 'md': return { padding: '0.25rem 0.625rem', fontSize: '0.75rem' };
      case 'lg': return { padding: '0.375rem 0.875rem', fontSize: '0.875rem' };
      default: return { padding: '0.25rem 0.625rem', fontSize: '0.75rem' };
    }
  };

  return (
    <span 
      className={`badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '9999px',
        fontWeight: 600,
        whiteSpace: 'nowrap',
        ...getVariantStyles(),
        ...getSizeStyles(),
        ...style
      }}
    >
      {children}
    </span>
  );
};

export default Badge;
