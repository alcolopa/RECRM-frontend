import { useState } from 'react';
import { UserCheck, Info, ArrowRight } from 'lucide-react';
import { type Lead } from '../api/leads';
import { ContactType } from '../api/contacts';
import Modal from './Modal';
import Button from './Button';
import { Select, Textarea } from './Input';
import { mapBackendErrors, getErrorMessage } from '../utils/errors';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

interface LeadConvertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConvert: (data: { type: ContactType; notes?: string }) => Promise<void>;
  lead: Lead;
}

const LeadConvertModal: React.FC<LeadConvertModalProps> = ({ 
  isOpen, 
  onClose, 
  onConvert, 
  lead 
}) => {
  const [type, setType] = useState<ContactType>(ContactType.BUYER);
  const [notes, setNotes] = useState(lead.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!type) newErrors.type = 'Please select a contact type';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await onConvert({ type, notes });
      onClose();
    } catch (err: any) {
      console.error('Failed to convert lead', err);
      setError(getErrorMessage(err, 'Failed to convert lead. Please try again.'));
      const backendErrors = mapBackendErrors(err);
      if (Object.keys(backendErrors).length > 0) {
        setErrors(backendErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Convert Lead to Contact"
      maxWidth="600px"
    >
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              padding: '1rem',
              marginBottom: '1rem',
              background: 'rgba(220, 38, 38, 0.1)',
              color: 'var(--color-error)',
              borderRadius: 'var(--radius)',
              fontSize: '0.875rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              border: '1px solid var(--color-error)'
            }}
          >
            {error}
            <button
              type="button"
              onClick={() => setError(null)}
              style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: '0.25rem' }}
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ 
          padding: '1rem', 
          backgroundColor: 'var(--color-bg)', 
          borderRadius: 'var(--radius)', 
          display: 'flex', 
          gap: '1rem', 
          alignItems: 'center',
          border: '1px solid var(--color-border)'
        }}>
          <div style={{ 
            width: '3rem', 
            height: '3rem', 
            borderRadius: '50%', 
            backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'var(--color-primary)',
            fontSize: '1.25rem',
            fontWeight: 700
          }}>
            {lead.firstName[0]}{lead.lastName[0]}
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ fontWeight: 700 }}>{lead.firstName} {lead.lastName}</h4>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>{lead.email || lead.phone}</p>
          </div>
          <ArrowRight size={20} color="var(--color-text-muted)" />
          <div style={{ color: 'var(--color-primary)' }}>
            <UserCheck size={32} />
          </div>
        </div>

        <div style={{ 
          display: 'flex', 
          gap: '0.75rem', 
          padding: '0.75rem', 
          backgroundColor: 'rgba(59, 130, 246, 0.05)', 
          borderRadius: 'var(--radius)',
          fontSize: '0.8125rem',
          color: 'var(--color-info)',
          border: '1px solid rgba(59, 130, 246, 0.2)'
        }}>
          <Info size={16} style={{ flexShrink: 0 }} />
          <p>Converting a lead will create a permanent contact entry. You can always add more details later in the contact profile.</p>
        </div>

        <Select
          label="What kind of contact is this?"
          id="type"
          value={type}
          onChange={(e) => {
            setType(e.target.value as ContactType);
            if (errors.type) setErrors({});
          }}
          options={[
            { value: ContactType.BUYER, label: 'Buyer (Looking to buy property)' },
            { value: ContactType.SELLER, label: 'Seller (Looking to sell property)' },
            { value: ContactType.BOTH, label: 'Both (Buyer & Seller)' }
          ]}
          error={errors.type}
        />

        <Textarea
          label="Additional Conversion Notes"
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Why are they being converted? Any immediate needs?"
          rows={3}
        />

        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
          <Button variant="outline" fullWidth onClick={onClose} type="button">
            Cancel
          </Button>
          <Button 
            variant="primary" 
            fullWidth 
            type="submit" 
            isLoading={isSubmitting}
            leftIcon={<UserCheck size={20} />}
          >
            Confirm Conversion
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default LeadConvertModal;
