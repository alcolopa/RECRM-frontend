import { useState, useEffect } from 'react';
import {
  X,
  Save,
  Building2,
  MapPin,
  DollarSign,
  Info,
  ChevronLeft,
  Image as ImageIcon,
  Upload,
  Trash2,
  Loader2,
  AlertCircle,
  User,
  Sparkles,
  Check,
  Scale,
  Tag,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Property, propertyService, type PropertyImage, type Feature } from '../api/properties';
import { Input, Select, Textarea } from './Input';
import Button from './Button';
import ContactSelector from './ContactSelector';
import UserSelector from './UserSelector';
import ConfirmModal from './ConfirmModal';
import { ContactType } from '../api/contacts';
import { useNavigation } from '../contexts/NavigationContext';
import { useUnits } from '../contexts/UnitContext';
import { getCountries, getGovernorates, getCities } from '../data/locationData';
import { getImageUrl } from '../utils/url';
import { mapBackendErrors, getErrorMessage } from '../utils/errors';
import { compressImage, revokeImageUrl, createImageUrl } from '../utils/image';

interface PropertyFormProps {
  property?: Property;
  onSave: (data: Partial<Property>) => Promise<Property | void>;
  onCancel: () => void;
  onSuccess?: (property?: Property) => void;
  organizationId: string;
}

interface PropertyFormData {
  id?: string;
  title: string;
  description: string;
  listingType: string;
  referenceCode: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  governorate: string;
  district: string;
  street: string;
  buildingName: string;
  floor: string;
  unitNumber: string;
  latitude: string | number;
  longitude: string | number;
  price: string | number;
  currency: string;
  negotiable: boolean;
  status: string;
  type: string;
  bedrooms: string | number;
  bathrooms: string | number;
  area: string | number;
  livingRooms: string | number;
  kitchens: string | number;
  parkingSpaces: string | number;
  floorNumber: string | number;
  totalFloors: string | number;
  yearBuilt: string | number;
  condition: string;
  furnished: boolean;
  // Sale pricing
  pricePerSqm: string | number;
  commissionBuyerPercent: string | number;
  commissionSellerPercent: string | number;
  paymentTerms: Record<string, any> | null;
  // Rent pricing
  rentalPeriod: string;
  rentAmount: string | number;
  paymentFrequency: string;
  advancePaymentMonths: string | number;
  securityDeposit: string | number;
  minLeaseDurationMonths: string | number;
  maxLeaseDurationMonths: string | number;
  utilitiesIncluded: boolean;
  availableFrom: string;
  renewalTerms: string;
  // Lease pricing
  leaseTermYears: string | number;
  rentEscalation: string;
  fitOutPeriod: string;
  serviceCharges: string | number;
  insuranceRequired: boolean;
  maintenanceResponsibility: string;
  // Legal
  ownerName: string;
  ownerContactId: string;
  ownershipType: string;
  titleDeedAvailable: boolean;
  zoningType: string;
  legalNotes: string;
  // CRM
  source: string;
  listingDate: string;
  expiryDate: string;
  priority: string;
  propertyTags: string[];
  // Existing
  features: any[];
  featureIds: string[];
  propertyImages: any[];
  organizationId: string;
  assignedUserId: string;
  sellerProfileId: string;
  [key: string]: any;
}

const defaultFormData: PropertyFormData = {
  title: '',
  description: '',
  listingType: '',
  referenceCode: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'Lebanon',
  governorate: '',
  district: '',
  street: '',
  buildingName: '',
  floor: '',
  unitNumber: '',
  latitude: '',
  longitude: '',
  price: '',
  currency: 'USD',
  negotiable: false,
  status: 'AVAILABLE',
  type: 'HOUSE',
  bedrooms: '',
  bathrooms: '',
  area: '',
  livingRooms: '',
  kitchens: '',
  parkingSpaces: '',
  floorNumber: '',
  totalFloors: '',
  yearBuilt: '',
  condition: '',
  furnished: false,
  pricePerSqm: '',
  commissionBuyerPercent: '',
  commissionSellerPercent: '',
  paymentTerms: null,
  rentalPeriod: '',
  rentAmount: '',
  paymentFrequency: '',
  advancePaymentMonths: '',
  securityDeposit: '',
  minLeaseDurationMonths: '',
  maxLeaseDurationMonths: '',
  utilitiesIncluded: false,
  availableFrom: '',
  renewalTerms: '',
  leaseTermYears: '',
  rentEscalation: '',
  fitOutPeriod: '',
  serviceCharges: '',
  insuranceRequired: false,
  maintenanceResponsibility: '',
  ownerName: '',
  ownerContactId: '',
  ownershipType: '',
  titleDeedAvailable: false,
  zoningType: '',
  legalNotes: '',
  source: '',
  listingDate: '',
  expiryDate: '',
  priority: '',
  propertyTags: [],
  features: [],
  featureIds: [],
  propertyImages: [],
  organizationId: '',
  assignedUserId: '',
  sellerProfileId: '',
};

