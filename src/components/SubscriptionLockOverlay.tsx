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
        zIndex: 10001,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)'
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
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      backdropFilter: 'blur(30px)',
      WebkitBackdropFilter: 'blur(30px)',
      overflowY: 'auto',
      WebkitOverflowScrolling: 'touch',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: '4rem 1.5rem'
    }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: '2.5rem',
          boxShadow: '0 30px 80px -20px rgba(0, 0, 0, 0.8)',
          maxWidth: '1100px',
          width: '100%',
          padding: '4rem 2.5rem',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          flexShrink: 0,
          marginBottom: '4rem'
        }}
      >
        {/* Abstract Background Accents */}
        <div style={{
          position: 'absolute',
          top: '-15%',
          right: '-10%',
          width: '50%',
          height: '50%',
          background: 'radial-gradient(circle, rgba(5, 150, 105, 0.12) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-15%',
          left: '-10%',
          width: '50%',
          height: '50%',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          <div style={{
            width: '72px',
            height: '72px',
            backgroundColor: 'rgba(220, 38, 38, 0.08)',
            borderRadius: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-error)',
            marginBottom: '2rem',
            border: '1px solid rgba(220, 38, 38, 0.15)',
            boxShadow: 'inset 0 0 20px rgba(220, 38, 38, 0.05)'
          }}>
            <ShieldAlert size={40} />
          </div>
          
          <h2 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '1rem', textAlign: 'center', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            Subscription Required
          </h2>
          
          <p style={{ 
            color: 'var(--color-text-muted)', 
            fontSize: '1.25rem', 
            maxWidth: '650px', 
            textAlign: 'center',
            marginBottom: '4rem',
            lineHeight: 1.6,
            fontWeight: 500
          }}>
            {isOwner 
              ? "Your organization's subscription has expired or is inactive. Choose a plan below to restore full access to EstateHub."
              : "Your organization's subscription has expired. Please contact your administrator or organization owner to restore access."}
          </p>

          {isOwner ? (
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem',
              width: '100%',
              justifyItems: 'center'
            }}>
              {plans.map((plan: Plan) => (
                <div 
                  key={plan.id}
                  onClick={() => setSelectedPlanId(plan.id)}
                  style={{
                    width: '100%',
                    maxWidth: '340px',
                    padding: '2.5rem 2rem',
                    borderRadius: '2rem',
                    border: `2px solid ${selectedPlanId === plan.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    backgroundColor: selectedPlanId === plan.id ? 'rgba(5, 150, 105, 0.04)' : 'var(--color-bg)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    boxShadow: selectedPlanId === plan.id ? '0 20px 40px -10px rgba(5, 150, 105, 0.15)' : 'none',
                    transform: selectedPlanId === plan.id ? 'translateY(-8px)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.01em' }}>{plan.name}</h3>
                    {plan.priceMonthly === 0 && (
                      <span style={{ 
                        fontSize: '0.75rem', 
                        fontWeight: 800, 
                        padding: '0.3rem 0.75rem', 
                        backgroundColor: 'var(--color-primary)', 
                        color: 'white',
                        borderRadius: '2rem',
                        boxShadow: '0 4px 12px rgba(5, 150, 105, 0.2)'
                      }}>
                        FREE
                      </span>
                    )}
                  </div>
                  
                  <div style={{ marginBottom: '2.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline' }}>
                      <span style={{ fontSize: '3.5rem', fontWeight: 900, letterSpacing: '-0.05em' }}>${plan.priceMonthly}</span>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '1.125rem', marginLeft: '0.25rem', fontWeight: 600 }}>/mo</span>
                    </div>
                  </div>

                  <div style={{ flexGrow: 1, marginBottom: '3rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {plan.features.slice(0, 6).map((feature, i) => (
                      <div key={i} style={{ 
                        display: 'flex', 
                        alignItems: 'flex-start', 
                        gap: '1rem', 
                        fontSize: '1rem',
                        color: 'var(--color-text-muted)',
                        lineHeight: 1.4,
                        fontWeight: 500
                      }}>
                        <div style={{ marginTop: '4px', flexShrink: 0 }}>
                          <CheckCircle2 size={18} style={{ color: 'var(--color-primary)' }} />
                        </div>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: 'auto', width: '100%', position: 'relative', zIndex: 50 }}>
                    <Button 
                      fullWidth 
                      size="lg"
                      variant="primary"
                      isLoading={isProcessing && selectedPlanId === plan.id}
                      disabled={isProcessing}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpgrade(plan.id);
                      }}
                      style={{ 
                        borderRadius: '1.25rem', 
                        height: '3.75rem', 
                        fontSize: '1.125rem',
                        boxShadow: '0 12px 24px -6px rgba(5, 150, 105, 0.3)'
                      }}
                    >
                      {selectedPlanId === plan.id ? 'Confirm Plan' : 'Select Plan'}
                    </Button>
                  </div>
                </div>
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
              marginTop: '3rem',
              padding: '1.25rem',
              backgroundColor: 'rgba(220, 38, 38, 0.08)',
              color: 'var(--color-error)',
              borderRadius: '1.25rem',
              textAlign: 'center',
              fontSize: '1rem',
              fontWeight: 600,
              border: '1px solid rgba(220, 38, 38, 0.2)',
              width: '100%',
              boxShadow: '0 8px 16px rgba(220, 38, 38, 0.05)'
            }}>
              {error}
            </div>
          )}

          <div style={{ 
            marginTop: '4rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem',
            color: 'var(--color-text-muted)',
            fontSize: '0.875rem',
            fontWeight: 600,
            opacity: 0.8
          }}>
            <CreditCard size={18} />
            <span>Secure upgrades enabled. No immediate payment required.</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SubscriptionLockOverlay;
