import React, { forwardRef } from 'react';
import type { LucideIcon } from 'lucide-react';

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
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = '', style, id, ...props }, ref) => {
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
        <textarea
          id={inputId}
          ref={ref}
          className={className}
          style={{
            ...style,
            borderColor: error ? 'var(--color-error)' : style?.borderColor || 'var(--color-border)',
            minHeight: style?.minHeight || '100px'
          }}
          {...props}
        />
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

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  icon?: LucideIcon;
  error?: string;
  options: { value: string | number; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, icon: Icon, error, options, className = '', style, id, ...props }, ref) => {
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
                pointerEvents: 'none',
                zIndex: 1
              }}
            />
          )}
          <select
            id={inputId}
            ref={ref}
            className={className}
            style={{
              ...style,
              paddingLeft: Icon ? '2.5rem' : style?.paddingLeft || '1rem',
              borderColor: error ? 'var(--color-error)' : style?.borderColor || 'var(--color-border)',
              appearance: 'none',
              backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748B\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.75rem center',
              backgroundSize: '1.25rem'
            }}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        {error && (
          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--color-error)',
              marginTop: '0.125rem'
            }}
          >
            {error}
          </span>
        )}
      </div>
    );
  }
);

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
Select.displayName = 'Select';
Checkbox.displayName = 'Checkbox';
