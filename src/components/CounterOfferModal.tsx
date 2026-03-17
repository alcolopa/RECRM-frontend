import React, { useState } from 'react';
import { 
  HandCoins, 
  DollarSign, 
  Calendar, 
  FileText
} from 'lucide-react';
import { type Offer, offersService, FinancingType } from '../api/offers';
import Modal from './Modal';
import Button from './Button';
import { Input, Select, Textarea } from './Input';

interface CounterOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalOffer: Offer;
  onSuccess: () => void;
}

const CounterOfferModal: React.FC<CounterOfferModalProps> = ({ 
  isOpen, 
  onClose, 
  originalOffer, 
  onSuccess 
}) => {
  const [formData, setFormData] = useState({
    price: originalOffer.price,
    deposit: originalOffer.deposit || 0,
    financingType: originalOffer.financingType,
    closingDate: originalOffer.closingDate ? new Date(originalOffer.closingDate).toISOString().split('T')[0] : '',
    expirationDate: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await offersService.counter(originalOffer.id, {
        ...formData,
        price: Number(formData.price),
        deposit: formData.deposit ? Number(formData.deposit) : undefined,
      }, originalOffer.organizationId);
      onSuccess();
    } catch (err: any) {
      console.error('Failed to create counter offer', err);
      setError(err.response?.data?.message || 'Failed to create counter offer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Counter Offer"
      maxWidth="600px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ padding: '1rem', backgroundColor: 'rgba(var(--color-primary-rgb), 0.05)', borderRadius: '0.75rem', border: '1px solid var(--color-primary)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Original Offer</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--color-primary)' }}>
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(originalOffer.price)}
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                {originalOffer.financingType.replace('_', ' ')}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                Deposit: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(originalOffer.deposit || 0)}
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div style={{ padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
            {error}
          </div>
        )}

        <div className="grid grid-2" style={{ gap: '1.25rem' }}>
          <Input
            id="price"
            name="price"
            label="Counter Price"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
            icon={DollarSign}
            required
          />
          <Input
            id="deposit"
            name="deposit"
            label="Security Deposit"
            type="number"
            value={formData.deposit}
            onChange={(e) => setFormData({ ...formData, deposit: Number(e.target.value) })}
            icon={DollarSign}
          />
        </div>

        <div className="grid grid-2" style={{ gap: '1.25rem' }}>
          <Select
            id="financingType"
            name="financingType"
            label="Financing Type"
            value={formData.financingType}
            onChange={(e) => setFormData({ ...formData, financingType: e.target.value as FinancingType })}
            options={[
              { value: FinancingType.CASH, label: 'Cash' },
              { value: FinancingType.MORTGAGE, label: 'Mortgage' },
              { value: FinancingType.PRIVATE_FINANCING, label: 'Private' },
              { value: FinancingType.OTHER, label: 'Other' },
            ]}
          />
          <Input
            id="closingDate"
            name="closingDate"
            label="Proposed Closing Date"
            type="date"
            value={formData.closingDate}
            onChange={(e) => setFormData({ ...formData, closingDate: e.target.value })}
            icon={Calendar}
          />
        </div>

        <div className="grid grid-2" style={{ gap: '1.25rem' }}>
          <Input
            id="expirationDate"
            name="expirationDate"
            label="Offer Expiration"
            type="date"
            value={formData.expirationDate}
            onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
            icon={Calendar}
          />
          <div /> {/* Spacer */}
        </div>

        <Textarea
          id="notes"
          name="notes"
          label="Negotiation Notes"
          placeholder="Enter any additional terms or comments..."
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          icon={FileText}
          rows={3}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-border)' }}>
          <Button type="button" variant="outline" onClick={onClose} style={{ minWidth: '100px' }}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="primary" 
            isLoading={isSubmitting}
            leftIcon={!isSubmitting && <HandCoins size={18} />}
            style={{ minWidth: '180px' }}
          >
            Submit Counter Offer
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CounterOfferModal;
