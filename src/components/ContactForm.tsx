import { useState, useEffect } from 'react';
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
  ChevronLeft,
  X
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
import { mapBackendErrors, getErrorMessage } from '../utils/errors';
import { AnimatePresence } from 'framer-motion';

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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
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
  const [error, setError] = useState<string | null>(null);
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
      if (buyerProfile.minBudget && Number(buyerProfile.minBudget) < 0) {
        newErrors.minBudget = 'Budget cannot be negative';
      }
      if (buyerProfile.maxBudget && Number(buyerProfile.maxBudget) < 0) {
        newErrors.maxBudget = 'Budget cannot be negative';
      }
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
    } catch (err: any) {
      console.error('Failed to save contact', err);
      setError(getErrorMessage(err, 'Failed to save contact. Please check your information.'));
      const backendErrors = mapBackendErrors(err);
      if (Object.keys(backendErrors).length > 0) {
        setErrors(backendErrors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (!validate()) return;
    
    // If it's a new contact, just save immediately after Step 1
    // or if we are in an isolated profile edit mode.
    if (isIsolatedProfile || !contact) {
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
             (!contact ? 'Provide basic contact information to get started' : 
              (step === 1 ? 'Identity & Communication' : 
               step === 2 ? 'Buyer Search Criteria' : 
               'Seller Property Info'))}
          </p>
        </div>
      </header>

      {/* Progress Bar removed as per user request */}

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
              maxWidth: '800px',
              border: '1px solid var(--color-error)'
            }}
          >
            {error}
            <button
              onClick={() => setError(null)}
              style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: '0.25rem' }}
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="card" style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
          >
            <div className="grid grid-2">
              <div style={inputGroupStyle}>
                <label style={labelStyle}>Contact Roles*</label>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setIsBuyer(!isBuyer)}
                    className={`btn ${isBuyer ? 'btn-primary' : 'btn-outline'}`}
                    style={{ flex: 1, gap: '0.5rem', height: '2.75rem', padding: '0 1rem' }}
                    disabled={!!fixedType && fixedType === ContactType.SELLER}
                  >
                    <Target size={18} /> Buyer
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSeller(!isSeller)}
                    className={`btn ${isSeller ? 'btn-primary' : 'btn-outline'}`}
                    style={{ flex: 1, gap: '0.5rem', height: '2.75rem', padding: '0 1rem' }}
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
              label="Phone Number"
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

            <div className="action-bar-mobile" style={{ 
              display: 'flex', 
              flexDirection: isMobile ? 'column' : 'row',
              gap: '0.75rem', 
              marginTop: '1.5rem', 
              borderTop: '1px solid var(--color-border)', 
              paddingTop: '1.5rem' 
            }}>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel} 
                style={{ flex: 1 }}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={nextStep} 
                isLoading={isLoading}
                style={{ flex: isMobile ? 1 : 2 }}
                disabled={!isBuyer && !isSeller}
                rightIcon={(!isBuyer && !isSeller) ? undefined : (!contact ? <Save size={20} /> : <ArrowRight size={18} />)}
              >
                {!isBuyer && !isSeller ? 'Select a Role' : (!contact ? 'Save Contact' : 'Continue to Profile')}
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

            <div className="grid grid-2">
              <Input
                label="Preferred Property Types"
                id="propertyTypes"
                name="propertyTypes"
                placeholder="Apartment, House, etc."
                value={buyerProfile.propertyTypes.join(', ')}
                onChange={(e) => handleBuyerChange('propertyTypes', e.target.value.split(',').map(s => s.trim().toUpperCase()).filter(s => !!s))}
                icon={Home}
              />
              <Input
                label="Location Preferences"
                id="preferredCities"
                name="preferredCities"
                placeholder="Cities (comma separated)"
                value={buyerProfile.preferredCities.join(', ')}
                onChange={(e) => handleBuyerChange('preferredCities', e.target.value.split(',').map(s => s.trim()))}
                icon={MapPin}
              />
            </div>

            <div className="grid grid-2">
              <Input
                label="Min Area (sqft)"
                id="minArea"
                name="minArea"
                type="number"
                value={buyerProfile.minArea || ''}
                onChange={(e) => handleBuyerChange('minArea', e.target.value)}
                placeholder="Min Area"
              />
              <Input
                label="Max Area (sqft)"
                id="maxArea"
                name="maxArea"
                type="number"
                value={buyerProfile.maxArea || ''}
                onChange={(e) => handleBuyerChange('maxArea', e.target.value)}
                placeholder="Max Area"
              />
            </div>

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

            <div className="action-bar-mobile" style={{ 
              display: 'flex', 
              flexDirection: isMobile ? 'column' : 'row',
              gap: '0.75rem', 
              marginTop: '1.5rem', 
              borderTop: '1px solid var(--color-border)', 
              paddingTop: '1.5rem' 
            }}>
              <Button 
                type="button" 
                variant="outline" 
                onClick={prevStep} 
                style={{ flex: 1 }}
                leftIcon={isIsolatedProfile ? undefined : <ArrowLeft size={18} />}
              >
                {isIsolatedProfile ? 'Cancel' : 'Back'}
              </Button>
              {!isIsolatedProfile && !isMobile && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={onCancel} 
                  style={{ flex: 1 }}
                >
                  Cancel
                </Button>
              )}
              <Button 
                type="button"
                onClick={nextStep}
                isLoading={isLoading} 
                style={{ flex: isMobile ? 1 : 2 }}
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

            <div className="grid grid-3">
              <Input
                label="Min Price Expected"
                id="minimumPrice"
                name="minimumPrice"
                type="number"
                value={sellerProfile.minimumPrice || ''}
                onChange={(e) => handleSellerChange('minimumPrice', e.target.value)}
                placeholder="e.g. 500000"
                icon={DollarSign}
              />
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

            <div className="action-bar-mobile" style={{ 
              display: 'flex', 
              flexDirection: isMobile ? 'column' : 'row',
              gap: '0.75rem', 
              marginTop: '1.5rem', 
              borderTop: '1px solid var(--color-border)', 
              paddingTop: '1.5rem' 
            }}>
              <Button 
                type="button" 
                variant="outline" 
                onClick={prevStep} 
                style={{ flex: 1 }}
                leftIcon={isIsolatedProfile ? undefined : <ArrowLeft size={18} />}
              >
                {isIsolatedProfile ? 'Cancel' : 'Back'}
              </Button>
              {!isIsolatedProfile && !isMobile && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={onCancel} 
                  style={{ flex: 1 }}
                >
                  Cancel
                </Button>
              )}
              <Button 
                type="button"
                onClick={nextStep}
                isLoading={isLoading} 
                style={{ flex: isMobile ? 1 : 2 }}
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
  gap: '0.375rem'
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.8125rem',
  fontWeight: 700,
  color: 'var(--color-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.025em',
  display: 'block'
};

export default ContactForm;
