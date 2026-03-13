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
            <div style={inputGroupStyle}>
              <label htmlFor="title" style={labelStyle}>Property Title*</label>
              <input
                id="title" name="title" type="text" required placeholder="Modern Villa"
                value={formData.title} onChange={handleChange} style={inputStyle}
              />
            </div>
            <div style={inputGroupStyle}>
              <label htmlFor="price" style={labelStyle}>Price ($)*</label>
              <div style={{ position: 'relative' }}>
                <DollarSign size={16} color="var(--color-text-muted)" style={inputIconStyle} />
                <input
                  id="price" name="price" type="number" required placeholder="450000"
                  value={formData.price} onChange={handleChange} style={{ ...inputStyle, paddingLeft: '2.25rem' }}
                />
              </div>
            </div>
          </div>
          <div style={inputGroupStyle}>
            <label htmlFor="description" style={labelStyle}>Description</label>
            <textarea
              id="description" name="description" rows={3} placeholder="Describe the property..."
              value={formData.description} onChange={handleChange} style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>
        </div>

        {/* Section: Details */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}><Building2 size={18} /> Property Details</h3>
          <div className="grid grid-2 grid-3" style={{ gap: '1rem' }}>
            <div style={inputGroupStyle}>
              <label htmlFor="type" style={labelStyle}>Type</label>
              <select id="type" name="type" value={formData.type} onChange={handleChange} style={inputStyle}>
                <option value="HOUSE">House</option>
                <option value="APARTMENT">Apartment</option>
                <option value="CONDO">Condo</option>
                <option value="TOWNHOUSE">Townhouse</option>
                <option value="LAND">Land</option>
                <option value="COMMERCIAL">Commercial</option>
              </select>
            </div>
            <div style={inputGroupStyle}>
              <label htmlFor="status" style={labelStyle}>Status</label>
              <select id="status" name="status" value={formData.status} onChange={handleChange} style={inputStyle}>
                <option value="AVAILABLE">Available</option>
                <option value="UNDER_CONTRACT">Under Contract</option>
                <option value="SOLD">Sold</option>
                <option value="RENTED">Rented</option>
                <option value="OFF_MARKET">Off Market</option>
              </select>
            </div>
            <div style={inputGroupStyle}>
              <label htmlFor="area" style={labelStyle}>Area (sqft)</label>
              <input
                id="area" name="area" type="number" placeholder="2500"
                value={formData.area} onChange={handleChange} style={inputStyle}
              />
            </div>
            <div style={inputGroupStyle}>
              <label htmlFor="bedrooms" style={labelStyle}>Bedrooms</label>
              <input
                id="bedrooms" name="bedrooms" type="number" placeholder="3"
                value={formData.bedrooms} onChange={handleChange} style={inputStyle}
              />
            </div>
            <div style={inputGroupStyle}>
              <label htmlFor="bathrooms" style={labelStyle}>Bathrooms</label>
              <input
                id="bathrooms" name="bathrooms" type="number" step="0.5" placeholder="2.5"
                value={formData.bathrooms} onChange={handleChange} style={inputStyle}
              />
            </div>
            <div style={inputGroupStyle}>
              <label htmlFor="yearBuilt" style={labelStyle}>Year Built</label>
              <input
                id="yearBuilt" name="yearBuilt" type="number" placeholder="2020"
                value={formData.yearBuilt} onChange={handleChange} style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Section: Location */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}><MapPin size={18} /> Location</h3>
          <div style={inputGroupStyle}>
            <label htmlFor="address" style={labelStyle}>Street Address*</label>
            <input
              id="address" name="address" type="text" required placeholder="123 Main St"
              value={formData.address} onChange={handleChange} style={inputStyle}
            />
          </div>
          <div className="grid grid-3" style={{ gap: '1rem' }}>
            <div style={inputGroupStyle}>
              <label htmlFor="city" style={labelStyle}>City</label>
              <input
                id="city" name="city" type="text" placeholder="Los Angeles"
                value={formData.city} onChange={handleChange} style={inputStyle}
              />
            </div>
            <div style={inputGroupStyle}>
              <label htmlFor="state" style={labelStyle}>State</label>
              <input
                id="state" name="state" type="text" placeholder="CA"
                value={formData.state} onChange={handleChange} style={inputStyle}
              />
            </div>
            <div style={inputGroupStyle}>
              <label htmlFor="zipCode" style={labelStyle}>Zip Code</label>
              <input
                id="zipCode" name="zipCode" type="text" placeholder="90001"
                value={formData.zipCode} onChange={handleChange} style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Section: Features Tags */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}><Plus size={18} /> Features</h3>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input
              id="newFeature"
              name="newFeature"
              type="text"
              placeholder="e.g. Swimming Pool"
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              style={inputStyle}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
            />
            <button type="button" onClick={addFeature} className="btn btn-primary" style={{ padding: '0 1rem' }}>
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

const inputGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.4rem'
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  fontWeight: 600,
  color: 'var(--color-text-muted)',
  textTransform: 'uppercase'
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.625rem 0.875rem',
  borderRadius: '0.5rem',
  border: '1px solid var(--color-border)',
  fontSize: '0.9375rem',
  outline: 'none',
  background: 'var(--color-surface)',
};

const inputIconStyle: React.CSSProperties = {
  position: 'absolute',
  left: '0.75rem',
  top: '50%',
  transform: 'translateY(-50%)'
};

const iconButtonStyle: React.CSSProperties = {
  background: 'var(--color-bg)',
  border: 'none',
  borderRadius: '0.5rem',
  padding: '0.5rem',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
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
