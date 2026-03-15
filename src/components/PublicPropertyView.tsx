import { useState, useEffect } from 'react';
import { 
  Building2, 
  Bed, 
  Bath, 
  Maximize, 
  MapPin, 
  Calendar,
  Tag,
  Info,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Home
} from 'lucide-react';
import { type Property, propertyService } from '../api/properties';
import { useUnits } from '../contexts/UnitContext';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';

interface PublicPropertyViewProps {
  propertyId: string;
}

const PublicPropertyView: React.FC<PublicPropertyViewProps> = ({ propertyId }) => {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { formatAreaDisplay } = useUnits();

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await propertyService.getPublic(propertyId);
        setProperty(response.data);
      } catch (err) {
        console.error('Failed to fetch public property', err);
        setError('Property not found or is no longer available.');
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [propertyId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: '1rem' }}>
        <Loader2 size={40} className="animate-spin" color="var(--color-primary)" />
        <p style={{ color: 'var(--color-text-muted)' }}>Loading property details...</p>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: '1.5rem', padding: '2rem', textAlign: 'center' }}>
        <div style={{ width: '4rem', height: '4rem', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-error)' }}>
          <Home size={32} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Oops!</h2>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: '400px' }}>{error || 'Something went wrong.'}</p>
        </div>
        <Button onClick={() => window.location.href = '/'}>Back to Home</Button>
      </div>
    );
  }

  const nextImage = () => {
    if (!property.propertyImages?.length) return;
    setCurrentImageIndex((prev) => (prev + 1) % property.propertyImages.length);
  };

  const prevImage = () => {
    if (!property.propertyImages?.length) return;
    setCurrentImageIndex((prev) => (prev - 1 + property.propertyImages.length) % property.propertyImages.length);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem 5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={typeBadgeStyle}>{property.type}</span>
              <span style={statusBadgeStyle}>{property.status.replace('_', ' ')}</span>
            </div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.025em' }}>{property.title}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
              <MapPin size={18} />
              <span>{[property.city, property.governorate, property.country].filter(Boolean).join(', ')}</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Price</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary)' }}>
              {property.price ? `$${Number(property.price).toLocaleString()}` : 'Price on Request'}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Image Section */}
      <div style={heroSectionStyle}>
        {property.propertyImages?.length > 0 ? (
          <div style={carouselStyle}>
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImageIndex}
                src={property.propertyImages[currentImageIndex].url}
                alt={`${property.title} - ${currentImageIndex + 1}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={heroImageStyle}
              />
            </AnimatePresence>
            
            {property.propertyImages.length > 1 && (
              <>
                <button onClick={prevImage} style={{ ...navButtonStyle, left: '1rem' }} aria-label="Previous image">
                  <ChevronLeft size={24} />
                </button>
                <button onClick={nextImage} style={{ ...navButtonStyle, right: '1rem' }} aria-label="Next image">
                  <ChevronRight size={24} />
                </button>
                <div style={imageCounterStyle}>
                  {currentImageIndex + 1} / {property.propertyImages.length}
                </div>
              </>
            )}
          </div>
        ) : (
          <div style={noImageStyle}>
            <Building2 size={48} opacity={0.5} />
            <span>No images available</span>
          </div>
        )}
      </div>

      <div className="grid grid-2" style={{ gap: '2rem', marginTop: '2rem' }}>
        {/* Left Column: Details */}
        <div>
          {/* Quick Specs */}
          <div className="grid grid-2 grid-4" style={specsGridStyle}>
            <div style={specItemStyle}>
              <Bed size={20} />
              <div style={specLabelStyle}>Bedrooms</div>
              <div style={specValueStyle}>{property.bedrooms || 0}</div>
            </div>
            <div style={specItemStyle}>
              <Bath size={20} />
              <div style={specLabelStyle}>Bathrooms</div>
              <div style={specValueStyle}>{property.bathrooms || 0}</div>
            </div>
            <div style={specItemStyle}>
              <Maximize size={20} />
              <div style={specLabelStyle}>Size</div>
              <div style={specValueStyle}>{formatAreaDisplay(property.area || 0)}</div>
            </div>
            <div style={specItemStyle}>
              <Calendar size={20} />
              <div style={specLabelStyle}>Built</div>
              <div style={specValueStyle}>{property.yearBuilt || 'N/A'}</div>
            </div>
          </div>

          <div style={sectionStyle}>
            <h2 style={sectionTitleStyle}><Info size={20} /> Description</h2>
            <p style={{ lineHeight: 1.6, color: 'var(--color-text)', whiteSpace: 'pre-wrap' }}>
              {property.description || 'No description provided.'}
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={sectionTitleStyle}><Tag size={20} /> Features & Amenities</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {property.features?.length > 0 ? (
                property.features.map((feature, idx) => (
                  <div key={idx} style={featureTagStyle}>
                    {typeof feature === 'string' ? feature : (feature as any).name}
                  </div>
                ))
              ) : (
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>No specific features listed.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Contact CTA */}
        <div>
          <div className="card" style={{ position: 'sticky', top: '6rem', padding: '2rem', border: '2px solid var(--color-primary)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Interested in this property?</h3>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              Get in touch with the listing agent for more details or to schedule a viewing.
            </p>
            <Button fullWidth size="lg">Contact Agent</Button>
            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)', textAlign: 'center' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Reference ID: {property.id.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Styles
const heroSectionStyle: React.CSSProperties = {
  width: '100%',
  height: '500px',
  borderRadius: '1.5rem',
  overflow: 'hidden',
  backgroundColor: 'var(--color-bg)',
  border: '1px solid var(--color-border)',
  position: 'relative'
};

const carouselStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  position: 'relative'
};

const heroImageStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover'
};

const navButtonStyle: React.CSSProperties = {
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  color: 'var(--color-text)',
  border: 'none',
  borderRadius: '50%',
  width: '3rem',
  height: '3rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  zIndex: 10,
  transition: 'all 0.2s ease'
};

const imageCounterStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: '1.5rem',
  right: '1.5rem',
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  color: 'white',
  padding: '0.5rem 1rem',
  borderRadius: '2rem',
  fontSize: '0.875rem',
  fontWeight: 600,
  backdropFilter: 'blur(4px)'
};

const noImageStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '1rem',
  color: 'var(--color-text-muted)',
  backgroundColor: 'var(--color-bg)'
};

const specsGridStyle: React.CSSProperties = {
  padding: '1.25rem',
  background: 'var(--color-surface)',
  borderRadius: '1rem',
  marginBottom: '2rem',
  border: '1px solid var(--color-border)',
  gap: '1rem'
};

const specItemStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.25rem',
  padding: '0.5rem',
};

const specLabelStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  color: 'var(--color-text-muted)',
  fontWeight: 500
};

const specValueStyle: React.CSSProperties = {
  fontSize: '1rem',
  fontWeight: 700,
  color: 'var(--color-text)'
};

const sectionStyle: React.CSSProperties = {
  marginBottom: '2.5rem'
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: '1.25rem',
  fontWeight: 700,
  marginBottom: '1.25rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  color: 'var(--color-text)'
};

const featureTagStyle: React.CSSProperties = {
  padding: '0.5rem 1rem',
  backgroundColor: 'var(--color-bg)',
  borderRadius: '0.5rem',
  fontSize: '0.875rem',
  fontWeight: 500,
  color: 'var(--color-text)',
  border: '1px solid var(--color-border)'
};

const typeBadgeStyle: React.CSSProperties = {
  padding: '0.25rem 0.75rem',
  backgroundColor: 'rgba(5, 150, 105, 0.1)',
  color: 'var(--color-primary)',
  borderRadius: '2rem',
  fontSize: '0.75rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
};

const statusBadgeStyle: React.CSSProperties = {
  padding: '0.25rem 0.75rem',
  backgroundColor: 'var(--color-bg)',
  color: 'var(--color-text-muted)',
  borderRadius: '2rem',
  fontSize: '0.75rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  border: '1px solid var(--color-border)'
};

export default PublicPropertyView;
