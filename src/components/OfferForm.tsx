import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  HandCoins, 
  DollarSign, 
  FileText,
  Building2,
  User,
  AlertCircle,
  X,
  Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Property } from '../api/properties';
import { type Contact, ContactType } from '../api/contacts';
import { offersService, FinancingType, OfferStatus, OffererType, type DealType } from '../api/offers';
import { organizationService, type CommissionConfig } from '../api/organization';
import { userService } from '../api/users';
import Button from './Button';
import { Input, Select, Textarea } from './Input';
import ContactSelector from './ContactSelector';
import LeadSelector from './LeadSelector';
import PropertySelector from './PropertySelector';
import DateSelector from './DateSelector';
import { mapBackendErrors, getErrorMessage } from '../utils/errors';
import { useNavigation } from '../contexts/NavigationContext';
import { formatCurrency, safeAdd, safeMultiply } from '../utils/currency';

interface OfferFormProps {
  onCancel: () => void;
  onSuccess: () => void;
  organizationId: string;
  user: any;
  initialProperty?: Property;
  initialContactId?: string;
  initialLeadId?: string;
}

const OfferForm: React.FC<OfferFormProps> = ({ 
  onCancel, 
  onSuccess, 
  organizationId,
  user,
  initialProperty,
  initialContactId,
  initialLeadId
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
    leadId: initialLeadId || '',
    price: initialProperty?.price ? String(initialProperty.price) : '',
    deposit: '',
    financingType: FinancingType.CASH,
    closingDate: null as string | null,
    expirationDate: null as string | null,
    notes: '',
    offerer: OffererType.BUYER,
    status: OfferStatus.SUBMITTED,
    type: (initialProperty?.listingType === 'RENT' ? 'RENT' : 'SALE') as DealType,
    buyerCommission: undefined as number | undefined,
    sellerCommission: undefined as number | undefined,
    agentCommission: undefined as number | undefined
  });

  const [showOverrides, setShowOverrides] = useState(false);
  const [orgConfig, setOrgConfig] = useState<CommissionConfig | null>(null);
  const [agentConfig, setAgentConfig] = useState<any>(null);

  const [clientType, setClientType] = useState<'CONTACT' | 'LEAD'>(initialLeadId ? 'LEAD' : 'CONTACT');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
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
    if (formData.leadId) {
      const fetchLead = async () => {
        try {
          const { leadService } = await import('../api/leads');
          const response = await leadService.getById(formData.leadId, organizationId);
          setSelectedLead(response.data);
        } catch (err) {
          console.error('Failed to fetch lead details', err);
        }
      };
      fetchLead();
    } else {
      setSelectedLead(null);
    }
  }, [formData.leadId, organizationId]);

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

  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        const [orgRes, agentRes] = await Promise.all([
          organizationService.getCommissionConfig(organizationId),
          userService.getCommissionConfig(user?.id || '')
        ]);
        setOrgConfig(orgRes.data);
        setAgentConfig(agentRes.data);
      } catch (err) {
        console.error('Failed to fetch commission configs', err);
      }
    };
    fetchConfigs();
  }, [organizationId]);

  // Restore draft state and handle prefilled IDs from navigation
  useEffect(() => {
    if (navigationState.draftData) {
      setFormData(prev => ({ ...prev, ...navigationState.draftData }));
    }
    
    if (navigationState.prefillData?.contactId) {
      setFormData(prev => ({ ...prev, contactId: navigationState.prefillData!.contactId! }));
      setClientType('CONTACT');
    }

    if (navigationState.prefillData?.leadId) {
      setFormData(prev => ({ ...prev, leadId: navigationState.prefillData!.leadId! }));
      setClientType('LEAD');
    }
    
    if (navigationState.prefillData?.propertyId) {
      setFormData(prev => ({ ...prev, propertyId: navigationState.prefillData.propertyId }));
    }

    if (navigationState.draftData || navigationState.prefillData) {
      setTimeout(clearNavigationState, 100);
    }
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.propertyId) newErrors.propertyId = 'Please select a property';
    if (!formData.contactId && !formData.leadId) {
      if (clientType === 'CONTACT') newErrors.contactId = 'Contact is required';
      if (clientType === 'LEAD') newErrors.leadId = 'Lead is required';
    }
    
    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else {
      const priceNum = Number(formData.price);
      if (isNaN(priceNum) || priceNum <= 0) {
        newErrors.price = 'Price must be greater than 0';
      }
    }

    if (!formData.financingType) {
      newErrors.financingType = 'Financing type is required';
    }

    if (!formData.offerer) {
      newErrors.offerer = 'Offerer is required';
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

  const calculateCommission = () => {
    if (showOverrides) {
      const buyer = Number(formData.buyerCommission) || 0;
      const seller = Number(formData.sellerCommission) || 0;
      const agent = Number(formData.agentCommission) || 0;
      return {
        buyer,
        seller,
        total: safeAdd(buyer, seller),
        agent
      };
    }

    const price = Number(formData.price) || 0;
    
    const resolveField = (saleField: string, rentField: string) => {
      const field = formData.type === 'SALE' ? saleField : rentField;
      const valField = `${field}Value`;
      const typeField = `${field}Type`;
      
      const agentConfigAny = agentConfig as any;
      const orgConfigAny = orgConfig as any;
      
      const val = agentConfigAny?.[valField] ?? orgConfigAny?.[valField] ?? 0;
      const type = agentConfigAny?.[typeField] ?? orgConfigAny?.[typeField] ?? (formData.type === 'SALE' ? 'PERCENTAGE' : 'MULTIPLIER');
      
      return { val, type };
    };

    const buyer = resolveField('saleBuyer', 'rentBuyer');
    const seller = resolveField('saleSeller', 'rentSeller');
    const agent = resolveField('saleAgent', 'rentAgent');

    const calcValue = (base: number, config: { val: number, type: string }) => {
      const val = Number(config.val) || 0;
      if (config.type === 'PERCENTAGE') return safeMultiply(base, val / 100);
      if (config.type === 'FIXED') return val;
      if (config.type === 'MULTIPLIER') return safeMultiply(base, val);
      return 0;
    };

    const buyerComm = calcValue(price, buyer);
    const sellerComm = calcValue(price, seller);
    const totalComm = safeAdd(buyerComm, sellerComm);
    
    // Agent share is calculated against the transaction price (matching backend Resolver)
    const agentComm = agent.type === 'FIXED' ? agent.val : calcValue(price, agent);

    return {
      buyer: buyerComm,
      seller: sellerComm,
      total: totalComm,
      agent: agentComm
    };
  };

  const commission = calculateCommission();

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
    if (!isValid) return;

    setIsSubmitting(true);

    try {
      const submitData = { 
        ...formData, 
        price: Number(formData.price), 
        deposit: formData.deposit ? Number(formData.deposit) : undefined,
        leadId: clientType === 'LEAD' && formData.leadId ? formData.leadId : undefined,
        contactId: clientType === 'CONTACT' && formData.contactId ? formData.contactId : undefined
      };
      
      await offersService.create(submitData, organizationId);
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

  const handleContactSelect = (contact: Contact | null) => {
    if (contact) {
      setSelectedContact(contact);
      setFormData(prev => ({ ...prev, contactId: contact.id, leadId: '' }));
    } else {
      setSelectedContact(null);
      setFormData(prev => ({ ...prev, contactId: '' }));
    }
  };

  const handleLeadSelect = (lead: any | null) => {
    if (lead) {
      setSelectedLead(lead);
      setFormData(prev => ({ ...prev, leadId: lead.id, contactId: '' }));
    } else {
      setSelectedLead(null);
      setFormData(prev => ({ ...prev, leadId: '' }));
    }
  };

  const handlePropertySelect = (_propertyId: string, property?: Property) => {
    if (property) {
      setSelectedProperty(property);
      setFormData(prev => ({ 
        ...prev, 
        propertyId: property.id,
        price: property.price ? String(property.price) : prev.price,
        type: (property.listingType === 'RENT' ? 'RENT' : 'SALE') as DealType
      }));
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
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', color: 'inherit', opacity: 0.7 }}
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
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '1.25rem' : '2.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.375rem', height: '1.75rem' }}>
              <h3 style={{ fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase', color: 'var(--color-primary)', letterSpacing: '0.05em', margin: 0 }}>
                <Building2 size={14} /> Property*
              </h3>
              {selectedProperty && (
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text)', backgroundColor: 'var(--color-bg)', padding: '0.125rem 0.5rem', borderRadius: '1rem', border: '1px solid var(--color-border)' }}>
                  {formatCurrency(selectedProperty.price, 'USD', { maximumFractionDigits: 0 })}
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
              required
              label=""
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.375rem', height: '1.75rem' }}>
              <h3 style={{ fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase', color: 'var(--color-primary)', letterSpacing: '0.05em', margin: 0 }}>
                <User size={14} /> Buyer*
              </h3>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {(clientType === 'CONTACT' ? selectedContact : selectedLead) && (
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                    {(clientType === 'CONTACT' ? selectedContact?.email || selectedContact?.phone : selectedLead?.email || selectedLead?.phone) || 'No contact info'}
                  </span>
                )}
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button type="button" onClick={() => setClientType('CONTACT')} style={{ fontSize: '0.65rem', fontWeight: 600, padding: '0.125rem 0.5rem', borderRadius: '1rem', backgroundColor: clientType === 'CONTACT' ? 'var(--color-primary)' : 'transparent', color: clientType === 'CONTACT' ? 'white' : 'var(--color-text-muted)', border: `1px solid ${clientType === 'CONTACT' ? 'var(--color-primary)' : 'var(--color-border)'}`, cursor: 'pointer', transition: 'all 0.2s' }}>Contact</button>
                  <button type="button" onClick={() => setClientType('LEAD')} style={{ fontSize: '0.65rem', fontWeight: 600, padding: '0.125rem 0.5rem', borderRadius: '1rem', backgroundColor: clientType === 'LEAD' ? 'var(--color-primary)' : 'transparent', color: clientType === 'LEAD' ? 'white' : 'var(--color-text-muted)', border: `1px solid ${clientType === 'LEAD' ? 'var(--color-primary)' : 'var(--color-border)'}`, cursor: 'pointer', transition: 'all 0.2s' }}>Lead</button>
                </div>
              </div>
            </div>
            {clientType === 'CONTACT' ? (
              <ContactSelector 
                organizationId={organizationId} 
                onSelect={handleContactSelect} 
                onNewContactRequested={handleNewContactRequested}
                selectedContactId={formData.contactId}
                restrictType={ContactType.BUYER}
                error={errors.contactId}
                label=""
                disabled={isSubmitting}
                required
              />
            ) : (
              <LeadSelector 
                organizationId={organizationId} 
                onSelect={handleLeadSelect} 
                selectedLeadId={formData.leadId}
                error={errors.leadId}
                label=""
                disabled={isSubmitting}
                required
              />
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.375rem', margin: 0 }}>
            <h3 style={{ fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase', color: 'var(--color-primary)', letterSpacing: '0.05em', margin: 0 }}>
              <HandCoins size={14} /> Offer Details
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setShowOverrides(!showOverrides)}
                style={{
                  padding: '0.25rem 0.625rem',
                  borderRadius: '1rem',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: '1px solid var(--color-border)',
                  backgroundColor: showOverrides ? 'var(--color-warning-light, #fef3c7)' : 'transparent',
                  color: showOverrides ? 'var(--color-warning-dark, #92400e)' : 'var(--color-text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  marginRight: '0.5rem'
                }}
              >
                {showOverrides ? 'MANUAL ON' : 'AUTO CALC'}
              </button>
              <div style={{ height: '1rem', width: '1px', backgroundColor: 'var(--color-border)', marginRight: '0.5rem' }} />
              <button
                type="button"
                onClick={() => handleFieldChange('type', 'SALE')}
                style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '1rem',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid var(--color-border)',
                  backgroundColor: formData.type === 'SALE' ? 'var(--color-primary)' : 'transparent',
                  color: formData.type === 'SALE' ? 'white' : 'var(--color-text-muted)',
                  transition: 'all 0.2s ease'
                }}
              >
                SALE
              </button>
              <button
                type="button"
                onClick={() => handleFieldChange('type', 'RENT')}
                style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '1rem',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid var(--color-border)',
                  backgroundColor: formData.type === 'RENT' ? 'var(--color-primary)' : 'transparent',
                  color: formData.type === 'RENT' ? 'white' : 'var(--color-text-muted)',
                  transition: 'all 0.2s ease'
                }}
              >
                RENT
              </button>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1.25rem' }}>
            <Input
              id="price"
              name="price"
              label={formData.type === 'SALE' ? 'Offer Price' : 'Monthly Rent'}
              type="number"
              placeholder={formData.type === 'SALE' ? 'e.g. 450000' : 'e.g. 2500'}
              value={formData.price}
              onChange={(e) => handleFieldChange('price', e.target.value)}
              icon={DollarSign}
              required
              error={errors.price}
              helperText={formData.type === 'RENT' ? "Total monthly rent requested." : undefined}
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
                { value: 'CASH', label: 'Cash' },
                { value: 'MORTGAGE', label: 'Mortgage' },
                { value: 'PRIVATE_FINANCING', label: 'Private' },
                { value: 'OTHER', label: 'Other' },
              ]}
              error={errors.financingType}
              required
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
                { value: 'BUYER', label: 'Buyer' },
                { value: 'AGENCY', label: 'Agency' },
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

            {showOverrides && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', 
                  gap: '1rem',
                  padding: '1rem',
                  backgroundColor: 'rgba(245, 158, 11, 0.05)',
                  borderRadius: 'var(--radius)',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                  marginTop: '0.5rem'
                }}
              >
                <Input
                  id="buyerCommission"
                  label="Buyer Comm ($)"
                  type="number"
                  value={formData.buyerCommission}
                  onChange={(e) => handleFieldChange('buyerCommission', e.target.value)}
                  placeholder="0.00"
                  icon={DollarSign}
                />
                <Input
                  id="sellerCommission"
                  label="Seller Comm ($)"
                  type="number"
                  value={formData.sellerCommission}
                  onChange={(e) => handleFieldChange('sellerCommission', e.target.value)}
                  placeholder="0.00"
                  icon={DollarSign}
                />
                <Input
                  id="agentCommission"
                  label="Agent Share ($)"
                  type="number"
                  value={formData.agentCommission}
                  onChange={(e) => handleFieldChange('agentCommission', e.target.value)}
                  placeholder="0.00"
                  icon={HandCoins}
                />
              </motion.div>
            )}

            {/* Commission Preview Card */}
          <div style={{ 
            marginTop: '0.5rem', 
            padding: '1.25rem', 
            borderRadius: 'var(--radius)', 
            backgroundColor: 'rgba(var(--color-primary-rgb), 0.03)', 
            border: '1px dashed rgba(var(--color-primary-rgb), 0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Commission Projection</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-primary)', backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)', padding: '0.125rem 0.5rem', borderRadius: '1rem', fontWeight: 700 }}>
                {formData.type === 'SALE' ? 'SALE MODE' : 'RENT MODE'}
              </span>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Buyer Side</div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 700 }}>{formatCurrency(commission.buyer)}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Seller Side</div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 700 }}>{formatCurrency(commission.seller)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Agency Total</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-primary)' }}>{formatCurrency(commission.total)}</div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(var(--color-primary-rgb), 0.1)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '1.5rem', height: '1.5rem', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700 }}>
                  {(user?.firstName || user?.email || 'A')[0].toUpperCase()}
                </div>
                <span style={{ fontSize: '0.8125rem', fontWeight: 500 }}>Personal Share Projection</span>
              </div>
              <div style={{ fontSize: '1.125rem', fontWeight: 800 }}>{formatCurrency(commission.agent)}</div>
            </div>
          </div>

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
