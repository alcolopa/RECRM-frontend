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

  const handleUpgrade = async (planId: string) => {
    if (!isOwner) return;
    
    setIsProcessing(true);
    setError(null);
    try {
      // Stubbed payment: just subscribe to the chosen plan
      // We'll use 5 seats as a default for now.
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
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)'
      }}>
        <Loader2 className="animate-spin" style={{ color: 'white' }} size={48} />
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 10000,
      overflowY: 'auto',
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      display: 'grid',
      placeItems: 'start center', // Aligns to top, centers horizontally
      padding: '40px 20px'
    }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: '2rem',
          boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.6)',
          maxWidth: '1100px',
          width: '100%',
          padding: '2.5rem 2rem',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid var(--color-border)',
          marginBottom: '40px' // Extra space at bottom when scrolling
        }}
      >
        {/* Abstract Background Accents */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '-10%',
          width: '40%',
          height: '40%',
          background: 'radial-gradient(circle, rgba(5, 150, 105, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-10%',
          left: '-10%',
          width: '40%',
          height: '40%',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)'
        }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{
            width: '60px',
            height: '60px',
            backgroundColor: 'rgba(220, 38, 38, 0.1)',
            borderRadius: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-error)',
            marginBottom: '1.5rem',
            border: '1px solid rgba(220, 38, 38, 0.2)'
          }}>
            <ShieldAlert size={32} />
          </div>
          
          <h2 style={{ fontSize: '2.25rem', fontWeight: 900, marginBottom: '0.75rem', textAlign: 'center', letterSpacing: '-0.025em' }}>
            Subscription Required
          </h2>
          
          <p style={{ 
            color: 'var(--color-text-muted)', 
            fontSize: '1.125rem', 
            maxWidth: '650px', 
            textAlign: 'center',
            marginBottom: '3rem',
            lineHeight: 1.5
          }}>
            {isOwner 
              ? "Your organization's subscription has expired or is inactive. Choose a plan below to restore full access to EstateHub."
              : "Your organization's subscription has expired. Please contact your administrator or organization owner to restore access."}
          </p>

          {isOwner ? (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '1.5rem',
              width: '100%'
            }}>
              {plans.map((plan: Plan) => (
                <div 
                  key={plan.id}
                  onClick={() => setSelectedPlanId(plan.id)}
                  style={{
                    padding: '2rem 1.5rem',
                    borderRadius: '1.5rem',
                    border: `2px solid ${selectedPlanId === plan.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    backgroundColor: selectedPlanId === plan.id ? 'rgba(5, 150, 105, 0.05)' : 'var(--color-bg)',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{plan.name}</h3>
                    {plan.priceMonthly === 0 && (
                      <span style={{ 
                        fontSize: '0.7rem', 
                        fontWeight: 700, 
                        padding: '0.2rem 0.6rem', 
                        backgroundColor: 'rgba(5, 150, 105, 0.1)', 
                        color: 'var(--color-primary)',
                        borderRadius: '2rem'
                      }}>
                        FREE
                      </span>
                    )}
                  </div>
                  
                  <div style={{ marginBottom: '1.5rem' }}>
                    <span style={{ fontSize: '2.5rem', fontWeight: 900 }}>${plan.priceMonthly}</span>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>/mo</span>
                  </div>

                  <div style={{ flexGrow: 1, marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {plan.features.slice(0, 6).map((feature, i) => (
                      <div key={i} style={{ 
                        display: 'flex', 
                        alignItems: 'flex-start', 
                        gap: '0.625rem', 
                        fontSize: '0.875rem',
                        color: 'var(--color-text-muted)',
                        lineHeight: 1.3
                      }}>
                        <CheckCircle2 size={16} style={{ color: 'var(--color-primary)', marginTop: '2px', flexShrink: 0 }} />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    fullWidth 
                    size="md"
                    variant={selectedPlanId === plan.id ? 'primary' : 'outline'}
                    isLoading={isProcessing && selectedPlanId === plan.id}
                    disabled={isProcessing}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpgrade(plan.id);
                    }}
                    style={{ borderRadius: '1rem' }}
                  >
                    {selectedPlanId === plan.id ? 'Confirm Upgrade' : 'Select Plan'}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <Button size="lg" variant="outline" onClick={() => window.location.reload()}>
                Refresh Access Status
              </Button>
            </div>
          )}

          {error && (
            <div style={{
              marginTop: '1.5rem',
              padding: '0.875rem',
              backgroundColor: 'rgba(220, 38, 38, 0.1)',
              color: 'var(--color-error)',
              borderRadius: '0.75rem',
              textAlign: 'center',
              fontSize: '0.8125rem',
              border: '1px solid rgba(220, 38, 38, 0.2)',
              width: '100%'
            }}>
              {error}
            </div>
          )}

          <div style={{ 
            marginTop: '2.5rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            color: 'var(--color-text-muted)',
            fontSize: '0.75rem'
          }}>
            <CreditCard size={14} />
            <span>Secure upgrades enabled. No immediate payment required.</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SubscriptionLockOverlay;
