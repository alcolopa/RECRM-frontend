import React from 'react';
import { type CommissionType } from '../api/organization';
import { Percent, DollarSign, X } from 'lucide-react';

interface CommissionInputProps {
  label: string;
  value: number | string | null | undefined;
  type: CommissionType;
  onChange: (value: number, type: CommissionType) => void;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  placeholder?: string;
}

const CommissionInput: React.FC<CommissionInputProps> = ({
  label,
  value,
  type,
  onChange,
  error,
  helperText,
  disabled = false,
  placeholder,
}) => {
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    if (rawValue === '') {
      onChange(null as any, type);
      return;
    }
    const val = parseFloat(rawValue);
    if (!isNaN(val)) {
      onChange(val, type);
    }
  };

  const handleTypeChange = (newType: CommissionType) => {
    onChange(Number(value) || 0, newType);
  };

  const displayValue = value === 0 || value === '0' ? '0' : (value || '');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', width: '100%' }}>
      <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)' }}>
        {label}
      </label>
      
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.5rem',
        width: '100%'
      }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <div style={{ 
            position: 'absolute', 
            left: '0.75rem', 
            top: '50%', 
            transform: 'translateY(-50%)', 
            color: 'var(--color-text-muted)',
            display: 'flex',
            alignItems: 'center'
          }}>
            {type === 'FIXED' ? <DollarSign size={14} /> : type === 'PERCENTAGE' ? <Percent size={14} /> : <X size={14} />}
          </div>
          <input
            type="number"
            step="0.01"
            value={displayValue}
            onChange={handleValueChange}
            onFocus={(e) => e.target.select()}
            disabled={disabled}
            placeholder={placeholder}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem 0.5rem 2rem',
              borderRadius: 'var(--radius)',
              border: `1px solid ${error ? 'var(--color-error)' : 'var(--color-border)'}`,
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              fontSize: '0.875rem',
              outline: 'none',
              transition: 'all 0.2s ease',
            }}
          />
        </div>

        <div style={{ 
          display: 'flex', 
          backgroundColor: 'var(--color-bg)', 
          padding: '4px', 
          borderRadius: 'var(--radius)',
          border: '1px solid var(--color-border)',
          gap: '2px'
        }}>
          {(['PERCENTAGE', 'FIXED', 'MULTIPLIER'] as CommissionType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => handleTypeChange(t)}
              disabled={disabled}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: 'calc(var(--radius) - 4px)',
                fontSize: '0.8125rem',
                fontWeight: 800,
                cursor: 'pointer',
                border: 'none',
                backgroundColor: type === t ? 'var(--color-primary)' : 'transparent',
                color: type === t ? 'white' : 'var(--color-text-muted)',
                transition: 'all 0.2s ease',
                minWidth: '2.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {t === 'PERCENTAGE' ? '%' : t === 'FIXED' ? '$' : 'x'}
            </button>
          ))}
        </div>
      </div>
      
      {error && (
        <span style={{ fontSize: '0.75rem', color: 'var(--color-error)', fontWeight: 500 }}>
          {error}
        </span>
      )}
      {helperText && !error && (
        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
          {helperText}
        </span>
      )}
    </div>
  );
};

export default CommissionInput;
