import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { userService, type AgentCommissionConfig } from '../api/users';
import CommissionInput from './CommissionInput';
import Button from './Button';
import { getErrorMessage } from '../utils/errors';

interface AgentCommissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentId: string;
  agentName: string;
}

const AgentCommissionModal: React.FC<AgentCommissionModalProps> = ({
  isOpen,
  onClose,
  agentId,
  agentName,
}) => {
  const [config, setConfig] = useState<Partial<AgentCommissionConfig>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isOpen && agentId) {
      fetchConfig();
    }
  }, [isOpen, agentId]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const fetchConfig = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await userService.getCommissionConfig(agentId);
      setConfig(response.data || {});
    } catch (err) {
      console.error('Failed to fetch agent commission config', err);
      setError('Failed to load commission settings.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      await userService.updateCommissionConfig(agentId, config);
      onClose();
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to save commission settings.'));
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const currentOverlayStyle = isMobile ? mobileOverlayStyle : modalOverlayStyle;
  const currentContentStyle = isMobile ? mobileContentStyle : modalContentStyle;

  return (
    <div style={currentOverlayStyle}>
      <motion.div
        initial={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.95, y: 20 }}
        animate={isMobile ? { y: 0 } : { opacity: 1, scale: 1, y: 0 }}
        exit={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        style={currentContentStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={modalHeaderStyle}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Commission Overrides</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Configuring personal rates for {agentName}</p>
          </div>
          <button onClick={onClose} style={closeButtonStyle}>
            <X size={24} />
          </button>
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <Loader2 className="animate-spin" color="var(--color-primary)" />
          </div>
        ) : (
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: isMobile ? '5rem' : 0 }}>
            {error && (
              <div style={errorStyle}>
                <Info size={16} /> {error}
              </div>
            )}

            <div style={sectionStyle}>
              <h3 style={sectionTitleStyle}>Professional Fee Overrides</h3>
              <div style={gridStyle}>
                <CommissionInput
                  label="Rental Fee Override"
                  value={config.rentAgentValue ?? ''}
                  type={config.rentAgentType || 'PERCENTAGE'}
                  onChange={(val, type) => setConfig({ ...config, rentAgentValue: val, rentAgentType: type })}
                  placeholder="Org Default"
                  helperText="Agent's fee from the agency for rental deals"
                />
                <CommissionInput
                  label="Sales Fee Override"
                  value={config.saleAgentValue ?? ''}
                  type={config.saleAgentType || 'PERCENTAGE'}
                  onChange={(val, type) => setConfig({ ...config, saleAgentValue: val, saleAgentType: type })}
                  placeholder="Org Default"
                  helperText="Agent's fee from the agency for sales deals"
                />
              </div>
            </div>

            <div style={isMobile ? mobileFooterStyle : modalFooterStyle}>
              <Button type="button" variant="outline" onClick={onClose} fullWidth={isMobile}>Cancel</Button>
              <Button type="submit" isLoading={isSaving} leftIcon={<Save size={18} />} fullWidth={isMobile}>
                Save Overrides
              </Button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

const mobileOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'var(--color-bg)',
  zIndex: 1000,
};

const mobileContentStyle: React.CSSProperties = {
  backgroundColor: 'var(--color-bg)',
  width: '100%',
  height: '100%',
  overflowY: 'auto',
  padding: '1.5rem',
  display: 'flex',
  flexDirection: 'column'
};

const mobileFooterStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  padding: '1.5rem',
  backgroundColor: 'var(--color-surface)',
  borderTop: '1px solid var(--color-border)',
  display: 'flex',
  gap: '1rem',
  zIndex: 10
};

const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: '1rem'
};

const modalContentStyle: React.CSSProperties = {
  backgroundColor: 'var(--color-surface)',
  borderRadius: '1rem',
  width: '100%',
  maxWidth: '600px',
  maxHeight: '90vh',
  overflowY: 'auto',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  padding: '2rem'
};

const modalHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '2rem',
  borderBottom: '1px solid var(--color-border)',
  paddingBottom: '1rem'
};

const closeButtonStyle: React.CSSProperties = {
  padding: '0.5rem',
  borderRadius: '0.5rem',
  border: 'none',
  backgroundColor: 'transparent',
  color: 'var(--color-text-muted)',
  cursor: 'pointer',
  transition: 'all 0.2s ease'
};

const sectionStyle: React.CSSProperties = {
  backgroundColor: 'var(--color-bg)',
  padding: '1.25rem',
  borderRadius: '0.75rem',
  border: '1px solid var(--color-border)'
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: '0.875rem',
  fontWeight: 700,
  color: 'var(--color-primary)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '1rem'
};

const gridStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.25rem'
};

const modalFooterStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '1rem',
  marginTop: '1rem',
  paddingTop: '1rem',
  borderTop: '1px solid var(--color-border)'
};

const errorStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.75rem',
  backgroundColor: 'rgba(239, 68, 68, 0.1)',
  color: 'var(--color-error)',
  borderRadius: '0.5rem',
  fontSize: '0.875rem'
};

export default AgentCommissionModal;
