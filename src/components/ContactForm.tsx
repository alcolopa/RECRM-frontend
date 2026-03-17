import { useState } from 'react';
import {
  User,
  Mail,
  Save,
  Target,
  Home,
  DollarSign,
  MapPin,
  Briefcase,
  Layers,
  ArrowRight,
  ArrowLeft,
  ChevronLeft
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  type Contact,
  ContactType,
  ContactStatus,
  FinancingType,
  BuyingTimeline,
  ListingType,
  SellingTimeline
} from '../api/contacts';
import PhoneInput from './PhoneInput';
import { Input, Select, Textarea, Checkbox } from './Input';
import Button from './Button';
import UserSelector from './UserSelector';

interface ContactFormProps {
  contact?: Contact;
  onSave: (data: Partial<Contact>) => Promise<void>;
  onCancel: () => void;
  organizationId: string;
  fixedType?: ContactType;
  initialStep?: number;
  isIsolatedProfile?: boolean;
}

const ContactForm: React.FC<ContactFormProps> = ({ 
  contact, 
  onSave, 
  onCancel, 
  organizationId,
  fixedType,
  initialStep = 1,
  isIsolatedProfile = false
}) => {
  const [step, setStep] = useState(initialStep);
  
  // Multi-role state
  const [isBuyer, setIsBuyer] = useState(
    contact?.type === ContactType.BUYER || 
    contact?.type === ContactType.BOTH || 
    fixedType === ContactType.BUYER || 
    (!contact && !fixedType)
  );
  const [isSeller, setIsSeller] = useState(
    contact?.type === ContactType.SELLER || 
    contact?.type === ContactType.BOTH || 
    fixedType === ContactType.SELLER
  );

  // Base Contact Data
  const [baseData, setBaseData] = useState({
    firstName: contact?.firstName || '',
    lastName: contact?.lastName || '',
    email: contact?.email || '',
    phone: contact?.phone || '+1 ',
    secondaryPhone: contact?.secondaryPhone || '',
    status: contact?.status || ContactStatus.NEW,
    leadSource: contact?.leadSource || '',
    notes: contact?.notes || '',
    tags: contact?.tags || [],
    assignedAgentId: contact?.assignedAgentId || ''
  });

  // Buyer Profile Data
  const [buyerProfile, setBuyerProfile] = useState({
    minBudget: contact?.buyerProfile?.minBudget || undefined,
    maxBudget: contact?.buyerProfile?.maxBudget || undefined,
    financingType: contact?.buyerProfile?.financingType || undefined,
    preApproved: contact?.buyerProfile?.preApproved || false,
    preApprovedAmount: contact?.buyerProfile?.preApprovedAmount || undefined,
    downPayment: contact?.buyerProfile?.downPayment || undefined,
    propertyTypes: contact?.buyerProfile?.propertyTypes || [],
    minBedrooms: contact?.buyerProfile?.minBedrooms || undefined,
    minBathrooms: contact?.buyerProfile?.minBathrooms || undefined,
    minArea: contact?.buyerProfile?.minArea || undefined,
    maxArea: contact?.buyerProfile?.maxArea || undefined,
    preferredCities: contact?.buyerProfile?.preferredCities || [],
    preferredNeighborhoods: contact?.buyerProfile?.preferredNeighborhoods || [],
    parkingRequired: contact?.buyerProfile?.parkingRequired || false,
    gardenRequired: contact?.buyerProfile?.gardenRequired || false,
    furnished: contact?.buyerProfile?.furnished || false,
    newConstruction: contact?.buyerProfile?.newConstruction || false,
    buyingTimeline: contact?.buyerProfile?.buyingTimeline || undefined,
    purchasePurpose: contact?.buyerProfile?.purchasePurpose || undefined
  });

  // Seller Profile Data
  const [sellerProfile, setSellerProfile] = useState({
    minimumPrice: contact?.sellerProfile?.minimumPrice || undefined,
    mortgageBalance: contact?.sellerProfile?.mortgageBalance || undefined,
    listingType: contact?.sellerProfile?.listingType || undefined,
    readyToList: contact?.sellerProfile?.readyToList || false,
    occupied: contact?.sellerProfile?.occupied || false,
    sellingTimeline: contact?.sellerProfile?.sellingTimeline || undefined,
    reasonForSelling: contact?.sellerProfile?.reasonForSelling || undefined
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleBaseChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setBaseData(prev => ({ ...prev, [id]: value }));
    // Clear error when user types
    if (errors[id]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    // Step 1 Validation
    if (step === 1) {
      if (!baseData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!baseData.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!baseData.phone.trim() || baseData.phone === '+1 ') newErrors.phone = 'Phone number is required';
      
      if (baseData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(baseData.email)) {
        newErrors.email = 'Incorrect email format';
      }

      if (!isBuyer && !isSeller) {
        newErrors.type = 'Please select at least one role (Buyer or Seller)';
      }
    }

    // Step 2 Validation (Buyer Profile)
    if (step === 2) {
      if (buyerProfile.minBudget && buyerProfile.maxBudget && Number(buyerProfile.minBudget) > Number(buyerProfile.maxBudget)) {
        newErrors.maxBudget = 'Max budget must be greater than min budget';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePhoneChange = (value: string) => {
    setBaseData(prev => ({ ...prev, phone: value }));
    if (errors.phone) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.phone;
        return newErrors;
      });
    }
  };

  const handleBuyerChange = (field: string, value: any) => {
    setBuyerProfile(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSellerChange = (field: string, value: any) => {
    setSellerProfile(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!validate()) return;

    setIsLoading(true);
    try {
      let finalType: ContactType = ContactType.BUYER;
      if (isBuyer && isSeller) finalType = ContactType.BOTH;
      else if (isSeller) finalType = ContactType.SELLER;

      const finalData: any = {
        ...baseData,
        email: baseData.email.trim() || null,
        assignedAgentId: baseData.assignedAgentId || null,
        type: finalType,
        organizationId
      };

      if (isBuyer) {
        finalData.buyerProfile = {
          ...buyerProfile,
          minBudget: buyerProfile.minBudget ? Number(buyerProfile.minBudget) : null,
          maxBudget: buyerProfile.maxBudget ? Number(buyerProfile.maxBudget) : null,
          preApprovedAmount: buyerProfile.preApprovedAmount ? Number(buyerProfile.preApprovedAmount) : null,
          downPayment: buyerProfile.downPayment ? Number(buyerProfile.downPayment) : null,
          minBedrooms: buyerProfile.minBedrooms ? Number(buyerProfile.minBedrooms) : null,
          minBathrooms: buyerProfile.minBathrooms ? Number(buyerProfile.minBathrooms) : null,
          minArea: buyerProfile.minArea ? Number(buyerProfile.minArea) : null,
          maxArea: buyerProfile.maxArea ? Number(buyerProfile.maxArea) : null,
        };
      }
      if (isSeller) {
        finalData.sellerProfile = {
          ...sellerProfile,
          minimumPrice: sellerProfile.minimumPrice ? Number(sellerProfile.minimumPrice) : null,
          mortgageBalance: sellerProfile.mortgageBalance ? Number(sellerProfile.mortgageBalance) : null,
        };
      }

      await onSave(finalData);
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (!validate()) return;
    
    if (isIsolatedProfile) {
      handleSubmit();
      return;
    }

    if (step === 1) {
      if (isBuyer) setStep(2); // Go to Buyer profile
      else if (isSeller) setStep(3); // Skip to Seller profile
    } else if (step === 2) {
      if (isSeller) setStep(3); // Go to Seller profile
      else handleSubmit(); // Finalize
    } else if (step === 3) {
      handleSubmit(); // Finalize
    }
  };

  const prevStep = () => {
    if (isIsolatedProfile) {
      onCancel();
      return;
    }

    if (step === 2) setStep(1);
    else if (step === 3) {
      if (isBuyer) setStep(2);
      else setStep(1);
    }
  };

  const formatTimelineLabel = (value: string) => {
    return value
      .replace('ONE_TO_THREE_MONTHS', '1-3 Months')
      .replace('THREE_TO_SIX_MONTHS', '3-6 Months')
      .replace('SIX_PLUS_MONTHS', '6+ Months')
      .replace(/_/g, ' ');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button 
          type="button" 
          onClick={onCancel}
          aria-label="Back to contacts"
          style={{ 
            padding: '0.5rem', 
            borderRadius: '50%', 
            width: '40px', 
            height: '40px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            cursor: 'pointer',
            color: 'var(--color-text)'
          }}
          title="Go back"
        >
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            {contact ? 'Edit Contact' : 'Add New Contact'}
          </h1>
          <p style={{ color: 'var(--color-text-muted)' }}>
            {isIsolatedProfile ? (step === 2 ? 'Update Buyer Search Criteria' : 'Update Seller Property Info') : 
             (step === 1 ? 'Step 1: Identity & Communication' : 
              step === 2 ? 'Step 2: Buyer Search Criteria' : 
              'Step 3: Seller Property Info')}
          </p>
        </div>
      </header>

      {/* Progress Bar */}
      {!isIsolatedProfile && (
        <div style={{ width: '100%', maxWidth: '800px', height: '4px', backgroundColor: 'var(--color-border)', borderRadius: '2px', position: 'relative' }}>
          <motion.div
            animate={{ 
              width: step === 1 ? '33%' : (step === 2 ? (isSeller ? '66%' : '100%') : '100%') 
            }}
            style={{ height: '100%', backgroundColor: 'var(--color-primary)', borderRadius: '2px' }}
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className="card" style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
          >
            <div className="grid grid-2">
              <div style={inputGroupStyle}>
                <label style={labelStyle}>Contact Roles</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setIsBuyer(!isBuyer)}
                    className={`btn ${isBuyer ? 'btn-primary' : 'btn-outline'}`}
                    style={{ flex: 1, gap: '0.5rem' }}
                    disabled={!!fixedType && fixedType === ContactType.SELLER}
                  >
                    <Target size={18} /> Buyer
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSeller(!isSeller)}
                    className={`btn ${isSeller ? 'btn-primary' : 'btn-outline'}`}
                    style={{ flex: 1, gap: '0.5rem' }}
                    disabled={!!fixedType && fixedType === ContactType.BUYER}
                  >
                    <Home size={18} /> Seller
                  </button>
                </div>
                {errors.type && <span style={{ color: 'var(--color-error)', fontSize: '0.75rem' }}>{errors.type}</span>}
              </div>
              <Select
                label="Contact Status"
                id="status"
                name="status"
                value={baseData.status}
                onChange={handleBaseChange}
                icon={Briefcase}
                options={Object.values(ContactStatus).map(s => ({ value: s, label: s }))}
              />
            </div>

            <div className="grid grid-2">
              <Input
                label="First Name"
                id="firstName"
                name="firstName"
                required
                value={baseData.firstName}
                onChange={handleBaseChange}
                placeholder="John"
                icon={User}
                error={errors.firstName}
              />
              <Input
                label="Last Name"
                id="lastName"
                name="lastName"
                required
                value={baseData.lastName}
                onChange={handleBaseChange}
                placeholder="Doe"
                icon={User}
                error={errors.lastName}
              />
            </div>

            <Input
              label="Email Address"
              id="email"
              name="email"
              type="email"
              value={baseData.email}
              onChange={handleBaseChange}
              placeholder="john@example.com"
              icon={Mail}
              error={errors.email}
            />

            <PhoneInput 
              id="phone" 
              value={baseData.phone} 
              onChange={handlePhoneChange}
              error={errors.phone}
            />

            <Input
              label="Lead Source"
              id="leadSource"
              name="leadSource"
              value={baseData.leadSource}
              onChange={handleBaseChange}
              placeholder="e.g. Website, Referral, Zillow"
              icon={Layers}
              error={errors.leadSource}
            />

            <Textarea
              label="Internal Notes"
              id="notes"
              name="notes"
              value={baseData.notes}
              onChange={handleBaseChange}
              placeholder="Any additional details..."
              error={errors.notes}
            />

            <div style={{ marginTop: '0.5rem' }}>
              <UserSelector 
                organizationId={organizationId}
                selectedUserId={baseData.assignedAgentId}
                onSelect={(id) => setBaseData(prev => ({ ...prev, assignedAgentId: id }))}
                label="Assigned Agent"
                error={errors.assignedAgentId}
              />
            </div>

            <div className="action-bar-mobile" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel} 
                style={{ flex: 1, minWidth: '120px' }}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={nextStep} 
                style={{ flex: 2, minWidth: '200px' }}
                disabled={!isBuyer && !isSeller}
                rightIcon={!(isBuyer || isSeller) ? undefined : <ArrowRight size={18} />}
              >
                {!isBuyer && !isSeller ? 'Select a Role' : 'Continue to Profile'}
              </Button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
          >
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)' }}>
              <Target size={20} /> Buyer Search Criteria
            </h3>
            
            <div className="grid grid-2">
              <Input
                label="Min Budget"
                id="minBudget"
                name="minBudget"
                type="number"
                value={buyerProfile.minBudget || ''}
                onChange={(e) => handleBuyerChange('minBudget', e.target.value)}
                placeholder="Min"
                icon={DollarSign}
              />
              <Input
                label="Max Budget"
                id="maxBudget"
                name="maxBudget"
                type="number"
                value={buyerProfile.maxBudget || ''}
                onChange={(e) => handleBuyerChange('maxBudget', e.target.value)}
                placeholder="Max"
                icon={DollarSign}
                error={errors.maxBudget}
              />
            </div>

            <div className="grid grid-2">
              <Select
                label="Financing"
                id="financingType"
                name="financingType"
                value={buyerProfile.financingType || ''}
                onChange={(e) => handleBuyerChange('financingType', e.target.value)}
                options={[
                  { value: '', label: 'Select Type' },
                  ...Object.values(FinancingType).map(t => ({ value: t, label: t }))
                ]}
              />
              <Select
                label="Timeline"
                id="buyingTimeline"
                name="buyingTimeline"
                value={buyerProfile.buyingTimeline || ''}
                onChange={(e) => handleBuyerChange('buyingTimeline', e.target.value)}
                options={[
                  { value: '', label: 'Select Timeline' },
                  ...Object.values(BuyingTimeline).map(t => ({ value: t, label: formatTimelineLabel(t) }))
                ]}
              />
            </div>

            <div className="grid grid-2">
              <Input
                label="Min Bedrooms"
                id="minBedrooms"
                name="minBedrooms"
                type="number"
                value={buyerProfile.minBedrooms || ''}
                onChange={(e) => handleBuyerChange('minBedrooms', e.target.value)}
                placeholder="e.g. 3"
              />
              <Input
                label="Min Bathrooms"
                id="minBathrooms"
                name="minBathrooms"
                type="number"
                value={buyerProfile.minBathrooms || ''}
                onChange={(e) => handleBuyerChange('minBathrooms', e.target.value)}
                placeholder="e.g. 2"
              />
            </div>

            <Input
              label="Location Preferences"
              id="preferredCities"
              name="preferredCities"
              placeholder="Cities (comma separated)"
              value={buyerProfile.preferredCities.join(', ')}
              onChange={(e) => handleBuyerChange('preferredCities', e.target.value.split(',').map(s => s.trim()))}
              icon={MapPin}
            />

            <div className="grid grid-2" style={{ gap: '1rem' }}>
              <Checkbox
                label="Pre-approved for Mortgage"
                id="preApproved"
                checked={buyerProfile.preApproved}
                onChange={(e) => handleBuyerChange('preApproved', e.target.checked)}
              />
              <Checkbox
                label="Parking Required"
                id="parkingRequired"
                checked={buyerProfile.parkingRequired}
                onChange={(e) => handleBuyerChange('parkingRequired', e.target.checked)}
              />
            </div>

            <div className="action-bar-mobile" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
              <Button 
                type="button" 
                variant="outline" 
                onClick={prevStep} 
                style={{ flex: 1, minWidth: '100px' }}
                leftIcon={isIsolatedProfile ? undefined : <ArrowLeft size={18} />}
              >
                {isIsolatedProfile ? 'Cancel' : 'Back'}
              </Button>
              {!isIsolatedProfile && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={onCancel} 
                  style={{ flex: 1, minWidth: '100px' }}
                >
                  Cancel
                </Button>
              )}
              <Button 
                type="button"
                onClick={nextStep}
                isLoading={isLoading} 
                style={{ flex: 2, minWidth: '200px' }}
                rightIcon={(!isIsolatedProfile && isSeller) ? <ArrowRight size={18} /> : <Save size={20} />}
              >
                {isIsolatedProfile ? 'Update Profile' : (isSeller ? 'Continue to Seller Profile' : 'Save Contact')}
              </Button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
          >
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-warning)' }}>
              <Home size={20} /> Seller Property Info
            </h3>

            <div className="grid grid-2">
              <Select
                label="Listing Type"
                id="listingType"
                name="listingType"
                value={sellerProfile.listingType || ''}
                onChange={(e) => handleSellerChange('listingType', e.target.value)}
                options={[
                  { value: '', label: 'Select Listing' },
                  ...Object.values(ListingType).map(t => ({ value: t, label: t.replace(/_/g, ' ') }))
                ]}
              />
              <Select
                label="Selling Timeline"
                id="sellingTimeline"
                name="sellingTimeline"
                value={sellerProfile.sellingTimeline || ''}
                onChange={(e) => handleSellerChange('sellingTimeline', e.target.value)}
                options={[
                  { value: '', label: 'Select Timeline' },
                  ...Object.values(SellingTimeline).map(t => ({ value: t, label: formatTimelineLabel(t) }))
                ]}
              />
            </div>

            <div className="grid grid-2" style={{ gap: '1rem' }}>
              <Checkbox
                label="Ready to List"
                id="readyToList"
                checked={sellerProfile.readyToList}
                onChange={(e) => handleSellerChange('readyToList', e.target.checked)}
              />
              <Checkbox
                label="Currently Occupied"
                id="occupied"
                checked={sellerProfile.occupied}
                onChange={(e) => handleSellerChange('occupied', e.target.checked)}
              />
            </div>

            <div className="action-bar-mobile" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
              <Button 
                type="button" 
                variant="outline" 
                onClick={prevStep} 
                style={{ flex: 1, minWidth: '100px' }}
                leftIcon={isIsolatedProfile ? undefined : <ArrowLeft size={18} />}
              >
                {isIsolatedProfile ? 'Cancel' : 'Back'}
              </Button>
              {!isIsolatedProfile && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={onCancel} 
                  style={{ flex: 1, minWidth: '100px' }}
                >
                  Cancel
                </Button>
              )}
              <Button 
                type="button"
                onClick={nextStep}
                isLoading={isLoading} 
                style={{ flex: 2, minWidth: '200px' }}
                leftIcon={<Save size={20} />}
              >
                {isIsolatedProfile ? 'Update Profile' : 'Save Contact'}
              </Button>
            </div>
          </motion.div>
        )}
      </form>
    </div>
  );
};

const inputGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem'
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.875rem',
  fontWeight: 600,
  color: 'var(--color-text)'
};

export default ContactForm;
