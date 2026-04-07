import React, { forwardRef } from 'react';
import type { LucideIcon } from 'lucide-react';
import CustomSelect from './CustomSelect';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: LucideIcon;
  error?: string;
  helperText?: string;
  rightElement?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon: Icon, error, helperText, rightElement, className = '', style, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {label && (
            <label
              htmlFor={inputId}
              style={{
                fontSize: '0.8125rem',
                fontWeight: 700,
                color: 'var(--color-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.025em',
                display: 'block'
              }}
            >
              {label}{props.required && '*'}
            </label>
          )}
          {error && (
            <span
              style={{
                fontSize: '0.75rem',
                color: 'var(--color-error)',
                fontWeight: 600
              }}
            >
              {error}
            </span>
          )}
        </div>
        <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
          {Icon && (
            <Icon
              size={18}
              color={error ? 'var(--color-error)' : 'var(--muted-foreground)'}
              style={{
                position: 'absolute',
                left: '0.875rem',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
                opacity: 0.8,
                zIndex: 2
              }}
            />
          )}
          <input
            id={inputId}
            ref={ref}
            className={className}
            style={{
              ...style,
              paddingLeft: Icon ? '2.5rem' : style?.paddingLeft || '0.875rem',
              paddingRight: rightElement ? '2.75rem' : style?.paddingRight || '0.875rem',
              borderColor: error ? 'var(--color-error)' : style?.borderColor || 'var(--color-border)',
              boxShadow: error ? '0 0 0 1px var(--color-error), 0 0 0 4px rgba(220, 38, 38, 0.1)' : style?.boxShadow,
              zIndex: 1
            }}
            {...props}
          />
          {rightElement && (
            <div style={{
              position: 'absolute',
              right: '0.25rem',
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2
            }}>
              {rightElement}
            </div>
          )}
        </div>
        {helperText && !error && (
          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--muted-foreground)',
              marginTop: '0.125rem'
            }}
          >
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  icon?: LucideIcon;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, icon: Icon, error, helperText, className = '', style, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {label && (
            <label
              htmlFor={inputId}
              style={{
                fontSize: '0.8125rem',
                fontWeight: 700,
                color: 'var(--color-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.025em',
                display: 'block'
              }}
            >
              {label}{props.required && '*'}
            </label>
          )}
          {error && (
            <span
              style={{
                fontSize: '0.75rem',
                color: 'var(--color-error)',
                fontWeight: 600
              }}
            >
              {error}
            </span>
          )}
        </div>
        <div style={{ position: 'relative', width: '100%' }}>
          {Icon && (
            <Icon
              size={18}
              color={error ? 'var(--color-error)' : 'var(--muted-foreground)'}
              style={{
                position: 'absolute',
                left: '0.875rem',
                top: '0.875rem',
                pointerEvents: 'none',
                opacity: 0.8
              }}
            />
          )}
          <textarea
            id={inputId}
            ref={ref}
            className={className}
            style={{
              ...style,
              paddingLeft: Icon ? '2.5rem' : style?.paddingLeft || '0.875rem',
              paddingTop: Icon ? '0.75rem' : style?.paddingTop || '0.75rem',
              borderColor: error ? 'var(--color-error)' : style?.borderColor || 'var(--color-border)',
              boxShadow: error ? '0 0 0 1px var(--color-error), 0 0 0 4px rgba(220, 38, 38, 0.1)' : style?.boxShadow,
              minHeight: style?.minHeight || '100px'
            }}
            {...props}
          />
        </div>
        {helperText && !error && (
          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--muted-foreground)',
              marginTop: '0.125rem'
            }}
          >
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

interface SelectProps {
  label?: string;
  icon?: LucideIcon;
  error?: string;
  helperText?: string;
  options: { value: string | number; label: string }[];
  value?: string | number;
  onChange?: (e: any) => void;
  placeholder?: string;
  searchable?: boolean;
  disabled?: boolean;
  id?: string;
  name?: string;
  required?: boolean;
  style?: React.CSSProperties;
}

export const Select: React.FC<SelectProps> = ({
  label,
  icon,
  error,
  helperText,
  options,
  value = '',
  onChange,
  placeholder,
  searchable,
  disabled,
  id,
  name,
  required,
  style
}) => {
  return (
    <CustomSelect
      label={label}
      icon={icon}
      error={error}
      helperText={helperText}
      options={options}
      value={value}
      onChange={(val) => onChange?.({ target: { value: val, name, id } } as any)}
      placeholder={placeholder}
      searchable={searchable}
      disabled={disabled}
      id={id}
      name={name}
      required={required}
      style={style}
    />
  );
};

export const Checkbox = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { label: string }>(
  ({ label, id, style, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem',
          cursor: 'pointer',
          color: 'var(--color-text)',
          userSelect: 'none'
        }}
      >
        <input
          id={inputId}
          ref={ref}
          type="checkbox"
          style={{
            width: '1rem',
            height: '1rem',
            borderRadius: '0.25rem',
            accentColor: 'var(--color-primary)',
            cursor: 'pointer',
            ...style
          }}
          {...props}
        />
        {label}
      </label>
    );
  }
);

Input.displayName = 'Input';
Textarea.displayName = 'Textarea';
Checkbox.displayName = 'Checkbox';
