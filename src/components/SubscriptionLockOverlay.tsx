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
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
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
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: '2rem 1rem'
    }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: '2.5rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          maxWidth: '1100px',
          width: '100%',
          padding: '4rem 2rem',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid var(--color-border)',
          margin: 'auto'
        }}
      >
        {/* Abstract Background Accents */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '-10%',
          width: '40%',
          height: '40%',
          background: 'radial-gradient(circle, rgba(5, 150, 105, 0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-10%',
          left: '-10%',
          width: '40%',
          height: '40%',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)'
        }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{
            width: '80px',
            height: '80px',
            backgroundColor: 'rgba(220, 38, 38, 0.1)',
            borderRadius: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-error)',
            marginBottom: '2rem',
            border: '1px solid rgba(220, 38, 38, 0.2)',
            boxShadow: '0 10px 15px -3px rgba(220, 38, 38, 0.1)'
          }}>
            <ShieldAlert size={40} />
          </div>
          
          <h2 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '1rem', textAlign: 'center', letterSpacing: '-0.025em' }}>
            Subscription Expired
          </h2>
          
          <p style={{ 
            color: 'var(--color-text-muted)', 
            fontSize: '1.25rem', 
            maxWidth: '700px', 
            textAlign: 'center',
            marginBottom: '4rem',
            lineHeight: 1.6
          }}>
            {isOwner 
              ? "Your organization's subscription has expired or is inactive. Choose a plan below to restore full access to EstateHub."
              : "Your organization's subscription has expired. Please contact your administrator or organization owner to restore access."}
          </p>

          {isOwner ? (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '2rem',
              width: '100%',
              marginBottom: '1rem'
            }}>
              {plans.map((plan: Plan) => (
                <div 
                  key={plan.id}
                  onClick={() => setSelectedPlanId(plan.id)}
                  style={{
                    padding: '2.5rem 2rem',
                    borderRadius: '2rem',
                    border: `2px solid ${selectedPlanId === plan.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    backgroundColor: selectedPlanId === plan.id ? 'rgba(5, 150, 105, 0.05)' : 'var(--color-bg)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: selectedPlanId === plan.id ? 'var(--shadow-lg)' : 'none',
                    transform: selectedPlanId === plan.id ? 'translateY(-4px)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{plan.name}</h3>
                    {plan.priceMonthly === 0 && (
                      <span style={{ 
                        fontSize: '0.75rem', 
                        fontWeight: 700, 
                        padding: '0.25rem 0.75rem', 
                        backgroundColor: 'rgba(5, 150, 105, 0.1)', 
                        color: 'var(--color-primary)',
                        borderRadius: '2rem',
                        textTransform: 'uppercase'
                      }}>
                        Free Tier
                      </span>
                    )}
                  </div>
                  
                  <div style={{ marginBottom: '2rem' }}>
                    <span style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.05em' }}>${plan.priceMonthly}</span>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '1rem', marginLeft: '0.25rem' }}>/mo</span>
                  </div>

                  <div style={{ flexGrow: 1, marginBottom: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {plan.features.map((feature, i) => (
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpgrade(plan.id);
                    }}
                    style={{ borderRadius: '1.25rem', height: '3.5rem' }}
                  >
                    {selectedPlanId === plan.id ? 'Confirm Plan' : 'Select Plan'}
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