const PropertyForm: React.FC<PropertyFormProps> = ({ property, onSave, onCancel, onSuccess, organizationId }) => {
  const [formData, setFormData] = useState<PropertyFormData>({
    ...defaultFormData,
    organizationId,
  });

  const [availableFeatures, setAvailableFeatures] = useState<Feature[]>([]);
  const [selectedFeatureIds, setSelectedFeatureIds] = useState<Set<string>>(new Set());
  const [featureSearchTerm, setFeatureSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [internalImages, setInternalImages] = useState<PropertyImage[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const { displayAreaValue, displayAreaLabel, convertToSqm } = useUnits();
  const { navigationState, navigate, clearNavigationState } = useNavigation();

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      Object.keys(previewUrls).forEach(key => {
        if (previewUrls[key].startsWith('blob:')) {
          revokeImageUrl(previewUrls[key]);
        }
      });
    };
  }, [previewUrls]);

  // Load available features from API
  useEffect(() => {
    const loadFeatures = async () => {
      try {
        const response = await propertyService.getFeatures();
        setAvailableFeatures(response.data);
      } catch (err) {
        console.error('Failed to load features', err);
      }
    };
    loadFeatures();
  }, []);

  useEffect(() => {
    // 1. Initial load or switch: set property data
    if (property) {
      setFormData((prev: PropertyFormData) => ({ 
        ...prev, 
        ...property,
        area: displayAreaValue(property.area || 0),
        country: property.country || 'Lebanon',
      }));
      setInternalImages(property.propertyImages || []);
      
      // Set selected feature IDs from property's existing features (which are now strings)
      if (property.features && property.features.length > 0 && availableFeatures.length > 0) {
        const featureIds = property.features.map(fName => {
            const match = availableFeatures.find(af => af.name === (typeof fName === 'string' ? fName : (fName as any).name));
            return match?.id;
        }).filter(Boolean) as string[];
        setSelectedFeatureIds(new Set(featureIds));
      }
    }

    // 2. Draft restoration (for both NEW and EDIT flows)
    if (navigationState.context === 'creating-seller' && navigationState.draftData) {
      setFormData((prev: PropertyFormData) => ({ ...prev, ...navigationState.draftData }));
      
      // Restore selected features from draft
      if (navigationState.draftData.featureIds) {
        setSelectedFeatureIds(new Set(navigationState.draftData.featureIds));
      }
      
      // 3. New seller ID application
      if (navigationState.prefillData?.newSellerProfileId) {
        setFormData((prev: PropertyFormData) => ({ 
          ...prev, 
          sellerProfileId: navigationState.prefillData.newSellerProfileId 
        }));
      }
    }
  }, [property, navigationState, availableFeatures]);

  const handleNewSellerRedirect = () => {
    navigate('contacts', {
      returnTo: 'properties',
      draftData: { ...formData, featureIds: Array.from(selectedFeatureIds) },
      prefillData: { type: ContactType.SELLER },
      context: 'creating-seller'
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    setIsUploading(true);
    
    try {
      // 1. Process and compress images
      const processedFiles: File[] = [];
      const newPreviewUrls: Record<string, string> = { ...previewUrls };
      
      for (const file of fileList) {
        // Compress if it's an image
        const processedFile = await compressImage(file);
        processedFiles.push(processedFile);
        
        // Create preview URL
        const previewUrl = createImageUrl(processedFile);
        const fileKey = `${processedFile.name}-${Date.now()}`;
        newPreviewUrls[fileKey] = previewUrl;
      }
      
      setPreviewUrls(newPreviewUrls);

      if (property?.id) {
        // Existing property: upload immediately
        // We use a for-of loop to upload sequentially on mobile to avoid overwhelming the connection
        for (let i = 0; i < processedFiles.length; i++) {
          const file = processedFiles[i];
          const fileId = Object.keys(newPreviewUrls).find(key => newPreviewUrls[key].includes(file.name)) || `${file.name}-${Date.now()}`;
          
          setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
          
          const response = await propertyService.uploadImage(
            property.id, 
            file, 
            organizationId,
            (progress: number) => setUploadProgress(prev => ({ ...prev, [fileId]: progress }))
          );
          
          setInternalImages(prev => [...prev, response.data]);
          
          // Briefly keep at 100 before removing from progress tracking
          setTimeout(() => {
            setUploadProgress(prev => {
              const next = { ...prev };
              delete next[fileId];
              return next;
            });
          }, 1000);
        }
      } else {
        // New property: add to pending
        setPendingFiles(prev => [...prev, ...processedFiles]);
      }
    } catch (err) {
      console.error('Failed to process/upload images', err);
      setError('Failed to process some images. Please try again.');
    } finally {
      setIsUploading(false);
      // Clear input
      e.target.value = '';
    }
  };

  const handleImageDelete = (index: number, isPending: boolean) => {
    setDeletingImageId(isPending ? `pending-${index}` : internalImages[index].id);
  };

  const confirmImageDelete = async () => {
    if (!deletingImageId) return;

    if (deletingImageId.startsWith('pending-')) {
      const index = parseInt(deletingImageId.split('-')[1]);
      const file = pendingFiles[index];
      
      // Cleanup preview URL
      const previewKey = Object.keys(previewUrls).find(key => previewUrls[key].includes(file.name));
      if (previewKey) {
        revokeImageUrl(previewUrls[previewKey]);
        setPreviewUrls(prev => {
          const next = { ...prev };
          delete next[previewKey];
          return next;
        });
      }
      
      setPendingFiles(prev => prev.filter((_, i) => i !== index));
      setDeletingImageId(null);
      return;
    }

    setIsDeletingImage(true);
    try {
      await propertyService.deleteImage(deletingImageId, organizationId);
      setInternalImages(prev => prev.filter(img => img.id !== deletingImageId));
      setDeletingImageId(null);
    } catch (err) {
      console.error('Failed to delete image', err);
      setError('Failed to delete image.');
    } finally {
      setIsDeletingImage(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData((prev: PropertyFormData) => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    
    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (Number(formData.price) < 0) {
      newErrors.price = 'Price cannot be negative';
    }

    if (formData.area && Number(formData.area) <= 0) {
      newErrors.area = 'Area must be greater than 0';
    }

    if (formData.bedrooms && Number(formData.bedrooms) < 0) {
      newErrors.bedrooms = 'Bedrooms cannot be negative';
    }

    if (formData.bathrooms && Number(formData.bathrooms) < 0) {
      newErrors.bathrooms = 'Bathrooms cannot be negative';
    }

    if (!formData.type) newErrors.type = 'Property type is required';
    if (!formData.status) newErrors.status = 'Status is required';
    
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.sellerProfileId) newErrors.sellerProfileId = 'Seller is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (id: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  // Location handlers
  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const country = e.target.value;
    setFormData((prev: PropertyFormData) => ({ ...prev, country, governorate: '', city: '' }));
  };

  const handleGovernorateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const governorate = e.target.value;
    setFormData((prev: PropertyFormData) => ({ ...prev, governorate, city: '' }));
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const city = e.target.value;
    setFormData((prev: PropertyFormData) => ({ ...prev, city }));
  };

  // Feature handlers
  const toggleFeature = (featureId: string) => {
    setSelectedFeatureIds(prev => {
      const next = new Set(prev);
      if (next.has(featureId)) {
        next.delete(featureId);
      } else {
        next.add(featureId);
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsSaving(true);
    setError(null);

    // Filter out fields that the backend doesn't accept in Create/Update DTOs
    const cleanRest = { ...formData } as any;
    delete cleanRest.assignedUser;
    delete cleanRest.sellerProfile;
    delete cleanRest.propertyImages;
    delete cleanRest.propertyFeatures;
    delete cleanRest.deals;
    delete cleanRest.tags;
    delete cleanRest.createdAt;
    delete cleanRest.updatedAt;
    delete cleanRest.id;
    delete cleanRest.features;
    delete cleanRest.negotiations;
    delete cleanRest.organization;
    delete cleanRest.createdBy;
    delete cleanRest.ownerContact;
    delete cleanRest.viewsCount;
    delete cleanRest.inquiriesCount;
    delete cleanRest.lastViewedAt;

    const toNum = (v: any) => v === '' || v === undefined || v === null ? undefined : Number(v);
    const toStr = (v: any) => v === '' ? undefined : v;

    const submissionData = {
      ...cleanRest,
      price: toNum(formData.price),
      bedrooms: toNum(formData.bedrooms),
      bathrooms: toNum(formData.bathrooms),
      area: formData.area === '' ? undefined : convertToSqm(Number(formData.area)),
      yearBuilt: toNum(formData.yearBuilt),
      livingRooms: toNum(formData.livingRooms),
      kitchens: toNum(formData.kitchens),
      parkingSpaces: toNum(formData.parkingSpaces),
      floorNumber: toNum(formData.floorNumber),
      totalFloors: toNum(formData.totalFloors),
      latitude: toNum(formData.latitude),
      longitude: toNum(formData.longitude),
      sizeSqm: toNum(formData.sizeSqm),
      landSizeSqm: toNum(formData.landSizeSqm),
      pricePerSqm: toNum(formData.pricePerSqm),
      commissionBuyerPercent: toNum(formData.commissionBuyerPercent),
      commissionSellerPercent: toNum(formData.commissionSellerPercent),
      rentAmount: toNum(formData.rentAmount),
      advancePaymentMonths: toNum(formData.advancePaymentMonths),
      securityDeposit: toNum(formData.securityDeposit),
      minLeaseDurationMonths: toNum(formData.minLeaseDurationMonths),
      maxLeaseDurationMonths: toNum(formData.maxLeaseDurationMonths),
      leaseTermYears: toNum(formData.leaseTermYears),
      serviceCharges: toNum(formData.serviceCharges),
      listingType: toStr(formData.listingType),
      referenceCode: toStr(formData.referenceCode),
      condition: toStr(formData.condition),
      rentalPeriod: toStr(formData.rentalPeriod),
      paymentFrequency: toStr(formData.paymentFrequency),
      maintenanceResponsibility: toStr(formData.maintenanceResponsibility),
      ownershipType: toStr(formData.ownershipType),
      zoningType: toStr(formData.zoningType),
      source: toStr(formData.source),
      priority: toStr(formData.priority),
      availableFrom: formData.availableFrom || null,
      listingDate: formData.listingDate || null,
      expiryDate: formData.expiryDate || null,
      featureIds: Array.from(selectedFeatureIds),
      assignedUserId: formData.assignedUserId || null,
    };

    try {
      // 1. Save property (create or update)
      const savedProperty = await onSave(submissionData);

      // 2. If it was a new property and we have pending files, upload them now sequentially
      if (savedProperty && pendingFiles.length > 0) {
        setIsUploading(true);
        
        for (const file of pendingFiles) {
          const previewKey = Object.keys(previewUrls).find(key => previewUrls[key].includes(file.name));
          const fileId = previewKey || `${file.name}-${Date.now()}`;
          
          setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
          
          try {
            await propertyService.uploadImage(
              savedProperty.id, 
              file,
              organizationId,
              (progress: number) => setUploadProgress(prev => ({ ...prev, [fileId]: progress }))
            );
          } catch (err) {
            console.error('Failed to upload a pending image', err);
          } finally {
            setTimeout(() => {
              setUploadProgress(prev => {
                const next = { ...prev };
                delete next[fileId];
                return next;
              });
            }, 1000);
          }
        }
      }

      // Parent handleSave already handles redirection if it finishes successfully
      // We will now handle navigation here after images are fully uploaded
      clearNavigationState();
      if (onSuccess) onSuccess(savedProperty as Property);
      else onCancel();
    } catch (err: any) {
      console.error('Failed to submit form', err);
      setError(getErrorMessage(err, 'Failed to save property. Please check your information.'));
      const backendErrors = mapBackendErrors(err);
      if (Object.keys(backendErrors).length > 0) {
        setErrors(backendErrors);
      }
    } finally {
      setIsSaving(false);
      setIsUploading(false);
    }
  };

  // Group features by category for display
  const groupedFeatures = availableFeatures.reduce<Record<string, Feature[]>>((groups, feature) => {
    const category = feature.category || 'Other';
    if (!groups[category]) groups[category] = [];
    groups[category].push(feature);
    return groups;
  }, {});

  // Filter features by search
  const filteredGroupedFeatures = Object.entries(groupedFeatures).reduce<Record<string, Feature[]>>((acc, [category, features]) => {
    const filtered = features.filter(f => f.name.toLowerCase().includes(featureSearchTerm.toLowerCase()));
    if (filtered.length > 0) acc[category] = filtered;
    return acc;
  }, {});

  // Location data
  const countries = getCountries();
  const governorates = formData.country ? getGovernorates(formData.country) : [];
  const cities = formData.country && formData.governorate ? getCities(formData.country, formData.governorate) : [];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
        style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}
      >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Button
          variant="ghost"
          onClick={() => {
            clearNavigationState();
            onCancel();
          }}
          aria-label="Back to properties"
          style={{ padding: '0.5rem', borderRadius: '50%', width: '40px', height: '40px' }}
        >
          <ChevronLeft size={24} />
        </Button>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
          {property ? 'Edit Property' : 'Add New Property'}
        </h2>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={errorContainerStyle}
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

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Section: Basic Info */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}><Info size={18} /> Basic Information</h3>
          <div className="grid grid-2" style={{ gap: '1rem' }}>
            <Input
              label="Property Title*"
              id="title"
              name="title"
              required
              placeholder="Modern Villa"
              value={formData.title}
              onChange={handleChange}
              error={errors.title}
            />
            <Input
              label="Price ($)*"
              id="price"
              name="price"
              type="number"
              required
              placeholder="450000"
              value={formData.price}
              onChange={handleChange}
              icon={DollarSign}
              error={errors.price}
            />
          </div>
          <Textarea
            label="Description"
            id="description"
            name="description"
            rows={3}
            placeholder="Describe the property..."
            value={formData.description}
            onChange={handleChange}
            style={{ resize: 'vertical' }}
            error={errors.description}
          />
        </div>

        {/* Section: Seller */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}><User size={18} /> Property Owner (Seller)</h3>
          <ContactSelector 
            organizationId={organizationId}
            selectedContactId={formData.sellerProfileId}
            onSelect={(sellerProfileId) => handleFieldChange('sellerProfileId', sellerProfileId)}
            restrictType={ContactType.SELLER}
            onNewContactRequested={handleNewSellerRedirect}
            error={errors.sellerProfileId}
          />
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
            Link this property to an existing contact or create a new one as a seller.
          </p>
        </div>

        {/* Section: Agent */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}><User size={18} /> Listing Agent</h3>
          <UserSelector 
            organizationId={organizationId}
            selectedUserId={formData.assignedUserId}
            onSelect={(assignedUserId) => handleFieldChange('assignedUserId', assignedUserId)}
            error={errors.assignedUserId}
          />
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
            Assign an agent to manage this property.
          </p>
        </div>

        {/* Section: Images */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}><ImageIcon size={18} /> Property Images</h3>

          <div style={imageGridStyle}>
            {/* Existing Images */}
            {internalImages.map((img, idx) => (
              <div key={img.id} style={imageContainerStyle}>
                <img src={getImageUrl(img.url)} alt="Property" style={imageStyle} />
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleImageDelete(idx, false)}
                  aria-label="Delete image"
                  style={deleteImageButtonStyle}
                  title="Delete image"
                  leftIcon={<Trash2 size={14} />}
                />
              </div>
            ))}

            {/* Pending Previews */}
            {pendingFiles.map((file, idx) => {
              const previewKey = Object.keys(previewUrls).find(key => previewUrls[key].includes(file.name));
              const previewUrl = previewKey ? previewUrls[previewKey] : '';
              const progress = previewKey ? uploadProgress[previewKey] : undefined;
              const isUploadingThis = progress !== undefined;

              return (
                <div key={`pending-${idx}`} style={{ ...imageContainerStyle, opacity: isUploadingThis ? 1 : 0.7 }}>
                  {previewUrl && <img src={previewUrl} alt="Pending" style={imageStyle} />}
                  {!isUploadingThis && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleImageDelete(idx, true)}
                      aria-label="Remove pending image"
                      style={deleteImageButtonStyle}
                      title="Remove image"
                      leftIcon={<Trash2 size={14} />}
                    />
                  )}
                  {isUploadingThis ? (
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: 'rgba(255,255,255,0.3)',
                      zIndex: 2
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${progress}%`,
                        background: 'var(--color-primary)',
                        transition: 'width 0.2s ease-out'
                      }} />
                    </div>
                  ) : (
                    <div style={pendingBadgeStyle}>Pending</div>
                  )}
                  {isUploadingThis && (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(0,0,0,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                    }}>
                      {progress}%
                    </div>
                  )}
                </div>
              );
            })}

            <label style={uploadButtonStyle}>
              {isUploading ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <>
                  <Upload size={24} />
                  <span style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Upload</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
                disabled={isUploading}
                multiple
              />
            </label>
          </div>
        </div>

        {/* Section: Details */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}><Building2 size={18} /> Property Details</h3>
          <div className="grid grid-2 grid-3" style={{ gap: '1rem' }}>
            <Select
              label="Property Type"
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              options={[
                { value: 'APARTMENT', label: 'Apartment' },
                { value: 'HOUSE', label: 'House' },
                { value: 'VILLA', label: 'Villa' },
                { value: 'OFFICE', label: 'Office' },
                { value: 'SHOP', label: 'Shop' },
                { value: 'LAND', label: 'Land' },
                { value: 'WAREHOUSE', label: 'Warehouse' },
                { value: 'BUILDING', label: 'Building' },
              ]}
            />
            <Select
              label="Listing Type"
              id="listingType"
              name="listingType"
              value={formData.listingType}
              onChange={handleChange}
              options={[
                { value: '', label: 'Select...' },
                { value: 'SALE', label: 'For Sale' },
                { value: 'RENT', label: 'For Rent' },
                { value: 'LEASE', label: 'For Lease' },
              ]}
            />
            <Select
              label="Status"
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              options={[
                { value: 'AVAILABLE', label: 'Available' },
                { value: 'RESERVED', label: 'Reserved' },
                { value: 'SOLD', label: 'Sold' },
                { value: 'RENTED', label: 'Rented' },
                { value: 'OFF_MARKET', label: 'Off Market' },
              ]}
            />
            <Input label="Reference Code" id="referenceCode" name="referenceCode" placeholder="REF-001" value={formData.referenceCode} onChange={handleChange} />
            <Input label={`Area (${displayAreaLabel})`} id="area" name="area" type="number" placeholder="2500" value={formData.area} onChange={handleChange} />
            <Input label="Land Size (sqm)" id="landSizeSqm" name="landSizeSqm" type="number" placeholder="500" value={formData.landSizeSqm} onChange={handleChange} />
            <Input label="Bedrooms" id="bedrooms" name="bedrooms" type="number" placeholder="3" value={formData.bedrooms} onChange={handleChange} />
            <Input label="Bathrooms" id="bathrooms" name="bathrooms" type="number" step="0.5" placeholder="2.5" value={formData.bathrooms} onChange={handleChange} />
            <Input label="Living Rooms" id="livingRooms" name="livingRooms" type="number" placeholder="1" value={formData.livingRooms} onChange={handleChange} />
            <Input label="Kitchens" id="kitchens" name="kitchens" type="number" placeholder="1" value={formData.kitchens} onChange={handleChange} />
            <Input label="Parking Spaces" id="parkingSpaces" name="parkingSpaces" type="number" placeholder="2" value={formData.parkingSpaces} onChange={handleChange} />
            <Input label="Floor Number" id="floorNumber" name="floorNumber" type="number" value={formData.floorNumber} onChange={handleChange} />
            <Input label="Total Floors" id="totalFloors" name="totalFloors" type="number" value={formData.totalFloors} onChange={handleChange} />
            <Input label="Year Built" id="yearBuilt" name="yearBuilt" type="number" placeholder="2020" value={formData.yearBuilt} onChange={handleChange} />
            <Select label="Condition" id="condition" name="condition" value={formData.condition} onChange={handleChange} options={[
              { value: '', label: 'Select...' },
              { value: 'NEW', label: 'New' },
              { value: 'GOOD', label: 'Good' },
              { value: 'NEEDS_RENOVATION', label: 'Needs Renovation' },
              { value: 'UNDER_CONSTRUCTION', label: 'Under Construction' },
            ]} />
          </div>
          <div style={{ marginTop: '0.75rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={!!formData.furnished} onChange={e => handleFieldChange('furnished', e.target.checked)} />
              Furnished
            </label>
          </div>
        </div>

        {/* Section: Pricing & Financials */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}><DollarSign size={18} /> Pricing & Financials</h3>
          <div className="grid grid-2 grid-3" style={{ gap: '1rem' }}>
            <Input label="Price" id="price" name="price" type="number" placeholder="450000" value={formData.price} onChange={handleChange} icon={DollarSign} error={errors.price} />
            <Input label="Currency" id="currency" name="currency" placeholder="USD" value={formData.currency} onChange={handleChange} />
          </div>
          <div style={{ marginTop: '0.75rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={!!formData.negotiable} onChange={e => handleFieldChange('negotiable', e.target.checked)} />
              Negotiable
            </label>
          </div>

          {/* Sale-specific fields */}
          {(formData.listingType === 'SALE' || !formData.listingType) && (
            <div style={{ marginTop: '1rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>Sale Details</div>
              <div className="grid grid-2 grid-3" style={{ gap: '1rem' }}>
                <Input label="Price per sqm" id="pricePerSqm" name="pricePerSqm" type="number" value={formData.pricePerSqm} onChange={handleChange} />
                <Input label="Buyer Commission %" id="commissionBuyerPercent" name="commissionBuyerPercent" type="number" step="0.1" value={formData.commissionBuyerPercent} onChange={handleChange} />
                <Input label="Seller Commission %" id="commissionSellerPercent" name="commissionSellerPercent" type="number" step="0.1" value={formData.commissionSellerPercent} onChange={handleChange} />
              </div>
            </div>
          )}

          {/* Rent-specific fields */}
          {(formData.listingType === 'RENT' || formData.listingType === 'LEASE') && (
            <div style={{ marginTop: '1rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>Rental Details</div>
              <div className="grid grid-2 grid-3" style={{ gap: '1rem' }}>
                <Input label="Rent Amount" id="rentAmount" name="rentAmount" type="number" value={formData.rentAmount} onChange={handleChange} />
                <Select label="Rental Period" id="rentalPeriod" name="rentalPeriod" value={formData.rentalPeriod} onChange={handleChange} options={[
                  { value: '', label: 'Select...' }, { value: 'DAILY', label: 'Daily' }, { value: 'WEEKLY', label: 'Weekly' }, { value: 'MONTHLY', label: 'Monthly' }, { value: 'YEARLY', label: 'Yearly' },
                ]} />
                <Select label="Payment Frequency" id="paymentFrequency" name="paymentFrequency" value={formData.paymentFrequency} onChange={handleChange} options={[
                  { value: '', label: 'Select...' }, { value: 'MONTHLY', label: 'Monthly' }, { value: 'QUARTERLY', label: 'Quarterly' }, { value: 'YEARLY', label: 'Yearly' },
                ]} />
                <Input label="Advance Payment (months)" id="advancePaymentMonths" name="advancePaymentMonths" type="number" value={formData.advancePaymentMonths} onChange={handleChange} />
                <Input label="Security Deposit" id="securityDeposit" name="securityDeposit" type="number" value={formData.securityDeposit} onChange={handleChange} />
                <Input label="Min Lease (months)" id="minLeaseDurationMonths" name="minLeaseDurationMonths" type="number" value={formData.minLeaseDurationMonths} onChange={handleChange} />
                <Input label="Max Lease (months)" id="maxLeaseDurationMonths" name="maxLeaseDurationMonths" type="number" value={formData.maxLeaseDurationMonths} onChange={handleChange} />
                <Input label="Available From" id="availableFrom" name="availableFrom" type="date" value={formData.availableFrom} onChange={handleChange} />
              </div>
              <div style={{ marginTop: '0.75rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={!!formData.utilitiesIncluded} onChange={e => handleFieldChange('utilitiesIncluded', e.target.checked)} />
                  Utilities Included
                </label>
              </div>
              <Textarea label="Renewal Terms" id="renewalTerms" name="renewalTerms" rows={2} value={formData.renewalTerms} onChange={handleChange} style={{ resize: 'vertical', marginTop: '0.75rem' }} />
            </div>
          )}

          {/* Lease-specific fields */}
          {formData.listingType === 'LEASE' && (
            <div style={{ marginTop: '1rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>Commercial Lease Details</div>
              <div className="grid grid-2 grid-3" style={{ gap: '1rem' }}>
                <Input label="Lease Term (years)" id="leaseTermYears" name="leaseTermYears" type="number" value={formData.leaseTermYears} onChange={handleChange} />
                <Input label="Rent Escalation" id="rentEscalation" name="rentEscalation" placeholder="5% per year" value={formData.rentEscalation} onChange={handleChange} />
                <Input label="Fit-Out Period" id="fitOutPeriod" name="fitOutPeriod" placeholder="3 months" value={formData.fitOutPeriod} onChange={handleChange} />
                <Input label="Service Charges" id="serviceCharges" name="serviceCharges" type="number" value={formData.serviceCharges} onChange={handleChange} />
                <Select label="Maintenance" id="maintenanceResponsibility" name="maintenanceResponsibility" value={formData.maintenanceResponsibility} onChange={handleChange} options={[
                  { value: '', label: 'Select...' }, { value: 'OWNER', label: 'Owner' }, { value: 'TENANT', label: 'Tenant' }, { value: 'SHARED', label: 'Shared' },
                ]} />
              </div>
              <div style={{ marginTop: '0.75rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={!!formData.insuranceRequired} onChange={e => handleFieldChange('insuranceRequired', e.target.checked)} />
                  Insurance Required
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Section: Legal & Ownership */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}><Scale size={18} /> Legal & Ownership</h3>
          <div className="grid grid-2 grid-3" style={{ gap: '1rem' }}>
            <Input label="Owner Name" id="ownerName" name="ownerName" placeholder="Full name" value={formData.ownerName} onChange={handleChange} />
            <Select label="Ownership Type" id="ownershipType" name="ownershipType" value={formData.ownershipType} onChange={handleChange} options={[
              { value: '', label: 'Select...' }, { value: 'FREEHOLD', label: 'Freehold' }, { value: 'LEASEHOLD', label: 'Leasehold' },
            ]} />
            <Select label="Zoning" id="zoningType" name="zoningType" value={formData.zoningType} onChange={handleChange} options={[
              { value: '', label: 'Select...' }, { value: 'RESIDENTIAL', label: 'Residential' }, { value: 'COMMERCIAL', label: 'Commercial' }, { value: 'MIXED', label: 'Mixed Use' },
            ]} />
          </div>
          <div style={{ marginTop: '0.75rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={!!formData.titleDeedAvailable} onChange={e => handleFieldChange('titleDeedAvailable', e.target.checked)} />
              Title Deed Available
            </label>
          </div>
          <Textarea label="Legal Notes" id="legalNotes" name="legalNotes" rows={2} value={formData.legalNotes} onChange={handleChange} style={{ resize: 'vertical', marginTop: '0.5rem' }} />
        </div>

        {/* Section: CRM */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}><Tag size={18} /> CRM Details</h3>
          <div className="grid grid-2 grid-3" style={{ gap: '1rem' }}>
            <Select label="Source" id="source" name="source" value={formData.source} onChange={handleChange} options={[
              { value: '', label: 'Select...' }, { value: 'MANUAL', label: 'Manual' }, { value: 'WEBSITE', label: 'Website' }, { value: 'WHATSAPP', label: 'WhatsApp' }, { value: 'REFERRAL', label: 'Referral' },
            ]} />
            <Select label="Priority" id="priority" name="priority" value={formData.priority} onChange={handleChange} options={[
              { value: '', label: 'Select...' }, { value: 'LOW', label: 'Low' }, { value: 'MEDIUM', label: 'Medium' }, { value: 'HIGH', label: 'High' },
            ]} />
            <Input label="Listing Date" id="listingDate" name="listingDate" type="date" value={formData.listingDate} onChange={handleChange} />
            <Input label="Expiry Date" id="expiryDate" name="expiryDate" type="date" value={formData.expiryDate} onChange={handleChange} />
          </div>
        </div>

        {/* Section: Location */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}><MapPin size={18} /> Location</h3>
          <Input
            label="Street Address*"
            id="address"
            name="address"
            required
            placeholder="123 Main St"
            value={formData.address}
            onChange={handleChange}
            error={errors.address}
          />
          <div className="grid grid-3" style={{ gap: '1rem' }}>
            <Select
              label="Country"
              id="country"
              name="country"
              value={formData.country || ''}
              onChange={handleCountryChange}
              searchable
              options={[
                { value: '', label: 'Select Country' },
                ...countries.map(c => ({ value: c, label: c }))
              ]}
            />
            <Select
              label="Governorate"
              id="governorate"
              name="governorate"
              value={formData.governorate || ''}
              onChange={handleGovernorateChange}
              searchable
              options={[
                { value: '', label: 'Select Governorate' },
                ...governorates.map(g => ({ value: g, label: g }))
              ]}
            />
            <Select
              label="City / Area"
              id="city"
              name="city"
              value={formData.city || ''}
              onChange={handleCityChange}
              searchable
              options={[
                { value: '', label: 'Select City' },
                ...cities.map(c => ({ value: c, label: c }))
              ]}
            />
          </div>
          <Input label="Zip Code" id="zipCode" name="zipCode" placeholder="1234" value={formData.zipCode} onChange={handleChange} />
          <div className="grid grid-2 grid-3" style={{ gap: '1rem', marginTop: '0.75rem' }}>
            <Input label="District" id="district" name="district" placeholder="Downtown" value={formData.district} onChange={handleChange} />
            <Input label="Street" id="street" name="street" placeholder="Main Street" value={formData.street} onChange={handleChange} />
            <Input label="Building Name" id="buildingName" name="buildingName" placeholder="Tower A" value={formData.buildingName} onChange={handleChange} />
            <Input label="Floor" id="floor" name="floor" placeholder="3rd" value={formData.floor} onChange={handleChange} />
            <Input label="Unit Number" id="unitNumber" name="unitNumber" placeholder="301" value={formData.unitNumber} onChange={handleChange} />
          </div>
        </div>

        {/* Section: Features */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}><Sparkles size={18} /> Features & Amenities</h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
            Select the features that apply to this property.
          </p>

          {/* Search bar */}
          <Input
            id="featureSearch"
            name="featureSearch"
            type="text"
            placeholder="Search features..."
            value={featureSearchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFeatureSearchTerm(e.target.value)}
          />

          {/* Selected features summary */}
          {selectedFeatureIds.size > 0 && (
            <div style={{ marginTop: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={selectedCountStyle}>
                {selectedFeatureIds.size} feature{selectedFeatureIds.size !== 1 ? 's' : ''} selected
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginTop: '0.5rem' }}>
                {Array.from(selectedFeatureIds).map(fId => {
                  const feat = availableFeatures.find(f => f.id === fId);
                  if (!feat) return null;
                  return (
                    <span
                      key={fId}
                      style={selectedFeatureTagStyle}
                      onClick={() => toggleFeature(fId)}
                    >
                      {feat.name}
                      <X size={12} style={{ marginLeft: '0.25rem', cursor: 'pointer' }} />
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Feature categories */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.75rem' }}>
            {Object.entries(filteredGroupedFeatures).map(([category, features]) => (
              <div key={category}>
                <div style={categoryLabelStyle}>{category}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {features.map(feature => {
                    const isSelected = selectedFeatureIds.has(feature.id);
                    return (
                      <button
                        key={feature.id}
                        type="button"
                        onClick={() => toggleFeature(feature.id)}
                        style={{
                          ...featureChipStyle,
                          ...(isSelected ? featureChipSelectedStyle : {}),
                        }}
                      >
                        {isSelected && <Check size={14} style={{ marginRight: '0.25rem' }} />}
                        {feature.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {availableFeatures.length === 0 && (
            <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
              <Loader2 size={20} className="animate-spin" style={{ marginBottom: '0.5rem' }} />
              <div>Loading features...</div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
          <Button
            variant="outline"
            onClick={() => {
              clearNavigationState();
              onCancel();
            }}
            style={{ flex: window.innerWidth <= 768 ? 1 : 'initial' }}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            style={{ flex: window.innerWidth <= 768 ? 1 : 'initial' }}
            isLoading={isSaving}
            leftIcon={!isSaving && <Save size={18} />}
          >
            {isUploading ? 'Uploading...' : property ? 'Update' : 'Save'}
          </Button>
        </div>
      </form>
    </motion.div>

      <ConfirmModal
        isOpen={!!deletingImageId}
        onClose={() => setDeletingImageId(null)}
        onConfirm={confirmImageDelete}
        title="Delete Image"
        message="Are you sure you want to delete this image? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={isDeletingImage}
      />
    </>
  );
};

const sectionStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  padding: '1rem',
  background: 'var(--color-bg)',
  borderRadius: 'var(--radius)',
  border: '1px solid var(--color-border)'
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: '1rem',
  fontWeight: 700,
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  marginBottom: '0.5rem',
  color: 'var(--color-primary)'
};

const imageGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
  gap: '1rem',
};

const imageContainerStyle: React.CSSProperties = {
  position: 'relative',
  aspectRatio: '1',
  borderRadius: '0.5rem',
  overflow: 'hidden',
  border: '1px solid var(--color-border)',
};

const imageStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

const deleteImageButtonStyle: React.CSSProperties = {
  position: 'absolute',
  top: '0.25rem',
  right: '0.25rem',
  background: 'rgba(239, 68, 68, 0.9)',
  color: 'white',
  border: 'none',
  borderRadius: '0.25rem',
  padding: '0.25rem',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  zIndex: 10,
};

const pendingBadgeStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: '0.25rem',
  left: '0.25rem',
  background: 'rgba(16, 185, 129, 0.9)',
  color: 'white',
  fontSize: '0.625rem',
  fontWeight: 700,
  padding: '0.125rem 0.375rem',
  borderRadius: '0.125rem',
  textTransform: 'uppercase',
};

const uploadButtonStyle: React.CSSProperties = {
  aspectRatio: '1',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  border: '2px dashed var(--color-border)',
  borderRadius: '0.5rem',
  cursor: 'pointer',
  color: 'var(--color-text-muted)',
  transition: 'all 0.2s ease',
  background: 'transparent',
};

const errorContainerStyle: React.CSSProperties = {
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
  fontWeight: 500
};

// Feature chip styles
const featureChipStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '0.375rem 0.75rem',
  borderRadius: '2rem',
  fontSize: '0.8125rem',
  fontWeight: 500,
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface)',
  color: 'var(--color-text)',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  outline: 'none',
};

const featureChipSelectedStyle: React.CSSProperties = {
  background: 'rgba(5, 150, 105, 0.1)',
  borderColor: 'var(--color-primary)',
  color: 'var(--color-primary)',
  fontWeight: 600,
};

const selectedFeatureTagStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '0.25rem 0.5rem',
  borderRadius: '1rem',
  fontSize: '0.75rem',
  fontWeight: 600,
  background: 'rgba(5, 150, 105, 0.1)',
  color: 'var(--color-primary)',
  border: '1px solid rgba(5, 150, 105, 0.2)',
  cursor: 'pointer',
};

const selectedCountStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  fontWeight: 600,
  color: 'var(--color-primary)',
};

const categoryLabelStyle: React.CSSProperties = {
  fontSize: '0.6875rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: 'var(--color-text-muted)',
  marginBottom: '0.5rem',
  paddingLeft: '0.25rem',
};

export default PropertyForm;
