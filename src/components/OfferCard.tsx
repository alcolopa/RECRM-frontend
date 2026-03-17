import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  User, 
  Clock,
  ChevronRight
} from 'lucide-react';
import { type Offer, OfferStatus } from '../api/offers';
import { getImageUrl } from '../utils/url';
import { useNavigation } from '../contexts/NavigationContext';

interface OfferCardProps {
  offer: Offer;
  onRefresh: () => void;
}

const OfferCard: React.FC<OfferCardProps> = ({ offer }) => {
  const { navigate } = useNavigation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusStyle = (status: OfferStatus): React.CSSProperties => {
    switch (status) {
      case OfferStatus.ACCEPTED:
        return { backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)', color: 'var(--color-primary)' };
      case OfferStatus.REJECTED:
        return { backgroundColor: 'rgba(220, 38, 38, 0.1)', color: 'var(--color-error)' };
      case OfferStatus.COUNTERED:
        return { backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' };
      case OfferStatus.SUBMITTED:
      case OfferStatus.UNDER_REVIEW:
        return { backgroundColor: 'rgba(180, 83, 9, 0.1)', color: 'var(--color-warning)' };
      default:
        return { backgroundColor: 'var(--color-bg)', color: 'var(--color-text-muted)' };
    }
  };

  return (
    <div 
      className="card offer-card" 
      onClick={() => navigate('offer-details', { prefillData: { offerId: offer.id } })}
      style={{ 
        padding: isMobile ? '1rem' : '1.5rem', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: isMobile ? '1rem' : '1.25rem', 
        height: '100%',
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', gap: isMobile ? '0.75rem' : '1rem', alignItems: 'center', minWidth: 0, flex: 1 }}>
          {offer.negotiation?.property?.propertyImages?.[0]?.url ? (
            <div style={{ 
              width: isMobile ? '2.5rem' : '3rem', 
              height: isMobile ? '2.5rem' : '3rem', 
              borderRadius: '0.75rem', 
              overflow: 'hidden',
              flexShrink: 0
            }}>
              <img 
                src={getImageUrl(offer.negotiation.property.propertyImages[0].url)} 
                alt={offer.negotiation.property.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          ) : (
            <div style={{ 
              width: isMobile ? '2.5rem' : '3rem', 
              height: isMobile ? '2.5rem' : '3rem', 
              borderRadius: '0.75rem', 
              backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'var(--color-primary)',
              flexShrink: 0
            }}>
              <Building2 size={isMobile ? 20 : 24} />
            </div>
          )}
          <div style={{ minWidth: 0 }}>
            <h3 style={{ fontSize: isMobile ? '0.9375rem' : '1.125rem', fontWeight: 700, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {offer.negotiation?.property?.title || 'Unknown Property'}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: isMobile ? '0.8125rem' : '0.875rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
              <User size={14} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{offer.negotiation?.contact?.firstName} {offer.negotiation?.contact?.lastName}</span>
            </div>
          </div>
        </div>
        <div style={{ 
          padding: '0.25rem 0.625rem', 
          borderRadius: '2rem', 
          fontSize: '0.6875rem', 
          fontWeight: 700, 
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
          flexShrink: 0,
          ...getStatusStyle(offer.status)
        }}>
          {offer.status.replace('_', ' ')}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: isMobile ? '0.75rem' : '1rem', padding: isMobile ? '0.75rem' : '1rem', backgroundColor: 'var(--color-bg)', borderRadius: '0.75rem' }}>
        <div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', fontWeight: 500, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Current Price</div>
          <div style={{ fontSize: isMobile ? '1rem' : '1.25rem', fontWeight: 700, color: 'var(--color-primary)' }}>{formatPrice(offer.price)}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', fontWeight: 500, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Financing</div>
          <div style={{ fontSize: isMobile ? '0.8125rem' : '0.9375rem', fontWeight: 600 }}>{offer.financingType.replace('_', ' ')}</div>
        </div>
      </div>

      <div style={{ 
        marginTop: 'auto', 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '1rem', 
        borderTop: '1px solid var(--color-border)', 
        gap: '1rem' 
      }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
           <Clock size={14} />
           Updated {formatDate(offer.updatedAt)}
        </div>
        <div style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', fontWeight: 600 }}>
          Details <ChevronRight size={16} />
        </div>
      </div>
    </div>
  );
};

export default OfferCard;