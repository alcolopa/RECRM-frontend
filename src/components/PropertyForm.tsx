import { useState, useEffect } from 'react';
import {
  X,
  Save,
  Plus,
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
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Property, propertyService, type PropertyImage } from '../api/properties';
import { Input, Select, Textarea } from './Input';
import Button from './Button';
import ContactSelector from './ContactSelector';
import ConfirmModal from './ConfirmModal';
import { ContactType } from '../api/contacts';
import { useNavigation } from '../contexts/NavigationContext';

interface PropertyFormProps {
  property?: Property;
  onSave: (data: Partial<Property>) => Promise<Property | void>;
  onCancel: () => void;
  organizationId: string;
}

const PropertyForm: React.FC<PropertyFormProps> = ({ property, onSave, onCancel, organizationId }) => {
  const [formData, setFormData] = useState<Partial<Property>>({
    title: '',
    description: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    price: 0,
    status: 'AVAILABLE',
    type: 'HOUSE',
    bedrooms: 0,
    bathrooms: 0,
    area: 0,
    features: [],
    propertyImages: [],
    organizationId,
    sellerProfileId: ''
  });

  const [newFeature, setNewFeature] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [internalImages, setInternalImages] = useState<PropertyImage[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const { navigationState, navigate, clearNavigationState } = useNavigation();

  useEffect(() => {
    // 1. Initial load or switch: set property data
    if (property) {
      setFormData(prev => ({ ...prev, ...property }));
      setInternalImages(property.propertyImages || []);
    }

    // 2. Draft restoration (for both NEW and EDIT flows)
    if (navigationState.context === 'creating-seller' && navigationState.draftData) {
      setFormData(prev => ({ ...prev, ...navigationState.draftData }));
      
      // 3. New seller ID application
      if (navigationState.prefillData?.newSellerProfileId) {
        setFormData(prev => ({ 
          ...prev, 
          sellerProfileId: navigationState.prefillData.newSellerProfileId 
        }));
      }
    }
  }, [property, navigationState]);

  const handleNewSellerRedirect = () => {
    navigate('contacts', {
      returnTo: 'properties',
      draftData: formData,
      prefillData: { type: ContactType.SELLER },
      context: 'creating-seller'
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);

    if (property?.id) {
      // Existing property: upload immediately
      setIsUploading(true);
      try {
        for (const file of fileList) {
          const response = await propertyService.uploadImage(property.id, file);
          setInternalImages(prev => [...prev, response.data]);
        }
      } catch (err) {
        console.error('Failed to upload image', err);
        setError('Failed to upload some images. Please try again.');
      } finally {
        setIsUploading(false);
      }
    } else {
      // New property: add to pending
      setPendingFiles(prev => [...prev, ...fileList]);
    }

    // Clear input
    e.target.value = '';
  };

  const handleImageDelete = (index: number, isPending: boolean) => {
    setDeletingImageId(isPending ? `pending-${index}` : internalImages[index].id);
  };

  const confirmImageDelete = async () => {
    if (!deletingImageId) return;

    if (deletingImageId.startsWith('pending-')) {
      const index = parseInt(deletingImageId.split('-')[1]);
      setPendingFiles(prev => prev.filter((_, i) => i !== index));
      setDeletingImageId(null);
      return;
    }

    setIsDeletingImage(true);
    try {
      await propertyService.deleteImage(deletingImageId);
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
    const { id, value, type } = e.target;
    // Check if value is numeric and convert
    const val = type === 'number' ? (value === '' ? 0 : parseFloat(value)) : value;
    setFormData(prev => ({ ...prev, [id]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    const submissionData = {
      ...formData,
      price: Number(formData.price) || 0,
      bedrooms: Number(formData.bedrooms) || 0,
      bathrooms: Number(formData.bathrooms) || 0,
      area: Number(formData.area) || 0,
      yearBuilt: formData.yearBuilt ? Number(formData.yearBuilt) : undefined,
    };

    try {
      // 1. Save property (create or update)
      const savedProperty = await onSave(submissionData);

      // 2. If it was a new property and we have pending files, upload them now
      if (savedProperty && pendingFiles.length > 0) {
        setIsUploading(true);
        for (const file of pendingFiles) {
          try {
            await propertyService.uploadImage(savedProperty.id, file);
          } catch (err) {
            console.error('Failed to upload a pending image', err);
          }
        }
      }

      // Parent handleSave already handles redirection if it finishes successfully
    } catch (err: any) {
      console.error('Failed to submit form', err);
      const errorMessage = err.response?.data?.message;
      setError(
        Array.isArray(errorMessage) 
          ? errorMessage.join('\n') 
          : errorMessage || 'Failed to save property. Please check your information.'
      );
    } finally {
      setIsSaving(false);
      setIsUploading(false);
      // Clear navigation state after successful save
      if (!error) clearNavigationState();
    }
  };

  const addFeature = () => {
    if (newFeature && !formData.features?.includes(newFeature)) {
      setFormData(prev => ({
        ...prev,
        features: [...(prev.features || []), newFeature]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features?.filter(f => f !== feature)
    }));
  };

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
            <X 
              size={18} 
              onClick={() => setError(null)} 
              style={{ cursor: 'pointer', opacity: 0.7 }} 
            />
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
          />
        </div>

        {/* Section: Seller */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}><User size={18} /> Property Owner (Seller)</h3>
          <ContactSelector 
            organizationId={organizationId}
            selectedContactId={formData.sellerProfileId}
            onSelect={(sellerProfileId) => setFormData(prev => ({ ...prev, sellerProfileId }))}
            restrictType={ContactType.SELLER}
            onNewContactRequested={handleNewSellerRedirect}
          />
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
            Link this property to an existing contact or create a new one as a seller.
          </p>
        </div>

        {/* Section: Images */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}><ImageIcon size={18} /> Property Images</h3>

          <div style={imageGridStyle}>
            {/* Existing Images */}
            {internalImages.map((img, idx) => (
              <div key={img.id} style={imageContainerStyle}>
                <img src={img.url} alt="Property" style={imageStyle} />
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleImageDelete(idx, false)}
                  style={deleteImageButtonStyle}
                  title="Delete image"
                  leftIcon={<Trash2 size={14} />}
                />
              </div>
            ))}

            {/* Pending Previews */}
            {pendingFiles.map((file, idx) => (
              <div key={`pending-${idx}`} style={{ ...imageContainerStyle, opacity: 0.7 }}>
                <img src={URL.createObjectURL(file)} alt="Pending" style={imageStyle} />
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleImageDelete(idx, true)}
                  style={deleteImageButtonStyle}
                  title="Remove image"
                  leftIcon={<Trash2 size={14} />}
                />
                <div style={pendingBadgeStyle}>Pending</div>
              </div>
            ))}

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
              label="Type"
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              options={[
                { value: 'HOUSE', label: 'House' },
                { value: 'APARTMENT', label: 'Apartment' },
                { value: 'CONDO', label: 'Condo' },
                { value: 'TOWNHOUSE', label: 'Townhouse' },
                { value: 'LAND', label: 'Land' },
                { value: 'COMMERCIAL', label: 'Commercial' }
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
                { value: 'UNDER_CONTRACT', label: 'Under Contract' },
                { value: 'SOLD', label: 'Sold' },
                { value: 'RENTED', label: 'Rented' },
                { value: 'OFF_MARKET', label: 'Off Market' }
              ]}
            />
            <Input
              label="Area (sqm)"
              id="area"
              name="area"
              type="number"
              placeholder="2500"
              value={formData.area}
              onChange={handleChange}
            />
            <Input
              label="Bedrooms"
              id="bedrooms"
              name="bedrooms"
              type="number"
              placeholder="3"
              value={formData.bedrooms}
              onChange={handleChange}
            />
            <Input
              label="Bathrooms"
              id="bathrooms"
              name="bathrooms"
              type="number"
              step="0.5"
              placeholder="2.5"
              value={formData.bathrooms}
              onChange={handleChange}
            />
            <Input
              label="Year Built"
              id="yearBuilt"
              name="yearBuilt"
              type="number"
              placeholder="2020"
              value={formData.yearBuilt}
              onChange={handleChange}
            />
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
          />
          <div className="grid grid-3" style={{ gap: '1rem' }}>
            <Input
              label="City"
              id="city"
              name="city"
              placeholder="Los Angeles"
              value={formData.city}
              onChange={handleChange}
            />
            <Input
              label="State"
              id="state"
              name="state"
              placeholder="CA"
              value={formData.state}
              onChange={handleChange}
            />
            <Input
              label="Zip Code"
              id="zipCode"
              name="zipCode"
              placeholder="90001"
              value={formData.zipCode}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Section: Features Tags */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}><Plus size={18} /> Features</h3>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <Input
              id="newFeature"
              name="newFeature"
              type="text"
              placeholder="e.g. Swimming Pool"
              value={newFeature}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewFeature(e.target.value)}
              onKeyPress={(e: React.KeyboardEvent) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
            />
            <Button 
              type="button" 
              onClick={addFeature} 
              variant="primary"
            >
              Add
            </Button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {formData.features?.map(feature => (
              <span key={feature} style={tagStyle}>
                {feature}
                <X size={14} onClick={() => removeFeature(feature)} style={{ cursor: 'pointer' }} />
              </span>
            ))}
          </div>
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
            {property ? 'Update' : 'Save'}
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

const tagStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.375rem 0.75rem',
  background: 'var(--color-surface)',
  border: '1px solid rgba(5, 150, 105, 0.2)',
  borderRadius: '2rem',
  fontSize: '0.8125rem',
  color: 'var(--color-primary)',
  fontWeight: 600
};

export default PropertyForm;

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
