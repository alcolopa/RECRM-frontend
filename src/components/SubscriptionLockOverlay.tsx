import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, CreditCard, Loader2, CheckCircle2 } from 'lucide-react';
import { type UserProfile } from '../api/users';
import { subscriptionApi, type Plan } from '../api/subscription';
import { usePlans } from '../hooks/usePlans';
import Button from './Button';

interface SubscriptionLockOverlayProps {
  user: UserProfile;
  onPlanUpdated: () => void;
}

const SubscriptionLockOverlay: React.FC<SubscriptionLockOverlayProps> = ({ user, onPlanUpdated }) => {
  const { plans, loading: plansLoading } = usePlans();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOwner = user.role === 'OWNER';

  // Lock background scroll when blocker is active
  React.useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleUpgrade = async (planId: string) => {
    if (!isOwner) return;
    
    setIsProcessing(true);
    setError(null);
    try {
      // Subscribe with a default of 5 seats
      await subscriptionApi.subscribe(planId, 5, user.organizationId || '');
      onPlanUpdated();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upgrade subscription. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (plansLoading) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10001,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-bg)',
        color: 'var(--color-text)'
      }}>
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 10000,
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      color: 'white',
      overflow: 'hidden' // Blocker for scroll
    }}>
      {/* Background Accents */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '10%',
        width: '40vw',
        height: '40vw',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
        filter: 'blur(100px)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '10%',
        width: '40vw',
        height: '40vw',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
        filter: 'blur(100px)',
        pointerEvents: 'none'
      }} />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ 
          zIndex: 10, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          width: '100%',
          maxWidth: '1200px'
        }}
      >
        <div style={{
          width: '64px',
          height: '64px',
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          borderRadius: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#f87171',
          marginBottom: '1.5rem',
          border: '1px solid rgba(239, 68, 68, 0.3)',
        }}>
          <ShieldAlert size={32} />
        </div>
        
        <h2 style={{ 
          fontSize: 'min(3.5rem, 8vw)', 
          fontWeight: 900, 
          marginBottom: '0.75rem', 
          textAlign: 'center', 
          letterSpacing: '-0.04em', 
          lineHeight: 1,
          color: 'white'
        }}>
          Subscription Required
        </h2>
        
        <p style={{ 
          color: 'rgba(255, 255, 255, 0.7)', 
          fontSize: 'min(1.125rem, 4vw)', 
          maxWidth: '600px', 
          textAlign: 'center',
          marginBottom: '2.5rem',
          lineHeight: 1.5,
          fontWeight: 500
        }}>
          {isOwner 
            ? "Your organization's subscription has expired or is inactive. Choose a plan below to restore full access to EstateHub."
            : "Your organization's subscription has expired. Please contact your administrator or organization owner to restore access."}
        </p>

        {isOwner ? (
          <div 
            className="subscription-grid"
            style={{ 
              display: 'flex',
              gap: '1.5rem',
              width: '100%',
              justifyContent: 'center',
              flexWrap: 'wrap',
              maxHeight: '60vh',
              overflow: 'visible',
              padding: '1rem'
            }}
          >
            {plans.map((plan: Plan) => (
              <motion.div 
                key={plan.id}
                whileHover={{ y: -5 }}
                onClick={() => setSelectedPlanId(plan.id)}
                style={{
                  width: '100%',
                  maxWidth: '300px',
                  flexShrink: 0,
                  padding: '1.75rem',
                  borderRadius: '1.75rem',
                  border: `2px solid ${selectedPlanId === plan.id ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.1)'}`,
                  backgroundColor: selectedPlanId === plan.id ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  boxShadow: selectedPlanId === plan.id ? '0 20px 40px rgba(0, 0, 0, 0.3)' : 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white' }}>{plan.name}</h3>
                  {plan.priceMonthly === 0 && (
                    <span style={{ fontSize: '0.65rem', fontWeight: 900, padding: '0.2rem 0.5rem', backgroundColor: 'var(--color-primary)', color: 'white', borderRadius: '1rem' }}>
                      FREE
                    </span>
                  )}
                </div>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline' }}>
                    <span style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white' }}>${plan.priceMonthly}</span>
                    <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.875rem', marginLeft: '0.25rem', fontWeight: 600 }}>/mo</span>
                  </div>
                </div>

                <div style={{ flexGrow: 1, marginBottom: '1.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {plan.features.slice(0, 4).map((feature, i) => (
                    <div key={i} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.75rem', 
                      fontSize: '0.875rem',
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontWeight: 500,
                    }}>
                      <CheckCircle2 size={16} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                      <span style={{ 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        whiteSpace: 'nowrap' 
                      }}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <Button 
                  fullWidth 
                  variant={selectedPlanId === plan.id ? 'primary' : 'outline'}
                  isLoading={isProcessing && selectedPlanId === plan.id}
                  disabled={isProcessing}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpgrade(plan.id);
                  }}
                  style={{ 
                    borderRadius: '1rem', 
                    height: '3rem', 
                    fontSize: '0.9375rem',
                    borderColor: selectedPlanId === plan.id ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.3)',
                    color: 'white'
                  }}
                >
                  {selectedPlanId === plan.id ? 'Confirm Plan' : 'Select Plan'}
                </Button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <Button size="lg" variant="primary" onClick={() => window.location.reload()}>
              Refresh Access Status
            </Button>
          </div>
        )}

        {error && (
          <div style={{
            marginTop: '2rem',
            padding: '1rem',
            backgroundColor: 'rgba(220, 38, 38, 0.15)',
            color: '#f87171',
            borderRadius: '1rem',
            textAlign: 'center',
            fontSize: '0.875rem',
            fontWeight: 600,
            border: '1px solid rgba(239, 68, 68, 0.3)',
            maxWidth: '500px',
            width: '100%'
          }}>
            {error}
          </div>
        )}

        <div style={{ 
          marginTop: '3rem', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          color: 'rgba(255, 255, 255, 0.4)',
          fontSize: '0.75rem',
          fontWeight: 600
        }}>
          <CreditCard size={14} />
          <span>Secure upgrades enabled. No immediate payment required.</span>
        </div>
      </motion.div>

      {/* Mobile-only styles to override grid if needed */}
      <style>{`
        @media (max-width: 768px) {
          .subscription-grid {
            flex-wrap: nowrap !important;
            justify-content: flex-start !important;
            overflow-x: auto !important;
            scroll-snap-type: x mandatory !important;
            -webkit-overflow-scrolling: touch;
            padding: 2rem !important;
            margin: 0 -2rem;
            width: calc(100% + 4rem) !important;
            max-height: none !important;
          }
          .subscription-grid > div {
            scroll-snap-align: center !important;
            min-width: 280px !important;
            flex: 0 0 85% !important;
          }
          /* Hide scrollbar but keep functionality */
          .subscription-grid::-webkit-scrollbar {
            display: none;
          }
          .subscription-grid {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        }
      `}</style>
    </div>
  );
};

export default SubscriptionLockOverlay;
