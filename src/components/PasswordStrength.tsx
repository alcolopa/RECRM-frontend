import React from 'react';
import { Check, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface PasswordRequirement {
  label: string;
  met: boolean;
}

interface PasswordStrengthProps {
  password: string;
  showAlways?: boolean;
}

const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password, showAlways = false }) => {
  const requirements: PasswordRequirement[] = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'One lowercase letter', met: /[a-z]/.test(password) },
    { label: 'One number', met: /[0-9]/.test(password) },
    { label: 'One special character', met: /[^A-Za-z0-9]/.test(password) },
  ];

  if (!password && !showAlways) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      style={{
        marginTop: '0.5rem',
        padding: '0.75rem',
        backgroundColor: 'var(--color-bg)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--color-border)',
        fontSize: '0.75rem'
      }}
    >
      <p style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Password Requirements:</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.4rem' }}>
        {requirements.map((req, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <div style={{
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              backgroundColor: req.met ? 'rgba(22, 163, 74, 0.1)' : 'rgba(220, 38, 38, 0.1)',
              color: req.met ? 'var(--color-success)' : 'var(--color-error)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}>
              {req.met ? <Check size={10} strokeWidth={3} /> : <X size={10} strokeWidth={3} />}
            </div>
            <span style={{ 
              color: req.met ? 'var(--color-text)' : 'var(--color-text-muted)',
              transition: 'color 0.2s ease'
            }}>
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default PasswordStrength;
