import { useState } from 'react';
import { UserCheck, Info, ArrowRight, ChevronLeft, X } from 'lucide-react';
import { type Lead } from '../api/leads';
import { ContactType } from '../api/contacts';
import Button from './Button';
import { Select, Textarea } from './Input';
import { mapBackendErrors, getErrorMessage } from '../utils/errors';
import { AnimatePresence, motion } from 'framer-motion';

interface LeadConvertViewProps {
  onClose: () => void;
  onConvert: (data: { type: ContactType; notes?: string }) => Promise<void>;
  lead: Lead;
}

const LeadConvertView: React.FC<LeadConvertViewProps> = ({ 
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button 
          type="button" 
          onClick={onClose}
          style={{ 
            padding: '0.5rem', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--color-surface)', border: '1px solid var(--color-border)', cursor: 'pointer', color: 'var(--color-text)', flexShrink: 0
          }}
        >
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.25rem' }}>Convert to Contact</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Finalize the details to move this lead into your permanent contacts.</p>
        </div>
      </header>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              padding: '1rem',
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

      <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '2rem' }}>
        <div style={{ 
          padding: '1.25rem', 
          backgroundColor: 'var(--color-bg)', 
          borderRadius: 'var(--radius)', 
          display: 'flex', 
          gap: '1.25rem', 
          alignItems: 'center',
          border: '1px solid var(--color-border)'
        }}>
          <div style={{ 
            width: '3.5rem', 
            height: '3.5rem', 
            borderRadius: '50%', 
            backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'var(--color-primary)',
            fontSize: '1.5rem',
            fontWeight: 700
          }}>
            {lead.firstName[0]}{lead.lastName[0]}
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ fontWeight: 700, fontSize: '1.125rem' }}>{lead.firstName} {lead.lastName}</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{lead.email || lead.phone}</p>
          </div>
          <ArrowRight size={24} color="var(--color-text-muted)" />
          <div style={{ color: 'var(--color-primary)' }}>
            <UserCheck size={40} />
          </div>
        </div>

        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          padding: '1rem', 
          backgroundColor: 'rgba(59, 130, 246, 0.05)', 
          borderRadius: 'var(--radius)',
          fontSize: '0.9375rem',
          color: 'var(--color-info)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          lineHeight: 1.5
        }}>
          <Info size={20} style={{ flexShrink: 0, marginTop: '0.125rem' }} />
          <p>Converting a lead will create a permanent contact entry. All existing notes and history will be preserved. You can further customize the Buyer or Seller profile once the conversion is complete.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
            rows={4}
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '2rem' }}>
          <Button variant="outline" style={{ flex: 1 }} onClick={onClose} type="button">
            Cancel
          </Button>
          <Button 
            variant="primary" 
            style={{ flex: 2 }} 
            type="submit" 
            isLoading={isSubmitting}
            leftIcon={<UserCheck size={20} />}
          >
            Confirm & Create Contact
          </Button>
        </div>
      </form>
    </div>
  );
};

export default LeadConvertView;
