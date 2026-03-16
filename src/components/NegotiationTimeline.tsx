import React from 'react';
import { 
  Check, 
  X, 
  RotateCcw, 
  Send, 
  Eye, 
  HandCoins
} from 'lucide-react';
import { type Offer, OfferStatus } from '../api/offers';

interface NegotiationTimelineProps {
  offers: Offer[];
}

const NegotiationTimeline: React.FC<NegotiationTimelineProps> = ({ offers }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: OfferStatus) => {
    switch (status) {
      case OfferStatus.ACCEPTED:
        return <Check size={16} color="#10b981" />;
      case OfferStatus.REJECTED:
        return <X size={16} color="#ef4444" />;
      case OfferStatus.COUNTERED:
        return <RotateCcw size={16} color="#3b82f6" />;
      case OfferStatus.SUBMITTED:
        return <Send size={16} color="#f59e0b" />;
      case OfferStatus.UNDER_REVIEW:
        return <Eye size={16} color="#f59e0b" />;
      default:
        return <HandCoins size={16} color="var(--color-text-muted)" />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', paddingLeft: '2rem' }}>
      {/* Vertical Line */}
      <div style={{ 
        position: 'absolute', 
        left: '0.75rem', 
        top: '0.5rem', 
        bottom: '0.5rem', 
        width: '2px', 
        backgroundColor: 'var(--color-border)',
        zIndex: 0
      }} />

      {offers.map((offer) => (
        <div key={offer.id} style={{ position: 'relative', zIndex: 1 }}>
          {/* Timeline Dot */}
          <div style={{ 
            position: 'absolute', 
            left: '-1.25rem', 
            top: '0.25rem', 
            width: '1.5rem', 
            height: '1.5rem', 
            borderRadius: '50%', 
            backgroundColor: 'var(--color-surface)', 
            border: '2px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            {getStatusIcon(offer.status)}
          </div>

          <div className="card" style={{ padding: '1rem', background: offer.status === OfferStatus.ACCEPTED ? 'rgba(16, 185, 129, 0.05)' : 'var(--color-surface)', border: offer.status === OfferStatus.ACCEPTED ? '1px solid #10b981' : '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>{formatPrice(offer.price)}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                  {offer.status.replace('_', ' ')} • {formatDate(offer.createdAt)}
                </div>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'right' }}>
                by <strong>{offer.createdBy?.firstName} {offer.createdBy?.lastName}</strong>
              </div>
            </div>
            
            {(offer.notes || offer.financingType) && (
              <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px dashed var(--color-border)', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', gap: '1rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
                  <span>Financing: <strong>{offer.financingType.replace('_', ' ')}</strong></span>
                  {offer.deposit && <span>Deposit: <strong>{formatPrice(offer.deposit)}</strong></span>}
                </div>
                {offer.notes && <div style={{ color: 'var(--color-text)', fontStyle: 'italic' }}>"{offer.notes}"</div>}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default NegotiationTimeline;
