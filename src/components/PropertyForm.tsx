import { useState, useEffect } from 'react';
import {
  X,
  Save,
  Plus,
  Building2,
  MapPin,
  DollarSign,
  Info,
  ChevronLeft
} from 'lucide-react';
import { motion } from 'framer-motion';
import { type Property } from '../api/properties';
import { Input, Select, Textarea } from './Input';

interface PropertyFormProps {
  property?: Property;
  onSave: (data: Partial<Property>) => void;
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
    images: [],
    organizationId
  });

  const [newFeature, setNewFeature] = useState('');

  useEffect(() => {
    if (property) {
      setFormData(property);
    }
  }, [property]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value, type } = e.target;
    const val = type === 'number' ? parseFloat(value) : value;
    setFormData(prev => ({ ...prev, [id]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
      style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button onClick={onCancel} style={iconButtonStyle}>
          <ChevronLeft size={20} />
        </button>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
          {property ? 'Edit Property' : 'Add New Property'}
        </h2>
      </div>

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
              label="Area (sqft)"
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
              onChange={(e) => setNewFeature(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
            />
            <button type="button" onClick={addFeature} className="btn btn-primary" style={{ padding: '0 1rem', marginTop: '1.4rem' }}>
              Add
            </button>
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
          <button type="button" onClick={onCancel} className="btn btn-outline" style={{ flex: isMobile ? 1 : 'initial' }}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" style={{ flex: isMobile ? 1 : 'initial', gap: '0.5rem' }}>
            <Save size={18} /> {property ? 'Update' : 'Save'}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

const isMobile = window.innerWidth <= 768;

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

const iconButtonStyle: React.CSSProperties = {
  background: 'var(--color-bg)',
  border: 'none',
  borderRadius: '0.5rem',
  padding: '0.5rem',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--color-text)'
};

export default PropertyForm;
