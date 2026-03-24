import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  HandCoins, 
  DollarSign, 
  FileText,
  AlertCircle,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Offer, type OffererType } from '../api/offers';
import Button from './Button';
import { Input, Select, Textarea } from './Input';
import DateSelector from './DateSelector';

interface CounterOfferFormProps {
  originalOffer: Offer;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const CounterOfferForm: React.FC<CounterOfferFormProps> = ({ 
  originalOffer, 
  onSave, 
  onCancel,
  isSubmitting: externalIsSubmitting
}) => {
  const [formData, setFormData] = useState({
    price: Number(originalOffer.price),
    deposit: Number(originalOffer.deposit || 0),
    financingType: originalOffer.financingType,
    closingDate: originalOffer.closingDate ? new Date(originalOffer.closingDate).toISOString() : '',
    expirationDate: originalOffer.expirationDate ? new Date(originalOffer.expirationDate).toISOString() : '',
    notes: '',
    offerer: 'AGENCY' as OffererType
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (formData.price <= 0) newErrors.price = 'Price must be greater than 0';
    if (formData.deposit < 0) newErrors.deposit = 'Deposit cannot be negative';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await onSave(formData);
    } catch (err: any) {
      console.error('Failed to submit counter offer', err);
      setError(err.response?.data?.message || 'Failed to submit counter offer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button 
          type="button" 
          onClick={onCancel}
          style={{ 
            padding: '0.5rem', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--color-surface)', border: '1px solid var(--color-border)', cursor: 'pointer', color: 'var(--color-text)', flexShrink: 0
          }}
        >
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.25rem' }}>Counter Offer</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Adjusting the terms based on the previous offer of ${Number(originalOffer.price).toLocaleString()}.</p>
        </div>
      </header>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              padding: '1rem', background: 'rgba(220, 38, 38, 0.1)', color: 'var(--color-error)', borderRadius: 'var(--radius)',
              fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              border: '1px solid var(--color-error)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={18} />
              {error}
            </div>
            <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: '0.25rem' }}>
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: isMobile ? '1.5rem' : '2.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="grid grid-2">
            <Input
              id="price"
              name="price"
              label="Counter Price"
              type="number"
              required
              value={formData.price}
              onChange={(e) => handleFieldChange('price', Number(e.target.value))}
              icon={DollarSign}
              error={errors.price}
            />
            <Input
              id="deposit"
              name="deposit"
              label="Earnest Money Deposit"
              type="number"
              value={formData.deposit}
              onChange={(e) => handleFieldChange('deposit', Number(e.target.value))}
              icon={DollarSign}
              error={errors.deposit}
            />
          </div>

          <div className="grid grid-2">
            <Select
              id="financingType"
              name="financingType"
              label="Financing Type"
              value={formData.financingType}
              onChange={(e) => handleFieldChange('financingType', e.target.value)}
              options={[
                { value: 'CASH', label: 'All Cash' },
                { value: 'MORTGAGE', label: 'Mortgage' },
                { value: 'PRIVATE_FINANCING', label: 'Private Financing' },
                { value: 'OTHER', label: 'Other' }
              ]}
            />
            <Select
              id="offerer"
              name="offerer"
              label="Sending as"
              value={formData.offerer}
              onChange={(e) => handleFieldChange('offerer', e.target.value)}
              options={[
                { value: 'AGENCY', label: 'Agency (on behalf of seller)' },
                { value: 'BUYER', label: 'Buyer (counter-counter)' }
              ]}
            />
          </div>

          <div className="grid grid-2">
            <DateSelector
              id="closingDate"
              label="Proposed Closing Date"
              value={formData.closingDate || null}
              onChange={(val) => handleFieldChange('closingDate', val)}
            />
            <DateSelector
              id="expirationDate"
              label="Offer Expiration"
              value={formData.expirationDate || null}
              onChange={(val) => handleFieldChange('expirationDate', val)}
            />
          </div>

          <Textarea
            id="notes"
            name="notes"
            label="Adjusted Terms & Notes"
            placeholder="Explain the changes in this counter offer..."
            value={formData.notes}
            onChange={(e) => handleFieldChange('notes', e.target.value)}
            icon={FileText}
            rows={4}
          />

          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '1rem', marginTop: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '2rem' }}>
            <Button variant="outline" style={{ flex: 1 }} onClick={onCancel} type="button">
              Cancel
            </Button>
            <Button 
              variant="primary" 
              style={{ flex: 2 }} 
              type="submit" 
              isLoading={isSubmitting || externalIsSubmitting}
              leftIcon={<HandCoins size={20} />}
            >
              Submit Counter Offer
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CounterOfferForm;
