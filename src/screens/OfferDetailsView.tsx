import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  Building2, 
  User, 
  Calendar, 
  HandCoins, 
  Clock,
  Check,
  History,
  Loader2,
  DollarSign,
  FileText,
  Save,
  Plus
} from 'lucide-react';
import { motion } from 'framer-motion';
import { type Offer, OfferStatus, offersService } from '../api/offers';
import Button from '../components/Button';
import ConfirmModal from '../components/ConfirmModal';
import CounterOfferModal from '../components/CounterOfferModal';
import NegotiationTimeline from '../components/NegotiationTimeline';
import { getImageUrl } from '../utils/url';
import { useNavigation } from '../contexts/NavigationContext';
import { Textarea } from '../components/Input';
import { usePermissions } from '../utils/permissions';
import { type UserProfile, Permission } from '../api/users';

interface OfferDetailsViewProps {
  organizationId: string;
  user: UserProfile;
}

const OfferDetailsView: React.FC<OfferDetailsViewProps> = ({ organizationId, user }) => {
  const permissions = usePermissions(user);
  const { navigationState, navigate } = useNavigation();
  const offerId = navigationState.prefillData?.offerId;
  
  const [offer, setOffer] = useState<Offer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isCounterModalOpen, setIsCounterModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth <= 1024);

  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteValue, setNoteValue] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width <= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchOfferDetails = async () => {
    if (!offerId) return;
    setIsLoading(true);
    try {
      const response = await offersService.getOne(offerId, organizationId);
      setOffer(response.data);
      setNoteValue(response.data.notes || '');
    } catch (err) {
      console.error('Failed to fetch offer details', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOfferDetails();
  }, [offerId, organizationId]);

  const formatPrice = (price?: number) => {
    if (price === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleAccept = async () => {
    if (!offer) return;
    setIsProcessing(true);
    try {
      await offersService.accept(offer.id, organizationId);
      await fetchOfferDetails();
      setIsAcceptModalOpen(false);
    } catch (err) {
      console.error('Failed to accept offer', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!offer) return;
    setIsProcessing(true);
    try {
      await offersService.reject(offer.id, organizationId);
      await fetchOfferDetails();
      setIsRejectModalOpen(false);
    } catch (err) {
      console.error('Failed to reject offer', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveNote = async () => {
    if (!offer) return;
    setIsSavingNote(true);
    try {
      await offersService.update(offer.id, { notes: noteValue }, organizationId);
      await fetchOfferDetails();
      setIsEditingNote(false);
    } catch (err) {
      console.error('Failed to save note', err);
    } finally {
      setIsSavingNote(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', padding: '4rem' }}>
        <Loader2 size={40} className="animate-spin" color="var(--color-primary)" />
      </div>
    );
  }

  if (!offer) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <h2>Offer not found</h2>
        <Button onClick={() => navigate('offers')}>Back to Offers</Button>
      </div>
    );
  }

  const canAction = [OfferStatus.SUBMITTED, OfferStatus.UNDER_REVIEW, OfferStatus.COUNTERED].includes(offer.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: isMobile ? '1.25rem' : '2rem', 
        maxWidth: '1000px', 
        margin: '0 auto',
        paddingBottom: '2rem'
      }}
    >
      <header style={{ 
        display: 'flex', 
        alignItems: isMobile ? 'flex-start' : 'center', 
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: isMobile ? '1 0 100%' : 'none' }}>
          <Button
            variant="ghost"
            onClick={() => navigate('offers')}
            aria-label="Back to offers"
            style={{ padding: '0.5rem', borderRadius: '50%', width: '40px', height: '40px' }}
          >
            <ChevronLeft size={24} />
          </Button>
          <div>
            <h1 style={{ fontSize: isMobile ? '1.25rem' : '1.875rem', fontWeight: 700, margin: 0 }}>Offer Details</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', margin: 0 }}>
              Negotiation for {offer.negotiation?.property?.title}
            </p>
          </div>
        </div>
        
        <div style={{ 
          marginLeft: isMobile ? '0' : 'auto', 
          display: 'flex', 
          gap: '0.75rem',
          flex: isMobile ? '1 0 100%' : 'none',
          justifyContent: isMobile ? 'flex-start' : 'flex-end',
          paddingLeft: isMobile ? '3.5rem' : '0'
        }}>
          {canAction && permissions.can(Permission.DEALS_EDIT) && (
            <>
               <Button 
                variant="outline" 
                size={isMobile ? "sm" : "md"}
                onClick={() => setIsCounterModalOpen(true)}
                style={{ color: '#3b82f6', border: '1px solid #3b82f6' }}
              >
                Counter
              </Button>
              <Button 
                variant="outline" 
                size={isMobile ? "sm" : "md"}
                onClick={() => setIsRejectModalOpen(true)}
                style={{ color: 'var(--color-error)', border: '1px solid var(--color-error)' }}
              >
                Reject
              </Button>
              <Button 
                variant="primary" 
                size={isMobile ? "sm" : "md"}
                onClick={() => setIsAcceptModalOpen(true)}
                leftIcon={<Check size={isMobile ? 16 : 18} />}
              >
                Accept
              </Button>
            </>
          )}
        </div>
      </header>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: (isMobile || isTablet) ? '1fr' : '2fr 1fr', 
        gap: '2rem' 
      }}>
        {/* Main Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card" style={{ padding: isMobile ? '1.25rem' : '1.5rem' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              borderBottom: '1px solid var(--color-border)', 
              paddingBottom: '1rem', 
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '0.75rem', borderRadius: '0.75rem', backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)', color: 'var(--color-primary)' }}>
                  <HandCoins size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Current Price</div>
                  <div style={{ fontSize: isMobile ? '1.5rem' : '1.75rem', fontWeight: 800, color: 'var(--color-primary)' }}>{formatPrice(offer.price)}</div>
                </div>
              </div>
              <div style={{ 
                padding: '0.375rem 1rem', 
                borderRadius: '2rem', 
                fontSize: '0.75rem', 
                fontWeight: 700, 
                textTransform: 'uppercase',
                backgroundColor: 'var(--color-bg)',
                color: 'var(--color-text)',
                border: '1px solid var(--color-border)'
              }}>
                {offer.status.replace('_', ' ')}
              </div>
            </div>

            <div className="grid grid-2" style={{ gap: '1.5rem 2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>
                  <DollarSign size={14} /> Security Deposit
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 600 }}>{formatPrice(offer.deposit || 0)}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>
                  <HandCoins size={14} /> Financing Type
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 600 }}>{offer.financingType.replace('_', ' ')}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>
                  <Calendar size={14} /> Closing Date
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 600 }}>{formatDate(offer.closingDate)}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>
                  <Clock size={14} /> Expiration Date
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 600 }}>{formatDate(offer.expirationDate)}</div>
              </div>
            </div>

            <div style={{ marginTop: '2.5rem' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '1rem' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  <FileText size={14} /> Additional Terms & Notes
                </div>
                {permissions.can(Permission.DEALS_EDIT) && (
                  !isEditingNote ? (
                    <Button variant="ghost" size="sm" onClick={() => setIsEditingNote(true)} style={{ height: 'auto', padding: '0.25rem 0.5rem' }}>
                      {offer.notes ? 'Edit' : 'Add Note'}
                    </Button>
                  ) : (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Button variant="ghost" size="sm" onClick={() => setIsEditingNote(false)} style={{ height: 'auto', padding: '0.25rem 0.5rem' }}>Cancel</Button>
                      <Button variant="primary" size="sm" onClick={handleSaveNote} isLoading={isSavingNote} leftIcon={<Save size={14} />} style={{ height: 'auto', padding: '0.25rem 0.75rem' }}>Save</Button>
                    </div>
                  )
                )}
              </div>
              
              {isEditingNote ? (
                <Textarea
                  id="offerNotes"
                  name="offerNotes"
                  value={noteValue}
                  onChange={(e) => setNoteValue(e.target.value)}
                  placeholder="Enter terms or additional internal notes..."
                  rows={4}
                  autoFocus
                />
              ) : offer.notes ? (
                <div style={{ padding: '1.25rem', backgroundColor: 'var(--color-bg)', borderRadius: '0.75rem', border: '1px solid var(--color-border)' }}>
                  <p style={{ margin: 0, lineHeight: 1.6, color: 'var(--color-text)', whiteSpace: 'pre-wrap' }}>{offer.notes}</p>
                </div>
              ) : (
                <div 
                  onClick={() => setIsEditingNote(true)}
                  style={{ 
                    padding: '2rem', 
                    textAlign: 'center', 
                    backgroundColor: 'var(--color-bg)', 
                    borderRadius: '0.75rem', 
                    border: '1px dashed var(--color-border)',
                    color: 'var(--color-text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  <Plus size={24} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                  <div>No notes yet. Click to add one.</div>
                </div>
              )}
            </div>
          </div>

          <section>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <History size={20} /> Negotiation Timeline
            </h2>
            <NegotiationTimeline offers={offer.negotiation?.offers || [offer]} />
          </section>
        </div>

        {/* Sidebar Info */}
        <div style={{ 
          display: 'flex', 
          flexDirection: isTablet ? 'row' : 'column', 
          gap: '1.5rem',
          flexWrap: isTablet ? 'wrap' : 'nowrap'
        }}>
          {/* Property Card */}
          <div className="card" style={{ 
            padding: '1rem', 
            overflow: 'hidden',
            flex: isTablet ? '1 0 300px' : 'none'
          }}>
            <div style={{ 
              height: isMobile ? '120px' : '150px', 
              borderRadius: '0.75rem', 
              marginBottom: '1rem',
              backgroundImage: offer.negotiation?.property?.propertyImages?.[0]?.url ? `url(${getImageUrl(offer.negotiation.property.propertyImages[0].url)})` : 'none',
              backgroundColor: 'var(--color-bg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {!offer.negotiation?.property?.propertyImages?.[0]?.url && <Building2 size={40} color="var(--color-border)" />}
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: '0 0 0.5rem' }}>{offer.negotiation?.property?.title}</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', margin: '0 0 1rem' }}>{offer.negotiation?.property?.address}</p>
            {permissions.can(Permission.PROPERTIES_VIEW) && (
              <Button variant="outline" fullWidth onClick={() => navigate('properties')}>View Property</Button>
            )}
          </div>

          {/* Contact Card */}
          <div className="card" style={{ 
            padding: '1.25rem',
            flex: isTablet ? '1 0 300px' : 'none'
          }}>
            <h4 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>Buyer Details</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ width: '3rem', height: '3rem', borderRadius: '50%', backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                <User size={24} />
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{offer.negotiation?.contact?.firstName} {offer.negotiation?.contact?.lastName}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{offer.negotiation?.contact?.email}</div>
              </div>
            </div>
            {permissions.can(Permission.CONTACTS_VIEW) && (
              <Button variant="outline" fullWidth onClick={() => navigate('contacts')}>View Contact</Button>
            )}
          </div>

          {/* Agent Info */}
          <div style={{ 
            padding: '0 0.5rem',
            flex: isTablet ? '1 0 100%' : 'none'
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
               <div>Log created by <strong>{offer.createdBy?.firstName} {offer.createdBy?.lastName}</strong></div>
               <div>Last updated {formatDate(offer.updatedAt)}</div>
            </div>
          </div>
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
          fetchOfferDetails();
        }}
      />
    </motion.div>
  );
};

export default OfferDetailsView;