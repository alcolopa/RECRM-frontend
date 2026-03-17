import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  HandCoins, 
  DollarSign, 
  Calendar, 
  FileText,
  Building2,
  User,
  Check
} from 'lucide-react';
import { type Property, propertyService } from '../api/properties';
import { type Contact } from '../api/contacts';
import { offersService, FinancingType, OfferStatus } from '../api/offers';
import Button from './Button';
import { Input, Select, Textarea } from './Input';
import ContactSelector from './ContactSelector';

interface OfferFormProps {
  onCancel: () => void;
  onSuccess: () => void;
  organizationId: string;
  initialProperty?: Property;
}

const OfferForm: React.FC<OfferFormProps> = ({ 
  onCancel, 
  onSuccess, 
  organizationId,
  initialProperty 
}) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const [formData, setFormData] = useState({
    propertyId: initialProperty?.id || '',
    contactId: '',
    price: '',
    deposit: '',
    financingType: FinancingType.MORTGAGE,
    closingDate: '',
    expirationDate: '',
    notes: '',
    status: OfferStatus.SUBMITTED
  });

  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await propertyService.getAll(organizationId);
        setProperties(response.data);
      } catch (err) {
        console.error('Failed to fetch properties', err);
      }
    };

    fetchProperties();
  }, [organizationId]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.propertyId) newErrors.propertyId = 'Property is required';
    if (!formData.contactId) newErrors.contactId = 'Contact is required';
    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (Number(formData.price) <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (id: string, value: any) => {
    setFormData(prev => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await offersService.create({
        ...formData,
        price: Number(formData.price),
        deposit: formData.deposit ? Number(formData.deposit) : undefined,
        closingDate: formData.closingDate || null,
        expirationDate: formData.expirationDate || null
      }, organizationId);
      onSuccess();
    } catch (err: any) {
      console.error('Failed to create offer', err);
      setError(err.response?.data?.message || 'Failed to create offer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContactSelect = (_contactId: string, contact?: Contact) => {
    if (contact) {
      setSelectedContact(contact);
      setFormData(prev => ({ ...prev, contactId: contact.id }));
    } else {
      setSelectedContact(null);
      setFormData(prev => ({ ...prev, contactId: '' }));
    }
  };

  const selectedProperty = properties.find(p => p.id === formData.propertyId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '850px', margin: '0 auto' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Button variant="ghost" onClick={onCancel} style={{ padding: '0.5rem', borderRadius: '50%', width: '36px', height: '36px', minWidth: '36px' }}>
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Create New Offer</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>Start a negotiation for a property.</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="card" style={{ padding: isMobile ? '1rem' : '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {error && (
          <div style={{ padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '0.5rem', fontSize: '0.8125rem', fontWeight: 500 }}>
            {error}
          </div>
        )}

        {/* Section 1: Property & Buyer */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '1.25rem' : '2.5rem' }}>
          {/* Property Section */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.375rem' }}>
              <h3 style={{ fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase', color: 'var(--color-primary)', letterSpacing: '0.05em', margin: 0 }}>
                <Building2 size={14} /> Property
              </h3>
              {selectedProperty && (
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text)', backgroundColor: 'var(--color-bg)', padding: '0.125rem 0.5rem', borderRadius: '1rem', border: '1px solid var(--color-border)' }}>
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(selectedProperty.price))}
                </span>
              )}
            </div>
            <Select
              id="propertyId"
              name="propertyId"
              value={formData.propertyId}
              onChange={(e) => handleFieldChange('propertyId', e.target.value)}
              searchable
              icon={Building2}
              options={[
                { value: '', label: 'Choose a property...' },
                ...properties.map(p => ({ value: p.id, label: `${p.title} (${p.address})` }))
              ]}
              required
              disabled={!!initialProperty}
              error={errors.propertyId}
              placeholder="Search properties..."
            />
          </section>

          {/* Buyer Section */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.375rem' }}>
              <h3 style={{ fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase', color: 'var(--color-primary)', letterSpacing: '0.05em', margin: 0 }}>
                <User size={14} /> Buyer
              </h3>
              {selectedContact && (
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                  {selectedContact.email || selectedContact.phone}
                </span>
              )}
            </div>
            {!selectedContact ? (
              <ContactSelector 
                organizationId={organizationId} 
                onSelect={handleContactSelect} 
                error={errors.contactId}
                label=""
              />
            ) : (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '0 0.875rem', 
                backgroundColor: 'rgba(var(--color-primary-rgb), 0.05)', 
                borderRadius: 'var(--radius)',
                border: '1px solid var(--color-primary)',
                height: '2.75rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', overflow: 'hidden' }}>
                  <div style={{ width: '1.5rem', height: '1.5rem', borderRadius: '50%', backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', flexShrink: 0 }}>
                    <User size={12} />
                  </div>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text)' }}>{selectedContact.firstName} {selectedContact.lastName}</span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedContact(null)} style={{ padding: '0.25rem 0.5rem', height: 'auto', fontSize: '0.7rem', flexShrink: 0 }}>Change</Button>
              </div>
            )}
          </section>
        </div>

        {/* Section 2: Offer Terms */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
          <h3 style={{ fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase', color: 'var(--color-primary)', letterSpacing: '0.05em', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.375rem', margin: 0 }}>
            <HandCoins size={14} /> Offer Details
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1.25rem' }}>
            <Input
              id="price"
              name="price"
              label="Offer Price"
              type="number"
              placeholder="e.g. 450000"
              value={formData.price}
              onChange={(e) => handleFieldChange('price', e.target.value)}
              icon={DollarSign}
              required
              error={errors.price}
            />
            <Input
              id="deposit"
              name="deposit"
              label="Security Deposit"
              type="number"
              placeholder="e.g. 5000"
              value={formData.deposit}
              onChange={(e) => handleFieldChange('deposit', e.target.value)}
              icon={DollarSign}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '1.25rem' }}>
            <Select
              id="financingType"
              name="financingType"
              label="Financing"
              value={formData.financingType}
              onChange={(e) => handleFieldChange('financingType', e.target.value)}
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
              label="Closing Date"
              type="date"
              value={formData.closingDate}
              onChange={(e) => handleFieldChange('closingDate', e.target.value)}
              icon={Calendar}
            />
            <Input
              id="expirationDate"
              name="expirationDate"
              label="Expiry Date"
              type="date"
              value={formData.expirationDate}
              onChange={(e) => handleFieldChange('expirationDate', e.target.value)}
              icon={Calendar}
            />
          </div>

          <Textarea
            id="notes"
            name="notes"
            label="Additional Terms & Notes"
            placeholder="Enter any contingencies or special notes..."
            value={formData.notes}
            onChange={(e) => handleFieldChange('notes', e.target.value)}
            icon={FileText}
            rows={3}
          />
        </section>

        {/* Action Bar */}
        <div style={{ display: 'flex', justifyContent: isMobile ? 'stretch' : 'flex-end', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-border)' }}>
          <Button type="button" variant="outline" onClick={onCancel} style={{ flex: isMobile ? 1 : 'none', minWidth: '100px' }}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            isLoading={isSubmitting}
            leftIcon={!isSubmitting && <Check size={18} />}
            style={{ flex: isMobile ? 2 : 'none', minWidth: '150px' }}
          >
            Submit Offer
          </Button>
        </div>
      </form>
    </div>
  );
};

export default OfferForm;
