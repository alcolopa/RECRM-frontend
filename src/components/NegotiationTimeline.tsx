import React, { useState, useEffect } from 'react';
import { 
  ChevronDown,
  ChevronUp,
  User,
  Building2
} from 'lucide-react';
import { OffererType } from '../api/offers';
import Button from './Button';

interface NegotiationTimelineProps {
  negotiation: any;
  currentOfferId?: string;
}

interface TimelineEvent {
  id: string;
  action: string;
  offerer: OffererType;
  price: number;
  date: string;
  user: any;
  notes?: string | null;
}

const NegotiationTimeline: React.FC<NegotiationTimelineProps> = ({ negotiation }) => {
  const offers = (negotiation?.offers || []) as any[];
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showAll, setShowAll] = useState(false);

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

  const formatDateLabel = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const timelineEvents: TimelineEvent[] = offers.flatMap(offer => {
    const events: TimelineEvent[] = [];
    if (offer.history) {
      (offer.history as any[]).forEach(h => {
        let price = offer.price;
        try {
          if (h.action === 'COUNTER_OFFER' || h.action === 'OFFER_CREATED') {
            const data = JSON.parse(h.newValue || '{}');
            if (data.price) price = data.price;
          } else if (h.oldValue && (h.action === 'COUNTER_OFFER' || h.action === 'STATUS_CHANGED')) {
             const data = JSON.parse(h.oldValue || '{}');
             if (data.price) price = data.price;
          }
        } catch (e) {}

        let notes = null;
        if (h.action === 'OFFER_CREATED' || h.action === 'COUNTER_OFFER') {
          try {
            const data = JSON.parse(h.newValue || '{}');
            notes = data.notes || offer.notes;
          } catch (e) {
            notes = offer.notes;
          }
        }

        events.push({
          id: h.id,
          action: h.action,
          offerer: h.offerer,
          price: price,
          date: h.createdAt,
          user: h.user,
          notes: notes
        });
      });
    }
    return events;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const visibleEvents = showAll ? timelineEvents : timelineEvents.slice(0, 3);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '1.5rem', 
        position: 'relative',
        padding: isMobile ? '0' : '1rem 0'
      }}>
        {!isMobile && (
          <div style={{ 
            position: 'absolute', 
            left: '50%', 
            top: 0, 
            bottom: 0, 
            width: '1px', 
            backgroundColor: 'var(--color-border)',
            zIndex: 0
          }} />
        )}

        {visibleEvents.map((event: TimelineEvent) => {
          const isBuyer = event.offerer === OffererType.BUYER;
          const alignment = isMobile ? 'left' : (isBuyer ? 'right' : 'left');

          return (
            <div key={event.id} style={{ 
              display: 'flex', 
              justifyContent: alignment === 'right' ? 'flex-end' : 'flex-start',
              width: '100%',
              position: 'relative',
              zIndex: 1
            }}>
              {!isMobile && (
                <div style={{ 
                  position: 'absolute', 
                  left: '50%', 
                  top: '1.5rem', 
                  width: '0.75rem', 
                  height: '0.75rem', 
                  borderRadius: '50%', 
                  backgroundColor: 'var(--color-surface)', 
                  border: `2px solid ${isBuyer ? '#3b82f6' : 'var(--color-primary)'}`,
                  transform: 'translateX(-50%)',
                  zIndex: 2
                }} />
              )}

              <div className="card" style={{ 
                width: isMobile ? '100%' : 'calc(50% - 2rem)',
                padding: '1rem',
                borderLeft: isMobile ? `4px solid ${isBuyer ? '#3b82f6' : 'var(--color-primary)'}` : '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {isBuyer ? <User size={16} color="#3b82f6" /> : <Building2 size={16} color="var(--color-primary)" />}
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: isBuyer ? '#3b82f6' : 'var(--color-primary)' }}>
                      {event.offerer === OffererType.BUYER ? 'Buyer Offer' : 'Agency Counter'}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{formatDateLabel(event.date)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{formatPrice(event.price)}</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                    {event.action.replace(/_/g, ' ')}
                  </div>
                </div>

                {event.notes && (
                  <div style={{ 
                    fontSize: '0.875rem', 
                    color: 'var(--color-text)', 
                    padding: '0.75rem', 
                    backgroundColor: 'var(--color-bg)', 
                    borderRadius: '0.5rem',
                    fontStyle: 'italic',
                    borderLeft: `2px solid var(--color-border)`
                  }}>
                    {event.notes}
                  </div>
                )}

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'flex-end', 
                  fontSize: '0.65rem', 
                  color: 'var(--color-text-muted)',
                  borderTop: '1px solid var(--color-border)',
                  paddingTop: '0.5rem'
                }}>
                  <span>Logged by {event.user?.firstName}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {timelineEvents.length > 3 && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
          <Button 
            variant="ghost" 
            onClick={() => setShowAll(!showAll)}
            leftIcon={showAll ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          >
            {showAll ? 'Show Fewer' : `Show ${timelineEvents.length - 3} more events`}
          </Button>
        </div>
      )}
    </div>
  );
};

export default NegotiationTimeline;
