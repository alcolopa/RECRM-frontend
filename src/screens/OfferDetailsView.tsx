import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  Building2,
  Calendar,
  Clock,
  Check,
  Loader2,
  DollarSign,
  HandCoins,
  Plus,
  User,
  FileText,
  AlertCircle,
  Trophy,
  XCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { offersService, type Offer } from '../api/offers';
import { organizationService, type CommissionConfig } from '../api/organization';
import { userService } from '../api/users';
import { dealService, type DealStage } from '../api/deals';
import Button from '../components/Button';
import { useNavigation } from '../contexts/NavigationContext';
import ConfirmModal from '../components/ConfirmModal';
import CounterOfferForm from '../components/CounterOfferForm';
import NegotiationTimeline from '../components/NegotiationTimeline';
import { getImageUrl } from '../utils/url';
import { formatCurrency, safeAdd, safeMultiply } from '../utils/currency';

interface OfferDetailsViewProps {
  organizationId: string;
}

const OfferDetailsView: React.FC<OfferDetailsViewProps> = ({ organizationId }) => {
  const { navigationState, navigate } = useNavigation();
  const offerId = navigationState.prefillData?.offerId;

  const [offer, setOffer] = useState<Offer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'details' | 'counter'>('details');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const [orgConfig, setOrgConfig] = useState<CommissionConfig | null>(null);
  const [agentConfig, setAgentConfig] = useState<any>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const fetchConfigs = async () => {
    try {
      const [orgRes, agentRes] = await Promise.all([
        organizationService.getCommissionConfig(organizationId),
        userService.getMe()
      ]);
      setOrgConfig(orgRes.data);
      // For agent config, we might need a specific getCommissionConfig if it's not in getMe
      const agentCommRes = await userService.getCommissionConfig(agentRes.data.id);
      setAgentConfig(agentCommRes.data);
    } catch (err) {
      console.error('Failed to fetch configs', err);
    }
  };

  useEffect(() => {
    fetchOfferDetails();
    fetchConfigs();
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
      const res = await offersService.counter(offer.id, data, organizationId);
      setView('details');
      navigate('offer-details', { prefillData: { offerId: res.data.id } });
    } catch (err) {
      throw err;
    }
  };

  const handleCloseDeal = async (stage: DealStage) => {
    if (!offer?.associatedDeal) return;
    setIsActionLoading(true);
    try {
      await dealService.update(offer.associatedDeal.id, { stage }, organizationId);
      await fetchOfferDetails(); 
    } catch (err) {
      console.error('Failed to close deal', err);
    } finally {
      setIsActionLoading(false);
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

  const calculateCommission = () => {
    const price = Number(offer.price) || 0;
    const type = (offer as any).type || 'SALE';

    if (type === 'RENT') {
      const buyerMonths = orgConfig?.rentBuyerValue ?? 0;
      const sellerMonths = orgConfig?.rentSellerValue ?? 0;
      const agentShare = agentConfig?.rentAgentValue ?? orgConfig?.rentAgentValue ?? 0;

      const buyerComm = safeMultiply(price, buyerMonths);
      const sellerComm = safeMultiply(price, sellerMonths);
      const agentComm = safeMultiply(price, agentShare);

      return { 
        buyer: buyerComm, 
        seller: sellerComm, 
        total: safeAdd(buyerComm, sellerComm), 
        agent: agentComm 
      };
    } else {
      const buyerPercent = orgConfig?.saleBuyerValue ?? 0;
      const sellerPercent = orgConfig?.saleSellerValue ?? 0;
      const agentPercent = agentConfig?.saleAgentValue ?? orgConfig?.saleAgentValue ?? 0;

      const buyerComm = safeMultiply(price, buyerPercent / 100);
      const sellerComm = safeMultiply(price, sellerPercent / 100);
      const agentComm = safeMultiply(price, agentPercent / 100);

      return { 
        buyer: buyerComm, 
        seller: sellerComm, 
        total: safeAdd(buyerComm, sellerComm), 
        agent: agentComm 
      };
    }
  };

  const commission = calculateCommission();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: isMobile ? '1.5rem' : '2.5rem',
        maxWidth: '1200px',
        margin: '0 auto',
        paddingBottom: isMobile ? '2rem' : 0
      }}
    >
      {/* Dynamic Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'center',
        flexDirection: isMobile ? 'column' : 'row',
        gap: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => navigate('offers')}
            style={{
              padding: '0.625rem', borderRadius: '50%', background: 'var(--color-surface)',
              border: '1px solid var(--color-border)', cursor: 'pointer', color: 'var(--color-text)',
              boxShadow: 'var(--shadow-sm)', transition: 'all 0.2s', flexShrink: 0
            }}
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
              <h1 style={{ fontSize: isMobile ? '1.5rem' : '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Offer Details</h1>
              <span style={{
                padding: '0.2rem 0.625rem', borderRadius: '2rem', fontSize: '0.65rem', fontWeight: 700,
                backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)', color: 'var(--color-primary)', textTransform: 'uppercase',
                letterSpacing: '0.05em', border: '1px solid rgba(var(--color-primary-rgb), 0.2)'
              }}>
                {offer.status.replace('_', ' ')}
              </span>
            </div>
            <div style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
              <Building2 size={14} />
              <span style={{ fontWeight: 500 }}>{offer.negotiation.property.title}</span>
            </div>
          </div>
        </div>

        {canTakeAction && (
          <div style={{ display: 'flex', gap: '0.75rem', width: isMobile ? '100%' : 'auto' }}>
            <Button
              variant="danger"
              onClick={() => setIsRejectModalOpen(true)}
              fullWidth={isMobile}
            >
              Reject
            </Button>
            <Button
              variant="outline"
              onClick={() => setView('counter')}
              leftIcon={<Plus size={18} />}
              fullWidth={isMobile}
            >
              Counter
            </Button>
            <Button
              variant="primary"
              onClick={() => setIsAcceptModalOpen(true)}
              leftIcon={<Check size={18} />}
              fullWidth={isMobile}
            >
              {isMobile ? 'Accept' : 'Accept Offer'}
            </Button>
          </div>
        )}

        {offer.status === 'ACCEPTED' && offer.associatedDeal && (
          offer.associatedDeal.stage === 'NEGOTIATION' ? (
            <div style={{ display: 'flex', gap: '0.75rem', width: isMobile ? '100%' : 'auto' }}>
              <Button
                type="button"
                variant="danger"
                onClick={() => handleCloseDeal('CLOSED_LOST')}
                leftIcon={<XCircle size={18} />}
                fullWidth={isMobile}
                isLoading={isActionLoading}
              >
                Mark as Lost
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={() => handleCloseDeal('CLOSED_WON')}
                leftIcon={<Trophy size={18} />}
                fullWidth={isMobile}
                style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
                isLoading={isActionLoading}
              >
                Mark as Won
              </Button>
            </div>
          ) : (
            <div style={{ 
              padding: '0.5rem 1rem', 
              borderRadius: '2rem', 
              fontSize: '0.875rem', 
              fontWeight: 700,
              backgroundColor: offer.associatedDeal.stage === 'CLOSED_WON' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
              color: offer.associatedDeal.stage === 'CLOSED_WON' ? '#10b981' : '#ef4444',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              border: `1px solid ${offer.associatedDeal.stage === 'CLOSED_WON' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
            }}>
              {offer.associatedDeal.stage === 'CLOSED_WON' ? <Trophy size={18} /> : <XCircle size={18} />}
              Deal {offer.associatedDeal.stage.replace('CLOSED_', '')}
            </div>
          )
        )}
      </header>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(12, 1fr)',
        gap: '2rem',
        alignItems: 'start'
      }}>
        {/* Main Information Panel */}
        <div style={{ gridColumn: isMobile ? 'auto' : 'span 8', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* Key Metrics Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: isMobile ? '1rem' : '1.5rem'
          }}>
            <MetricCard
              label={offer.type === 'SALE' ? 'Offer Price' : 'Monthly Rent'}
              value={formatCurrency(offer.price)}
              icon={DollarSign}
              highlight
            />
            <MetricCard
              label="Security Deposit"
              value={formatCurrency(offer.deposit || 0)}
              icon={HandCoins}
            />
            <MetricCard
              label="Financing"
              value={offer.financingType.replace('_', ' ')}
              icon={FileText}
            />
          </div>

          {/* Detailed Terms Section */}
          <div className="card" style={{ padding: isMobile ? '1.25rem' : '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
              <FileText size={20} color="var(--color-primary)" />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Terms & Contingencies</h3>
            </div>

            {offer.notes ? (
              <p style={{ lineHeight: 1.7, color: 'var(--color-text)', fontSize: isMobile ? '0.9375rem' : '1rem', whiteSpace: 'pre-wrap' }}>
                {offer.notes}
              </p>
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--color-bg)', borderRadius: 'var(--radius)', border: '1px dashed var(--color-border)' }}>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>No additional notes or terms provided.</p>
              </div>
            )}

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: '1.5rem',
              marginTop: '0.5rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid var(--color-border)'
            }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ padding: '0.625rem', borderRadius: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', flexShrink: 0 }}>
                  <Calendar size={20} />
                </div>
                <div>
                  <p style={labelStyle}>Proposed Closing</p>
                  <p style={{ fontWeight: 600, fontSize: '0.9375rem' }}>
                    {offer.closingDate ? new Date(offer.closingDate).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'Flexible'}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ padding: '0.625rem', borderRadius: '0.75rem', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', flexShrink: 0 }}>
                  <Clock size={20} />
                </div>
                <div>
                  <p style={labelStyle}>Offer Expiration</p>
                  <p style={{ fontWeight: 600, fontSize: '0.9375rem' }}>
                    {offer.expirationDate ? new Date(offer.expirationDate).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'No Expiry'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div style={{ marginTop: '0.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.25rem', paddingLeft: '0.25rem' }}>Negotiation History</h3>
            <NegotiationTimeline negotiation={offer.negotiation} currentOfferId={offer.id} />
          </div>
        </div>

        {/* Sidebar Panel */}
        <div style={{ gridColumn: isMobile ? 'auto' : 'span 4', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Commission Breakdown Card */}
          <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', backgroundColor: 'rgba(var(--color-primary-rgb), 0.03)', border: '1px solid var(--color-primary)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <HandCoins size={18} />
              Commission Breakdown
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Buyer Side</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{formatCurrency(commission.buyer)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Seller Side</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{formatCurrency(commission.seller)}</span>
              </div>
              <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '0.25rem 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>Total Agency</span>
                <span style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-primary)' }}>{formatCurrency(commission.total)}</span>
              </div>

              <div style={{
                marginTop: '0.5rem',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '1.25rem', height: '1.25rem', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 700 }}>
                    {(offer.createdBy.firstName || offer.createdBy.email || 'A')[0].toUpperCase()}
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Agent Share</span>
                </div>
                <span style={{ fontSize: '1rem', fontWeight: 700 }}>{formatCurrency(commission.agent)}</span>
              </div>
            </div>

            <p style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textAlign: 'center', fontStyle: 'italic' }}>
              * Calculated based on current {(offer as any).type || 'SALE'} rates
            </p>
          </div>
          <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={18} color="var(--color-primary)" />
              Participants
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <ParticipantItem
                label="Buyer"
                name={`${offer.negotiation.contact.firstName} ${offer.negotiation.contact.lastName}`}
                sub={offer.negotiation.contact.email || offer.negotiation.contact.phone || ''}
              />
              <ParticipantItem
                label="Property Owner"
                name={offer.negotiation.property.sellerProfile?.contact?.firstName ? `${offer.negotiation.property.sellerProfile.contact.firstName} ${offer.negotiation.property.sellerProfile.contact.lastName}` : 'Direct Listing'}
                sub={offer.negotiation.property.address}
              />
              <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '0.25rem 0' }} />
              <ParticipantItem
                label="Managed By"
                name={`${offer.createdBy.firstName} ${offer.createdBy.lastName}`}
                sub={offer.createdBy.email}
                avatar={offer.createdBy.avatar}
              />
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem', backgroundColor: 'rgba(var(--color-primary-rgb), 0.03)', borderStyle: 'dashed' }}>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <AlertCircle size={18} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
              <div>
                <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.25rem' }}>Agent Context</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                  Currently <strong>{offer.status.toLowerCase().replace('_', ' ')}</strong>.
                  {isAgencyOffer ? " Submitted by agency on client behalf." : " Submitted directly by buyer."}
                </p>
              </div>
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

