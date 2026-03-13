import { 
  Building2, 
  Bed, 
  Bath, 
  Maximize, 
  MapPin,
  Edit2,
  Trash2
} from 'lucide-react';
import { type Property } from '../api/properties';

interface PropertyCardProps {
  property: Property;
  onEdit: (property: Property) => void;
  onDelete: (id: string) => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onEdit, onDelete }) => {
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
      case 'AVAILABLE': return '#10b981';
      case 'UNDER_CONTRACT': return '#f59e0b';
      case 'SOLD': return '#ef4444';
      case 'RENTED': return '#3b82f6';
      default: return 'var(--secondary)';
    }
  };

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Image Placeholder or Actual Image */}
      <div style={{ 
        position: 'relative', 
        height: '200px', 
        backgroundColor: 'var(--muted)',
        backgroundImage: property.images?.[0] ? `url(${property.images[0]})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {!property.images?.[0] && <Building2 size={48} color="var(--border)" />}
        
        {/* Status Badge */}
        <div style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          padding: '0.25rem 0.75rem',
          borderRadius: '1rem',
          backgroundColor: 'white',
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
            <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.125rem' }}>
              {formatPrice(property.price)}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--secondary)', fontSize: '0.875rem' }}>
            <MapPin size={14} />
            <span>{property.city}, {property.state}</span>
          </div>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '0.5rem', 
          padding: '0.75rem 0',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
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
            <span>{property.area || 0} sqft</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
          <button 
            onClick={() => onEdit(property)}
            style={actionButtonStyle}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--muted)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
          >
            <Edit2 size={16} color="var(--secondary)" />
          </button>
          <button 
            onClick={() => onDelete(property.id)}
            style={actionButtonStyle}
            onMouseEnter={(e) => e.currentTarget.style.background = '#fee2e2'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
          >
            <Trash2 size={16} color="#ef4444" />
          </button>
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
  color: 'var(--secondary)',
  fontWeight: 500
};

const actionButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  padding: '0.5rem',
  borderRadius: '0.5rem',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s'
};

export default PropertyCard;
