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
      backdropFilter: 'blur(25px)',
      WebkitBackdropFilter: 'blur(25px)',
      overflowY: 'auto',
      WebkitOverflowScrolling: 'touch',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: '3rem 1.5rem'
    }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: '2.5rem',
          boxShadow: '0 25px 70px -15px rgba(0, 0, 0, 0.7)',
          maxWidth: '1000px',
          width: '100%',
          padding: '3rem 2rem',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          flexShrink: 0,
          marginBottom: '3rem'
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
          filter: 'blur(60px)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-10%',
          left: '-10%',
          width: '40%',
          height: '40%',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          <div style={{
            width: '64px',
            height: '64px',
            backgroundColor: 'rgba(220, 38, 38, 0.1)',
            borderRadius: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-error)',
            marginBottom: '1.5rem',
            border: '1px solid rgba(220, 38, 38, 0.2)'
          }}>
            <ShieldAlert size={36} />
          </div>
          
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.75rem', textAlign: 'center', letterSpacing: '-0.02em' }}>
            Subscription Required
          </h2>
          
          <p style={{ 
            color: 'var(--color-text-muted)', 
            fontSize: '1.125rem', 
            maxWidth: '600px', 
            textAlign: 'center',
            marginBottom: '3.5rem',
            lineHeight: 1.6
          }}>
            {isOwner 
              ? "Your organization's subscription has expired or is inactive. Choose a plan below to restore full access to EstateHub."
              : "Your organization's subscription has expired. Please contact your administrator or organization owner to restore access."}
          </p>

          {isOwner ? (
            <div style={{ 
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1.5rem',
              width: '100%',
              justifyContent: 'center'
            }}>
              {plans.map((plan: Plan) => (
                <div 
                  key={plan.id}
                  onClick={() => setSelectedPlanId(plan.id)}
                  style={{
                    flex: '1',
                    minWidth: '280px',
                    maxWidth: '310px',
                    padding: '2rem 1.75rem',
                    borderRadius: '1.75rem',
                    border: `2px solid ${selectedPlanId === plan.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    backgroundColor: selectedPlanId === plan.id ? 'rgba(5, 150, 105, 0.05)' : 'var(--color-bg)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    zIndex: 20,
                    boxShadow: selectedPlanId === plan.id ? 'var(--shadow-lg)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.375rem', fontWeight: 800 }}>{plan.name}</h3>
                  </div>
                  
                  <div style={{ marginBottom: '1.75rem' }}>
                    <span style={{ fontSize: '2.75rem', fontWeight: 900 }}>${plan.priceMonthly}</span>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '1rem' }}>/mo</span>
                  </div>

                  <div style={{ flexGrow: 1, marginBottom: '2.5rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                    {plan.features.slice(0, 6).map((feature, i) => (
                      <div key={i} style={{ 
                        display: 'flex', 
                        alignItems: 'flex-start', 
                        gap: '0.75rem', 
                        fontSize: '0.9375rem',
                        color: 'var(--color-text-muted)',
                        lineHeight: 1.4
                      }}>
                        <CheckCircle2 size={18} style={{ color: 'var(--color-primary)', marginTop: '2px', flexShrink: 0 }} />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    fullWidth 
                    size="lg"
                    variant={selectedPlanId === plan.id ? 'primary' : 'outline'}
                    isLoading={isProcessing && selectedPlanId === plan.id}
                    disabled={isProcessing}
                    onClick={() => handleUpgrade(plan.id)}
                    style={{ borderRadius: '1.25rem', height: '3.5rem', pointerEvents: 'auto' }}
                  >
                    {selectedPlanId === plan.id ? 'Confirm Plan' : 'Select Plan'}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <Button size="lg" variant="outline" onClick={() => window.location.reload()}>
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
            fontSize: '0.75rem',
            opacity: 0.8
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