const MetricCard: React.FC<{ label: string, value: string, icon: any, highlight?: boolean }> = ({ label, value, icon: Icon, highlight }) => (
  <div className="card" style={{
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    backgroundColor: highlight ? 'rgba(var(--color-primary-rgb), 0.05)' : 'var(--color-surface)',
    border: highlight ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
    boxShadow: highlight ? 'var(--shadow-md)' : 'var(--shadow-sm)'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <p style={labelStyle}>{label}</p>
      <Icon size={14} color={highlight ? 'var(--color-primary)' : 'var(--color-text-muted)'} />
    </div>
    <p style={{
      fontSize: '1.25rem',
      fontWeight: 800,
      color: highlight ? 'var(--color-primary)' : 'var(--color-text)',
      letterSpacing: '-0.01em'
    }}>{value}</p>
  </div>
);

const ParticipantItem: React.FC<{ label: string, name: string, sub: string, avatar?: string }> = ({ label, name, sub, avatar }) => (
  <div style={{ display: 'flex', gap: '0.875rem', alignItems: 'center' }}>
    <div style={{
      width: '2.5rem', height: '2.75rem', borderRadius: '50%',
      backgroundColor: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, color: 'var(--color-primary)', flexShrink: 0,
      border: '1px solid var(--color-border)',
      backgroundImage: avatar ? `url("${getImageUrl(avatar)}")` : 'none',
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}>
      {!avatar && name[0].toUpperCase()}
    </div>
    <div style={{ minWidth: 0 }}>
      <p style={labelStyle}>{label}</p>
      <p style={{ fontSize: '0.875rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</p>
      <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub}</p>
    </div>
  </div>
);

const labelStyle: React.CSSProperties = {
  fontSize: '0.625rem',
  fontWeight: 800,
  color: 'var(--color-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.075em',
  marginBottom: '0.125rem'
};

export default OfferDetailsView;
