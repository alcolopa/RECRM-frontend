import React, { useState } from 'react';
import { 
  Building2, 
  User, 
  Calendar, 
  Check, 
  ExternalLink,
  History,
  Clock
} from 'lucide-react';
import { type Offer, OfferStatus, offersService } from '../api/offers';
import Button from './Button';
import ConfirmModal from './ConfirmModal';
import CounterOfferModal from './CounterOfferModal';
import Modal from './Modal';
import NegotiationTimeline from './NegotiationTimeline';

interface OfferCardProps {
  offer: Offer;
  onRefresh: () => void;
}

const OfferCard: React.FC<OfferCardProps> = ({ offer, onRefresh }) => {
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isCounterModalOpen, setIsCounterModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      await offersService.accept(offer.id, offer.organizationId);
      onRefresh();
      setIsAcceptModalOpen(false);
    } catch (err) {
      console.error('Failed to accept offer', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    setIsProcessing(true);
    try {
      await offersService.reject(offer.id, offer.organizationId);
      onRefresh();
      setIsRejectModalOpen(false);
    } catch (err) {
      console.error('Failed to reject offer', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusStyle = (status: OfferStatus): React.CSSProperties => {
    switch (status) {
      case OfferStatus.ACCEPTED:
        return { backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' };
      case OfferStatus.REJECTED:
        return { backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' };
      case OfferStatus.COUNTERED:
        return { backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' };
      case OfferStatus.SUBMITTED:
      case OfferStatus.UNDER_REVIEW:
        return { backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' };
      default:
        return { backgroundColor: 'var(--color-bg)', color: 'var(--color-text-muted)' };
    }
  };

  const canAction = [OfferStatus.SUBMITTED, OfferStatus.UNDER_REVIEW].includes(offer.status);

  return (
    <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ 
            width: '3rem', 
            height: '3rem', 
            borderRadius: '0.75rem', 
            backgroundColor: 'var(--color-bg)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'var(--color-primary)'
          }}>
            <Building2 size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0 }}>
              {offer.negotiation?.property?.title || 'Unknown Property'}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
              <User size={14} />
              <span>{offer.negotiation?.contact?.firstName} {offer.negotiation?.contact?.lastName}</span>
            </div>
          </div>
        </div>
        <div style={{ 
          padding: '0.375rem 0.75rem', 
          borderRadius: '2rem', 
          fontSize: '0.75rem', 
          fontWeight: 700, 
          textTransform: 'uppercase',
          ...getStatusStyle(offer.status)
        }}>
          {offer.status.replace('_', ' ')}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1rem', backgroundColor: 'var(--color-bg)', borderRadius: '0.75rem' }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 500, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Offer Price</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)' }}>{formatPrice(offer.price)}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 500, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Financing</div>
          <div style={{ fontSize: '0.9375rem', fontWeight: 600 }}>{offer.financingType.replace('_', ' ')}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 500, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Closing Date</div>
          <div style={{ fontSize: '0.9375rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <Calendar size={14} />
            {formatDate(offer.closingDate)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 500, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Expires</div>
          <div style={{ fontSize: '0.9375rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <Clock size={14} />
            {formatDate(offer.expirationDate)}
          </div>
        </div>
      </div>

      {offer.notes && (
        <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontStyle: 'italic', padding: '0 0.5rem' }}>
          "{offer.notes}"
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
          Created by <strong>{offer.createdBy?.firstName} {offer.createdBy?.lastName}</strong> on {formatDate(offer.createdAt)}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {canAction ? (
            <>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsCounterModalOpen(true)}
                style={{ color: '#3b82f6' }}
              >
                Counter
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsRejectModalOpen(true)}
                style={{ color: '#ef4444' }}
              >
                Reject
              </Button>
              <Button 
                variant="primary" 
                size="sm" 
                onClick={() => setIsAcceptModalOpen(true)}
                leftIcon={<Check size={16} />}
              >
                Accept
              </Button>
            </>
          ) : (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsDetailsModalOpen(true)}
              leftIcon={<ExternalLink size={16} />}
            >
              Details
            </Button>
          )}
          {(!canAction || offer.status === OfferStatus.COUNTERED) && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsDetailsModalOpen(true)}
              aria-label="View negotiation history"
              title="Negotiation History"
            >
              <History size={16} />
            </Button>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={isAcceptModalOpen}
        onClose={() => setIsAcceptModalOpen(false)}
        onConfirm={handleAccept}
        title="Accept Offer"
        message={`Are you sure you want to accept this offer of ${formatPrice(offer.price)}? This will automatically create a new Deal and mark the negotiation as closed.`}
        confirmLabel="Accept Offer"
        variant="primary"
        isLoading={isProcessing}
      />

      <ConfirmModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={handleReject}
        title="Reject Offer"
        message="Are you sure you want to reject this offer? This action cannot be undone."
        confirmLabel="Reject Offer"
        variant="danger"
        isLoading={isProcessing}
      />

      <CounterOfferModal
        isOpen={isCounterModalOpen}
        onClose={() => setIsCounterModalOpen(false)}
        originalOffer={offer}
        onSuccess={() => {
          setIsCounterModalOpen(false);
          onRefresh();
        }}
      />

      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title="Negotiation Details"
        maxWidth="700px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', padding: '1.25rem', backgroundColor: 'var(--color-bg)', borderRadius: '1rem' }}>
            <div style={{ width: '4rem', height: '4rem', borderRadius: '1rem', overflow: 'hidden', flexShrink: 0 }}>
              <img 
                src={offer.negotiation?.property?.propertyImages?.[0]?.url || 'https://via.placeholder.com/150'} 
                alt={offer.negotiation?.property?.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700 }}>{offer.negotiation?.property?.title}</h4>
              <p style={{ margin: '0.25rem 0 0', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>{offer.negotiation?.property?.address}</p>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                  <User size={14} />
                  Buyer: {offer.negotiation?.contact?.firstName} {offer.negotiation?.contact?.lastName}
                </div>
              </div>
            </div>
          </div>

          <section>
            <h5 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <History size={16} /> Negotiation Timeline
            </h5>
            <NegotiationTimeline offers={offer.negotiation?.offers || []} />
          </section>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <Button variant="outline" onClick={() => setIsDetailsModalOpen(false)}>Close</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OfferCard;
