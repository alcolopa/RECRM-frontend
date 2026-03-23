import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  HandCoins, 
  DollarSign, 
  FileText,
  Building2,
  User,
  AlertCircle,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Property } from '../api/properties';
import { type Contact } from '../api/contacts';
import { offersService, FinancingType, OfferStatus, OffererType } from '../api/offers';
import Button from './Button';
import { Input, Select, Textarea } from './Input';
import ContactSelector from './ContactSelector';
import PropertySelector from './PropertySelector';
import DateSelector from './DateSelector';
import { mapBackendErrors, getErrorMessage } from '../utils/errors';
import { useNavigation } from '../contexts/NavigationContext';

interface OfferFormProps {
  onCancel: () => void;
  onSuccess: () => void;
  organizationId: string;
  initialProperty?: Property;
  initialContactId?: string;
}

const OfferForm: React.FC<OfferFormProps> = ({ 
  onCancel, 
  onSuccess, 
  organizationId,
  initialProperty,
  initialContactId
}) => {
  const { navigationState, navigate, clearNavigationState } = useNavigation();
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(initialProperty || null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const [formData, setFormData] = useState({
    propertyId: initialProperty?.id || '',
    contactId: initialContactId || '',
    price: '',
    deposit: '',
    financingType: FinancingType.CASH,
    closingDate: null as string | null,
    expirationDate: null as string | null,
    notes: '',
    offerer: OffererType.BUYER,
    status: OfferStatus.SUBMITTED
  });

  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});



  useEffect(() => {
    if (formData.contactId) {
      const fetchContact = async () => {
        try {
          const { contactService } = await import('../api/contacts');
          const response = await contactService.getById(formData.contactId, organizationId);
          setSelectedContact(response.data);
        } catch (err) {
          console.error('Failed to fetch contact details', err);
        }
      };
      fetchContact();
    } else {
      setSelectedContact(null);
    }
  }, [formData.contactId, organizationId]);

  useEffect(() => {
    if (formData.propertyId) {
      const fetchProperty = async () => {
        try {
          const { propertyService } = await import('../api/properties');
          const response = await propertyService.getOne(formData.propertyId, organizationId);
          setSelectedProperty(response.data);
        } catch (err) {
          console.error('Failed to fetch property details', err);
        }
      };
      fetchProperty();
    } else {
      setSelectedProperty(initialProperty || null);
    }
  }, [formData.propertyId, organizationId]);

  // Restore draft state and handle prefilled IDs from navigation
  useEffect(() => {
    if (navigationState.draftData) {
      setFormData(prev => ({ ...prev, ...navigationState.draftData }));
    }
    
    if (navigationState.prefillData?.contactId) {
      setFormData(prev => ({ ...prev, contactId: navigationState.prefillData.contactId }));
    }
    
    if (navigationState.prefillData?.propertyId) {
      setFormData(prev => ({ ...prev, propertyId: navigationState.prefillData.propertyId }));
    }

    // Clear navigation state after restoration to prevent loops
    if (navigationState.draftData || navigationState.prefillData) {
      // Small timeout to ensure everything is set before clearing
      setTimeout(clearNavigationState, 100);
    }
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.propertyId) newErrors.propertyId = 'Please select a property';
    if (!formData.contactId) newErrors.contactId = 'Please select a contact';
    
    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else {
      const priceNum = Number(formData.price);
      if (isNaN(priceNum) || priceNum <= 0) {
        newErrors.price = 'Price must be greater than 0';
      }
    }

    if (formData.deposit) {
      const depositNum = Number(formData.deposit);
      if (isNaN(depositNum) || depositNum < 0) {
        newErrors.deposit = 'Deposit cannot be negative';
      }
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (formData.closingDate) {
      const closing = new Date(formData.closingDate);
      if (!isNaN(closing.getTime()) && closing < today) {
        newErrors.closingDate = 'Cannot be in the past';
      }
    }

    if (formData.expirationDate) {
      const expiry = new Date(formData.expirationDate);
      if (!isNaN(expiry.getTime()) && expiry < today) {
        newErrors.expirationDate = 'Cannot be in the past';
      }
    }

    if (formData.closingDate && formData.expirationDate) {
      const closing = new Date(formData.closingDate);
      const expiration = new Date(formData.expirationDate);
      if (!isNaN(closing.getTime()) && !isNaN(expiration.getTime()) && expiration <= closing) {
        newErrors.expirationDate = 'Must be further in time than closing';
      }
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

  const handleNewContactRequested = () => {
    navigate('contacts', {
      returnTo: 'offers',
      draftData: formData,
      context: 'creating-buyer'
    });
  };

  const handleNewPropertyRequested = () => {
    navigate('properties', {
      returnTo: 'offers',
      draftData: formData,
      context: 'creating-property'
    });
  };

  const handleSubmit = async (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    setError(null);
    
    const isValid = validate();
    if (!isValid) {
      // Don't show a general error alert if we have specific field errors
      return;
    }

    setIsSubmitting(true);

    try {
      await offersService.create({
        ...formData,
        price: Number(formData.price),
        deposit: formData.deposit ? Number(formData.deposit) : undefined,
        // Dates are already handled by DateSelector (either ISO string or null)
      }, organizationId);
      onSuccess();
    } catch (err: any) {
      console.error('Failed to create offer', err);
      
      const backendErrors = mapBackendErrors(err);
      if (Object.keys(backendErrors).length > 0) {
        setErrors(backendErrors);
        setError('Please correct the highlighted errors.');
      } else {
        setError(getErrorMessage(err, 'Failed to create offer. Please try again.'));
      }
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

  const handlePropertySelect = (_propertyId: string, property?: Property) => {
    if (property) {
      setSelectedProperty(property);
      setFormData(prev => ({ ...prev, propertyId: property.id }));
    } else {
      setSelectedProperty(null);
      setFormData(prev => ({ ...prev, propertyId: '' }));
    }
  };


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '850px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <Button
          variant="ghost"
          onClick={onCancel}
          aria-label="Back to offers"
          style={{ padding: '0.5rem', borderRadius: '50%', width: '40px', height: '40px' }}
        >
          <ChevronLeft size={24} />
        </Button>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Create New Offer</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', margin: 0 }}>Start a negotiation for a property.</p>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem',
              background: 'rgba(220, 38, 38, 0.1)',
              border: '1px solid var(--color-error)',
              borderRadius: 'var(--radius)',
              color: 'var(--color-error)',
              fontSize: '0.875rem',
              marginBottom: '1.5rem',
              fontWeight: 500,
              overflow: 'hidden'
            }}
          >
            <AlertCircle size={20} />
            <div style={{ flex: 1 }}>{error}</div>
            <button
              type="button"
              onClick={() => setError(null)}
              aria-label="Dismiss error"
              style={{ 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer', 
                padding: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'inherit',
                opacity: 0.7
              }}
            >
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="card" style={{ 
        maxWidth: '800px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: isMobile ? '1.25rem' : '2rem',
        padding: isMobile ? '1.25rem' : '2rem'
      }}>
        {/* Section 1: Property & Buyer */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '1.25rem' : '2.5rem' }}>
          {/* Property Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.375rem', height: '1.75rem' }}>
              <h3 style={{ fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase', color: 'var(--color-primary)', letterSpacing: '0.05em', margin: 0 }}>
                <Building2 size={14} /> Property
              </h3>
              {selectedProperty && (
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text)', backgroundColor: 'var(--color-bg)', padding: '0.125rem 0.5rem', borderRadius: '1rem', border: '1px solid var(--color-border)' }}>
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(selectedProperty.price))}
                </span>
              )}
            </div>
            <PropertySelector
              organizationId={organizationId}
              selectedPropertyId={formData.propertyId}
              onSelect={handlePropertySelect}
              onNewPropertyRequested={handleNewPropertyRequested}
              error={errors.propertyId}
              disabled={!!initialProperty}
              label=""
            />
          </div>

          {/* Buyer Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.375rem', height: '1.75rem' }}>
              <h3 style={{ fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase', color: 'var(--color-primary)', letterSpacing: '0.05em', margin: 0 }}>
                <User size={14} /> Buyer
              </h3>
              {selectedContact && (
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                  {selectedContact.email || selectedContact.phone}
                </span>
              )}
            </div>
            <ContactSelector 
              organizationId={organizationId} 
              onSelect={handleContactSelect} 
              onNewContactRequested={handleNewContactRequested}
              selectedContactId={formData.contactId}
              error={errors.contactId}
              label=""
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Section 2: Offer Terms */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
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
              error={errors.deposit}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: '1.25rem' }}>
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
              error={errors.financingType}
            />
            <DateSelector
              id="closingDate"
              label="Closing Date"
              value={formData.closingDate}
              onChange={(val) => handleFieldChange('closingDate', val)}
              error={errors.closingDate}
            />
            <DateSelector
              id="expirationDate"
              label="Expiry Date"
              value={formData.expirationDate}
              onChange={(val) => handleFieldChange('expirationDate', val)}
              error={errors.expirationDate}
            />
            <Select
              id="offerer"
              name="offerer"
              label="Offerer"
              value={formData.offerer}
              onChange={(e) => handleFieldChange('offerer', e.target.value as OffererType)}
              icon={User}
              options={[
                { value: OffererType.BUYER, label: 'Buyer' },
                { value: OffererType.AGENCY, label: 'Agency' },
              ]}
              required
              error={errors.offerer}
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
            error={errors.notes}
          />

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              style={{ flex: 1 }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              style={{ flex: 2 }}
              leftIcon={<Save size={20} />}
            >
              Create Offer
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default OfferForm;
