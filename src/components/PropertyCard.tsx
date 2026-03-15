import {
  Building2,
  Bed,
  Bath,
  Maximize,
  MapPin,
  Edit2,
  Trash2,
  User
} from 'lucide-react';
import { type Property } from '../api/properties';
import Button from './Button';
import { useUnits } from '../contexts/UnitContext';

interface PropertyCardProps {
  property: Property;
  onEdit: (property: Property) => void;
  onDelete: (id: string) => void;
  onClick: () => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onEdit, onDelete, onClick }) => {
  const { formatAreaDisplay } = useUnits();
  const formatPrice = (price?: number) => {
    if (!price) return 'Contact for price';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'var(--color-success)';
      case 'UNDER_CONTRACT': return 'var(--color-warning)';
      case 'SOLD': return 'var(--color-error)';
      case 'RENTED': return 'var(--color-primary)';
      default: return 'var(--color-text-muted)';
    }
  };

  return (
    <div
      className="card"
      onClick={onClick}
      style={{
        padding: 0,
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      }}
    >
      {/* Image Placeholder or Actual Image */}
      <div style={{
        position: 'relative',
        height: '200px',
        backgroundColor: 'var(--color-bg)',
        backgroundImage: property.propertyImages?.[0]?.url ? `url(${property.propertyImages[0].url})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {!property.propertyImages?.[0]?.url && <Building2 size={48} color="var(--color-border)" />}

        {/* Status Badge */}
        <div style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          padding: '0.25rem 0.75rem',
          borderRadius: '1rem',
          backgroundColor: 'var(--color-surface)',
          color: getStatusColor(property.status),
          fontSize: '0.75rem',
          fontWeight: 700,
          boxShadow: 'var(--shadow-sm)'
        }}>
          {property.status.replace('_', ' ')}
        </div>
      </div>

      <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0 }}>{property.title}</h3>
            <span style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: '1.125rem' }}>
              {formatPrice(property.price)}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            <MapPin size={14} />
            <span>{[property.city, property.governorate].filter(Boolean).join(', ') || 'No location'}</span>
          </div>
          {property.sellerProfile?.contact && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              color: 'var(--color-primary)', 
              fontSize: '0.8125rem',
              marginTop: '0.4rem',
              fontWeight: 600,
              background: 'rgba(var(--color-primary-rgb), 0.05)',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.25rem',
              width: 'fit-content'
            }}>
              <User size={14} />
              <span style={{ 
                whiteSpace: 'nowrap', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis',
                maxWidth: '150px'
              }}>
                {property.sellerProfile.contact.firstName} {property.sellerProfile.contact.lastName}
              </span>
            </div>
          )}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.5rem',
          padding: '0.75rem 0',
          borderTop: '1px solid var(--color-border)',
          borderBottom: '1px solid var(--color-border)',
          marginTop: 'auto'
        }}>
          <div style={featureStyle}>
            <Bed size={16} />
            <span>{property.bedrooms || 0} Bed</span>
          </div>
          <div style={featureStyle}>
            <Bath size={16} />
            <span>{property.bathrooms || 0} Bath</span>
          </div>
          <div style={featureStyle}>
            <Maximize size={16} />
            <span>{formatAreaDisplay(property.area || 0)}</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }} onClick={(e) => e.stopPropagation()}>
          <Button 
            variant="ghost"
            size="sm"
            onClick={() => onEdit(property)}
            aria-label={`Edit ${property.title}`}
            leftIcon={<Edit2 size={16} color="var(--color-text-muted)" />}
          />
          <Button 
            variant="ghost"
            size="sm"
            onClick={() => onDelete(property.id)}
            aria-label={`Delete ${property.title}`}
            leftIcon={<Trash2 size={16} color="var(--color-error)" />}
          />
        </div>
      </div>
    </div>
  );
};

const featureStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.25rem',
  fontSize: '0.75rem',
  color: 'var(--color-text-muted)',
  fontWeight: 500
};

export default PropertyCard;
