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
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)'
      }}>
        <Loader2 className="animate-spin" style={{ color: 'white' }} size={48} />
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      overflowY: 'auto',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: '2rem',
          boxShadow: 'var(--shadow-xl)',
          maxWidth: '1000px',
          width: '100%',
          padding: '3rem',
          position: 'relative',
          overflow: 'hidden'
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
          filter: 'blur(40px)'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-10%',
          left: '-10%',
          width: '40%',
          height: '40%',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(40px)'
        }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{
            width: '80px',
            height: '80px',
            backgroundColor: 'rgba(220, 38, 38, 0.1)',
            borderRadius: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-error)',
            marginBottom: '1.5rem',
            border: '1px solid rgba(220, 38, 38, 0.2)'
          }}>
            <ShieldAlert size={40} />
          </div>
          
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', textAlign: 'center' }}>
            Subscription Required
          </h2>
          
          <p style={{ 
            color: 'var(--color-text-muted)', 
            fontSize: '1.125rem', 
            maxWidth: '600px', 
            textAlign: 'center',
            marginBottom: '3rem'
          }}>
            {isOwner 
              ? "Your organization's subscription has expired or is inactive. Choose a plan below to restore full access to EstateHub."
              : "Your organization's subscription has expired. Please contact your administrator or organization owner to restore access."}
          </p>

          {isOwner ? (
            <div className="plans-carousel-mobile no-scrollbar">
              {plans.map((plan: Plan) => (
                <div 
                  key={plan.id}
                  onClick={() => setSelectedPlanId(plan.id)}
                  style={{
                    padding: '2rem',
                    borderRadius: '1.5rem',
                    border: `2px solid ${selectedPlanId === plan.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    backgroundColor: selectedPlanId === plan.id ? 'rgba(5, 150, 105, 0.05)' : 'var(--color-bg)',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    flexShrink: 0
                  }}
                >
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{plan.name}</h3>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <span style={{ fontSize: '2rem', fontWeight: 900 }}>${plan.priceMonthly}</span>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>/month</span>
                  </div>

                  <div style={{ flexGrow: 1, marginBottom: '2rem' }}>
                    {plan.features.slice(0, 4).map((feature, i) => (
                      <div key={i} style={{ 
                        display: 'flex', 
                        alignItems: 'flex-start', 
                        gap: '0.75rem', 
                        marginBottom: '0.75rem',
                        fontSize: '0.875rem',
                        color: 'var(--color-text-muted)'
                      }}>
                        <CheckCircle2 size={16} style={{ color: 'var(--color-primary)', marginTop: '2px', flexShrink: 0 }} />
                        <span>{feature}</span>
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
                  >
                    Select Plan
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <Button variant="outline" onClick={() => window.location.reload()}>
              Refresh Status
            </Button>
          )}

          {error && (
            <div style={{
              marginTop: '2rem',
              padding: '1rem',
              backgroundColor: 'rgba(220, 38, 38, 0.1)',
              color: 'var(--color-error)',
              borderRadius: '1rem',
              textAlign: 'center',
              fontSize: '0.875rem',
              border: '1px solid rgba(220, 38, 38, 0.2)',
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
