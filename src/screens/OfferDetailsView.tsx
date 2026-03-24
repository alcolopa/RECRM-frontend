import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  Building2, 
  Calendar, 
  Clock,
  Check,
  Loader2,
  DollarSign,
  Plus
} from 'lucide-react';
import { motion } from 'framer-motion';
import { offersService, type Offer } from '../api/offers';
import Button from '../components/Button';
import { useNavigation } from '../contexts/NavigationContext';
import ConfirmModal from '../components/ConfirmModal';
import CounterOfferForm from '../components/CounterOfferForm';
import NegotiationTimeline from '../components/NegotiationTimeline';

interface OfferDetailsViewProps {
  organizationId: string;
}

const OfferDetailsView: React.FC<OfferDetailsViewProps> = ({ organizationId }) => {
  const { navigationState, navigate } = useNavigation();
  const offerId = navigationState.prefillData?.offerId;
  
  const [offer, setOffer] = useState<Offer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'details' | 'counter'>('details');
  
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchOfferDetails = async () => {
    if (!offerId) return;
    setIsLoading(true);
    try {
      const response = await offersService.getOne(offerId, organizationId);
      setOffer(response.data);
    } catch (err) {
      console.error('Failed to fetch offer details', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOfferDetails();
  }, [offerId, organizationId]);

  const handleAccept = async () => {
    if (!offer) return;
    setIsActionLoading(true);
    try {
      await offersService.accept(offer.id, organizationId);
      setIsAcceptModalOpen(false);
      fetchOfferDetails();
    } catch (err) {
      console.error('Failed to accept offer', err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!offer) return;
    setIsActionLoading(true);
    try {
      await offersService.reject(offer.id, organizationId);
      setIsRejectModalOpen(false);
      fetchOfferDetails();
    } catch (err) {
      console.error('Failed to reject offer', err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCounterSave = async (data: any) => {
    if (!offer) return;
    try {
      await offersService.counter(offer.id, data, organizationId);
      setView('details');
      fetchOfferDetails();
    } catch (err) {
      throw err;
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Loader2 size={40} className="animate-spin" color="var(--color-primary)" />
      </div>
    );
  }

  if (!offer) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Offer not found</h2>
        <Button onClick={() => navigate('offers')}>Back to Offers</Button>
      </div>
    );
  }

  if (view === 'counter') {
    return (
      <CounterOfferForm 
        originalOffer={offer}
        onSave={handleCounterSave}
        onCancel={() => setView('details')}
      />
    );
  }

  const isAgencyOffer = offer.offerer === 'AGENCY';
  const canTakeAction = offer.status === 'SUBMITTED' || offer.status === 'COUNTERED' || offer.status === 'UNDER_REVIEW';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
    >
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={() => navigate('offers')}
            style={{ 
              padding: '0.5rem', borderRadius: '50%', background: 'var(--color-surface)', 
              border: '1px solid var(--color-border)', cursor: 'pointer', color: 'var(--color-text)' 
            }}
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <h1 style={{ fontSize: '1.875rem', fontWeight: 800 }}>Offer Detail</h1>
              <span style={{ 
                padding: '0.25rem 0.75rem', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: 700,
                backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)', color: 'var(--color-primary)', textTransform: 'uppercase'
              }}>
                {offer.status.replace('_', ' ')}
              </span>
            </div>
            <p style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building2 size={16} /> {offer.negotiation.property.title}
            </p>
          </div>
        </div>

        {canTakeAction && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button variant="outline" onClick={() => setIsRejectModalOpen(true)}>Reject</Button>
            <Button variant="outline" onClick={() => setView('counter')} leftIcon={<Plus size={18} />}>Counter</Button>
            <Button variant="primary" onClick={() => setIsAcceptModalOpen(true)} leftIcon={<Check size={18} />}>Accept Offer</Button>
          </div>
        )}
      </header>

      <div className="grid grid-3" style={{ gap: '2rem', alignItems: 'start' }}>
        <div className="grid-col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
              <div>
                <p style={labelStyle}>Offer Price</p>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                  ${Number(offer.price).toLocaleString()}
                </h2>
              </div>
              <div>
                <p style={labelStyle}>Deposit</p>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                  ${Number(offer.deposit || 0).toLocaleString()}
                </h3>
              </div>
              <div>
                <p style={labelStyle}>Financing</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                  <DollarSign size={18} color="var(--color-text-muted)" />
                  {offer.financingType.replace('_', ' ')}
                </div>
              </div>
            </div>

            <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '2rem 0' }} />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
              <div>
                <p style={labelStyle}>Proposed Closing</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
                  <Calendar size={18} color="var(--color-text-muted)" />
                  {offer.closingDate ? new Date(offer.closingDate).toLocaleDateString() : 'Not set'}
                </div>
              </div>
              <div>
                <p style={labelStyle}>Offer Expiration</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
                  <Clock size={18} color="var(--color-text-muted)" />
                  {offer.expirationDate ? new Date(offer.expirationDate).toLocaleDateString() : 'Not set'}
                </div>
              </div>
              <div>
                <p style={labelStyle}>Submitted By</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
                  <Clock size={18} color="var(--color-text-muted)" />
                  {isAgencyOffer ? 'Agency (Seller Side)' : 'Buyer'}
                </div>
              </div>
            </div>

            {offer.notes && (
              <>
                <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '2rem 0' }} />
                <p style={labelStyle}>Terms & Notes</p>
                <p style={{ lineHeight: 1.6, color: 'var(--color-text-muted)' }}>{offer.notes}</p>
              </>
            )}
          </div>

          <NegotiationTimeline negotiation={offer.negotiation} currentOfferId={offer.id} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Participants</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <ParticipantItem 
                label="Buyer" 
                name={`${offer.negotiation.contact.firstName} ${offer.negotiation.contact.lastName}`}
                sub={offer.negotiation.contact.email || ''}
              />
              <ParticipantItem 
                label="Property Owner" 
                name={offer.negotiation.property.sellerProfile?.contact?.firstName ? `${offer.negotiation.property.sellerProfile.contact.firstName} ${offer.negotiation.property.sellerProfile.contact.lastName}` : 'Direct Listing'}
                sub={offer.negotiation.property.address}
              />
              <ParticipantItem 
                label="Created By" 
                name={`${offer.createdBy.firstName} ${offer.createdBy.lastName}`}
                sub={offer.createdBy.email}
              />
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal 
        isOpen={isAcceptModalOpen} 
        onClose={() => setIsAcceptModalOpen(false)} 
        onConfirm={handleAccept}
        title="Accept Offer"
        message="Are you sure you want to accept this offer? This will mark the negotiation as accepted and create a new Deal."
        isLoading={isActionLoading}
      />

      <ConfirmModal 
        isOpen={isRejectModalOpen} 
        onClose={() => setIsRejectModalOpen(false)} 
        onConfirm={handleReject}
        title="Reject Offer"
        message="Are you sure you want to reject this offer? This action cannot be undone."
        variant="danger"
        isLoading={isActionLoading}
      />
    </motion.div>
  );
};

const ParticipantItem: React.FC<{ label: string, name: string, sub: string }> = ({ label, name, sub }) => (
  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
    <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', backgroundColor: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--color-primary)' }}>
      {name[0]}
    </div>
    <div style={{ minWidth: 0 }}>
      <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{label}</p>
      <p style={{ fontSize: '0.875rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</p>
      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub}</p>
    </div>
  </div>
);

const labelStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  fontWeight: 700,
  color: 'var(--color-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '0.5rem'
};

export default OfferDetailsView;
