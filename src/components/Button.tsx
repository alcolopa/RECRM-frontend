import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'success' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  style = {},
  disabled,
  ...props
}) => {
  const variantClass = `btn-${variant}`;
  const sizeClass = size !== 'md' ? `btn-${size}` : '';
  const fullWidthStyle = fullWidth ? { width: '100%' } : {};
  
  const combinedClassName = `btn ${variantClass} ${sizeClass} ${className}`.trim();
  const combinedStyle = { ...fullWidthStyle, ...style };

  return (
    <button
      className={combinedClassName}
      style={combinedStyle}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="animate-spin" size={size === 'sm' ? 14 : size === 'lg' ? 22 : 18} style={{ marginRight: children ? '0.5rem' : 0 }} />
      ) : leftIcon ? (
        <span style={{ marginRight: children ? '0.5rem' : 0, display: 'flex' }}>{leftIcon}</span>
      ) : null}
      
      {children}

      {!isLoading && rightIcon && (
        <span style={{ marginLeft: children ? '0.5rem' : 0, display: 'flex' }}>{rightIcon}</span>
      )}
    </button>
  );
};

export default Button;
