import React, { forwardRef } from 'react';
import type { LucideIcon } from 'lucide-react';
import CustomSelect from './CustomSelect';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: LucideIcon;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon: Icon, error, helperText, className = '', style, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', width: '100%' }}>
        {label && (
          <label
            htmlFor={inputId}
            style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--color-text)',
              display: 'block'
            }}
          >
            {label}
          </label>
        )}
        <div style={{ position: 'relative', width: '100%' }}>
          {Icon && (
            <Icon
              size={18}
              color="var(--muted-foreground)"
              style={{
                position: 'absolute',
                left: '0.875rem',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none'
              }}
            />
          )}
          <input
            id={inputId}
            ref={ref}
            className={className}
            style={{
              ...style,
              paddingLeft: Icon ? '2.5rem' : style?.paddingLeft || '1rem',
              borderColor: error ? 'var(--color-error)' : style?.borderColor || 'var(--color-border)',
            }}
            {...props}
          />
        </div>
        {(error || helperText) && (
          <span
            style={{
              fontSize: '0.75rem',
              color: error ? 'var(--color-error)' : 'var(--muted-foreground)',
              marginTop: '0.125rem'
            }}
          >
            {error || helperText}
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', width: '100%' }}>
        {label && (
          <label
            htmlFor={inputId}
            style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--color-text)',
              display: 'block'
            }}
          >
            {label}
          </label>
        )}
        <div style={{ position: 'relative', width: '100%' }}>
          {Icon && (
            <Icon
              size={18}
              color="var(--muted-foreground)"
              style={{
                position: 'absolute',
                left: '0.875rem',
                top: '0.875rem',
                pointerEvents: 'none'
              }}
            />
          )}
          <textarea
            id={inputId}
            ref={ref}
            className={className}
            style={{
              ...style,
              paddingLeft: Icon ? '2.5rem' : style?.paddingLeft || '1rem',
              paddingTop: Icon ? '0.75rem' : style?.paddingTop || '0.75rem',
              borderColor: error ? 'var(--color-error)' : style?.borderColor || 'var(--color-border)',
              minHeight: style?.minHeight || '100px'
            }}
            {...props}
          />
        </div>
        {(error || helperText) && (
          <span
            style={{
              fontSize: '0.75rem',
              color: error ? 'var(--color-error)' : 'var(--muted-foreground)',
              marginTop: '0.125rem'
            }}
          >
            {error || helperText}
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
