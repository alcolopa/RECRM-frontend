import { useState } from 'react';
import {
  User,
  Mail,
  Save,
  Loader2,
  Target,
  Home,
  DollarSign,
  MapPin,
  Briefcase,
  Layers,
  ArrowRight,
  ArrowLeft
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

interface ContactFormProps {
  contact?: Contact;
  onSave: (data: Partial<Contact>) => Promise<void>;
  onCancel: () => void;
  organizationId: string;
}

const ContactForm: React.FC<ContactFormProps> = ({ contact, onSave, onCancel, organizationId }) => {
  const [step, setStep] = useState(1);
  const [type, setType] = useState<ContactType>(contact?.type || ContactType.BUYER);

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
    tags: contact?.tags || []
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

  const handleBaseChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setBaseData(prev => ({ ...prev, [id]: value }));
  };

  const handlePhoneChange = (value: string) => {
    setBaseData(prev => ({ ...prev, phone: value }));
  };

  const handleBuyerChange = (field: string, value: any) => {
    setBuyerProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSellerChange = (field: string, value: any) => {
    setSellerProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const finalData: any = {
        ...baseData,
        type,
        organizationId
      };

      if (type === ContactType.BUYER) {
        finalData.buyerProfile = buyerProfile;
      } else {
        finalData.sellerProfile = sellerProfile;
      }

      await onSave(finalData);
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const formatTimelineLabel = (value: string) => {
    return value
      .replace('ONE_TO_THREE_MONTHS', '1-3 Months')
      .replace('THREE_TO_SIX_MONTHS', '3-6 Months')
      .replace('SIX_PLUS_MONTHS', '6+ Months')
      .replace(/_/g, ' ');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            {contact ? 'Edit Contact' : 'Add New Contact'}
          </h1>
          <p style={{ color: 'var(--color-text-muted)' }}>
            {step === 1 ? 'Step 1: Identity & Communication' : `Step 2: ${type === ContactType.BUYER ? 'Buyer Search Criteria' : 'Seller Property Info'}`}
          </p>
        </div>
      </header>

      {/* Progress Bar */}
      <div style={{ width: '100%', maxWidth: '800px', height: '4px', backgroundColor: 'var(--color-border)', borderRadius: '2px', position: 'relative' }}>
        <motion.div
          animate={{ width: step === 1 ? '50%' : '100%' }}
          style={{ height: '100%', backgroundColor: 'var(--color-primary)', borderRadius: '2px' }}
        />
      </div>

      <form onSubmit={handleSubmit} className="card" style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
          >
            <div className="grid grid-2">
              <div style={inputGroupStyle}>
                <label style={labelStyle}>Contact Category</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setType(ContactType.BUYER)}
                    className={`btn ${type === ContactType.BUYER ? 'btn-primary' : 'btn-outline'}`}
                    style={{ flex: 1, gap: '0.5rem' }}
                  >
                    <Target size={18} /> Buyer
                  </button>
                  <button
                    type="button"
                    onClick={() => setType(ContactType.SELLER)}
                    className={`btn ${type === ContactType.SELLER ? 'btn-primary' : 'btn-outline'}`}
                    style={{ flex: 1, gap: '0.5rem' }}
                  >
                    <Home size={18} /> Seller
                  </button>
                </div>
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
            />

            <div style={inputGroupStyle}>
              <label htmlFor="phone" style={labelStyle}>Phone Number</label>
              <PhoneInput id="phone" value={baseData.phone} onChange={handlePhoneChange} />
            </div>

            <Input
              label="Lead Source"
              id="leadSource"
              name="leadSource"
              value={baseData.leadSource}
              onChange={handleBaseChange}
              placeholder="e.g. Website, Referral, Zillow"
              icon={Layers}
            />

            <Textarea
              label="Internal Notes"
              id="notes"
              name="notes"
              value={baseData.notes}
              onChange={handleBaseChange}
              placeholder="Any additional details..."
            />

            <div style={{ display: 'flex', flexDirection: 'column', marginTop: '1rem' }}>
              <button type="button" onClick={nextStep} className="btn btn-primary" style={{ gap: '0.5rem', width: '100%', justifyContent: 'center' }}>
                Continue to Profile <ArrowRight size={18} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && type === ContactType.BUYER && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
          >
            <div className="grid grid-2">
              <Input
                label="Min Budget"
                id="minBudget"
                name="minBudget"
                type="number"
                value={buyerProfile.minBudget || ''}
                onChange={(e) => handleBuyerChange('minBudget', Number(e.target.value))}
                placeholder="Min"
                icon={DollarSign}
              />
              <Input
                label="Max Budget"
                id="maxBudget"
                name="maxBudget"
                type="number"
                value={buyerProfile.maxBudget || ''}
                onChange={(e) => handleBuyerChange('maxBudget', Number(e.target.value))}
                placeholder="Max"
                icon={DollarSign}
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
                onChange={(e) => handleBuyerChange('minBedrooms', Number(e.target.value))}
                placeholder="e.g. 3"
              />
              <Input
                label="Min Bathrooms"
                id="minBathrooms"
                name="minBathrooms"
                type="number"
                value={buyerProfile.minBathrooms || ''}
                onChange={(e) => handleBuyerChange('minBathrooms', Number(e.target.value))}
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
              <button type="button" onClick={prevStep} className="btn btn-outline back-btn" style={{ gap: '0.5rem', flex: 1, minWidth: '100px' }}>
                <ArrowLeft size={18} /> Back
              </button>
              <div style={{ display: 'flex', gap: '1rem', flex: 2, minWidth: '200px' }}>
                <button type="button" onClick={onCancel} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ flex: 2, gap: '0.5rem' }}>
                  {isLoading ? <Loader2 size={20} className="animate-spin" /> : <><Save size={20} /> Save</>}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && type === ContactType.SELLER && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
          >
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
              <button type="button" onClick={prevStep} className="btn btn-outline back-btn" style={{ gap: '0.5rem', flex: 1, minWidth: '100px' }}>
                <ArrowLeft size={18} /> Back
              </button>
              <div style={{ display: 'flex', gap: '1rem', flex: 2, minWidth: '200px' }}>
                <button type="button" onClick={onCancel} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ flex: 2, gap: '0.5rem' }}>
                  {isLoading ? <Loader2 size={20} className="animate-spin" /> : <><Save size={20} /> Save Contact</>}
                </button>
              </div>
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
