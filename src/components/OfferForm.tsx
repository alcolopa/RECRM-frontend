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
import UserSelector from './UserSelector';

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
  
  const [formData, setFormData] = useState({
    propertyId: initialProperty?.id || '',
    contactId: '',
    price: '',
    deposit: '',
    financingType: FinancingType.MORTGAGE,
    closingDate: '',
    expirationDate: '',
    notes: '',
    status: OfferStatus.SUBMITTED,
    assignedAgentId: ''
  });

  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.propertyId || !formData.contactId || !formData.price) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await offersService.create({
        ...formData,
        price: Number(formData.price),
        deposit: formData.deposit ? Number(formData.deposit) : undefined,
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
      setFormData({ ...formData, contactId: contact.id });
    } else {
      setSelectedContact(null);
      setFormData({ ...formData, contactId: '' });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Button variant="ghost" onClick={onCancel} style={{ padding: '0.5rem', borderRadius: '50%', width: '40px', height: '40px' }}>
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Create New Offer</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Start a new negotiation for a property.</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {error && (
          <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
            {error}
          </div>
        )}

        {/* Property Selection */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 size={18} color="var(--color-primary)" /> Property
          </h3>
          <Select
            id="propertyId"
            name="propertyId"
            label="Select Property"
            value={formData.propertyId}
            onChange={(e) => setFormData({ ...formData, propertyId: e.target.value as string })}
            searchable
            options={[
              { value: '', label: 'Select a property...' },
              ...properties.map(p => ({ value: p.id, label: `${p.title} (${p.address})` }))
            ]}
            required
            disabled={!!initialProperty}
          />
        </section>

        {/* Contact Selection */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={18} color="var(--color-primary)" /> Buyer
          </h3>
          {!selectedContact ? (
            <ContactSelector 
              organizationId={organizationId} 
              onSelect={handleContactSelect} 
            />
          ) : (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '1rem', 
              backgroundColor: 'var(--color-bg)', 
              borderRadius: '0.75rem',
              border: '1px solid var(--color-primary)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                  <User size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>{selectedContact.firstName} {selectedContact.lastName}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{selectedContact.email || selectedContact.phone}</div>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedContact(null)}>Change</Button>
            </div>
          )}
        </section>

        {/* Offer Details */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <HandCoins size={18} color="var(--color-primary)" /> Offer Details
          </h3>
          
          <UserSelector 
            organizationId={organizationId}
            selectedUserId={formData.assignedAgentId}
            onSelect={(id) => setFormData(prev => ({ ...prev, assignedAgentId: id }))}
            label="Listing Agent"
          />
          
          <div className="grid grid-2" style={{ gap: '1.5rem' }}>
            <Input
              id="price"
              name="price"
              label="Offer Price"
              type="number"
              placeholder="e.g. 450000"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              icon={DollarSign}
              required
            />
            <Input
              id="deposit"
              name="deposit"
              label="Security Deposit (Optional)"
              type="number"
              placeholder="e.g. 5000"
              value={formData.deposit}
              onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
              icon={DollarSign}
            />
          </div>

          <div className="grid grid-2" style={{ gap: '1.5rem' }}>
            <Select
              id="financingType"
              name="financingType"
              label="Financing Type"
              value={formData.financingType}
              onChange={(e) => setFormData({ ...formData, financingType: e.target.value as FinancingType })}
              options={[
                { value: FinancingType.CASH, label: 'Cash' },
                { value: FinancingType.MORTGAGE, label: 'Mortgage' },
                { value: FinancingType.PRIVATE_FINANCING, label: 'Private Financing' },
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

          <div className="grid grid-2" style={{ gap: '1.5rem' }}>
            <Input
              id="expirationDate"
              name="expirationDate"
              label="Offer Expiration Date"
              type="date"
              value={formData.expirationDate}
              onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
              icon={Calendar}
            />
            <Select
              id="status"
              name="status"
              label="Initial Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as OfferStatus })}
              options={[
                { value: OfferStatus.DRAFT, label: 'Draft' },
                { value: OfferStatus.SUBMITTED, label: 'Submitted' },
                { value: OfferStatus.UNDER_REVIEW, label: 'Under Review' },
              ]}
            />
          </div>

          <Textarea
            id="notes"
            name="notes"
            label="Terms & Conditions / Notes"
            placeholder="Enter any additional terms, contingencies, or notes for this offer..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            icon={FileText}
            rows={4}
          />
        </section>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', paddingTop: '2rem', borderTop: '1px solid var(--color-border)' }}>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            isLoading={isSubmitting}
            leftIcon={!isSubmitting && <Check size={20} />}
          >
            Create Offer
          </Button>
        </div>
      </form>
    </div>
  );
};

export default OfferForm;
