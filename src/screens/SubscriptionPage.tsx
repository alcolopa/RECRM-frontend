import React, { useState } from 'react';
import { 
  CreditCard, 
  Check, 
  Users, 
  AlertCircle, 
  Loader2, 
  Calendar, 
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Zap,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useSubscription } from '../hooks/useSubscription';
import { usePlans } from '../hooks/usePlans';
import { type UserProfile } from '../api/users';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { Input } from '../components/Input';

interface SubscriptionPageProps {
  user: UserProfile;
}

const SubscriptionPage: React.FC<SubscriptionPageProps> = ({ user }) => {
  const { subscription, loading: subLoading, updateSeats, changePlan } = useSubscription(user.organizationId || null);
  const { plans, loading: plansLoading } = usePlans();
  
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isSeatsModalOpen, setIsSeatsModalOpen] = useState(false);
  const [newSeats, setNewSeats] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isOwner = user.role === 'OWNER';

  const handleUpdatePlan = async () => {
    if (!selectedPlanId) return;
    setIsProcessing(true);
    setActionError(null);
    try {
      await changePlan(selectedPlanId);
      setSuccessMessage('Plan updated successfully!');
      setIsUpdateModalOpen(false);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateSeats = async () => {
    setIsProcessing(true);
    setActionError(null);
    try {
      await updateSeats(newSeats);
      setSuccessMessage('Seats updated successfully!');
      setIsSeatsModalOpen(false);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const openUpdateModal = (planId: string) => {
    if (!isOwner) return;
    setSelectedPlanId(planId);
    setIsUpdateModalOpen(true);
  };

  const openSeatsModal = () => {
    if (!isOwner) return;
    setNewSeats(subscription?.seats || 0);
    setIsSeatsModalOpen(true);
  };

  if (subLoading || plansLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Loader2 className="animate-spin" size={40} color="var(--color-primary)" />
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="container" style={{ maxWidth: '800px', padding: '4rem 2rem', textAlign: 'center' }}>
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
          <div style={{ padding: '1.5rem', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' }}>
            <ShieldCheck size={48} />
          </div>
        </div>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>Access Denied</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.125rem', marginBottom: '2rem' }}>
          Only the organization owner can access and manage subscription settings.
        </p>
        <Button onClick={() => window.history.back()}>Go Back</Button>
      </div>
    );
  }

  const selectedPlan = plans.find(p => p.id === selectedPlanId);
  const currentPlan = plans.find(p => p.id === subscription?.planId);

  const getTrialDaysLeft = () => {
    if (!subscription?.trialEndDate) return 0;
    const end = new Date(subscription.trialEndDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem', maxWidth: '1200px' }}>
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '0.5rem' }}>
          Subscription & Billing
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.125rem' }}>
          Manage your organization's plan, seats, and billing information.
        </p>
      </header>

      {successMessage && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ 
            backgroundColor: 'rgba(34, 197, 94, 0.1)', 
            color: '#16A34A', 
            padding: '1rem 1.5rem', 
            borderRadius: '0.75rem', 
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            border: '1px solid rgba(34, 197, 94, 0.2)'
          }}
        >
          <CheckCircle2 size={20} />
          <span style={{ fontWeight: 600 }}>{successMessage}</span>
        </motion.div>
      )}

      {/* Current Subscription Section */}
      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <CreditCard className="text-primary" size={24} />
          Current Plan
        </h2>

        <div className="card" style={{ padding: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', position: 'relative', overflow: 'hidden' }}>
          {/* Status Background Accent */}
          <div style={{ 
            position: 'absolute', 
            top: 0, 
            right: 0, 
            width: '150px', 
            height: '150px', 
            background: 'radial-gradient(circle at top right, rgba(var(--color-primary-rgb), 0.05), transparent)',
            pointerEvents: 'none'
          }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                padding: '0.75rem', 
                borderRadius: '1rem', 
                backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)', 
                color: 'var(--color-primary)' 
              }}>
                <Zap size={24} />
              </div>
              <div>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {subscription?.status}
                </span>
                <h3 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{subscription?.plan?.name || 'Loading...'}</h3>
              </div>
            </div>
            
            {subscription?.status === 'TRIAL' && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                fontSize: '0.875rem', 
                color: 'var(--color-warning)',
                backgroundColor: 'rgba(217, 119, 6, 0.1)',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                width: 'fit-content'
              }}>
                <Calendar size={16} />
                Trial ends in <strong>{getTrialDaysLeft()} days</strong>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>Seat Usage</span>
              <span style={{ fontWeight: 700 }}>{subscription?.usedSeats} / {subscription?.seats}</span>
            </div>
            <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--color-bg)', borderRadius: '4px', overflow: 'hidden' }}>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, ((subscription?.usedSeats || 0) / (subscription?.seats || 1)) * 100)}%` }}
                style={{ 
                  height: '100%', 
                  backgroundColor: (subscription?.usedSeats || 0) >= (subscription?.seats || 0) ? '#EF4444' : 'var(--color-primary)',
                  borderRadius: '4px'
                }} 
              />
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
              Each active user or pending invitation consumes one seat.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem' }}>
            <Button variant="outline" onClick={openSeatsModal} leftIcon={<Users size={18} />}>
              Manage Seats
            </Button>
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <TrendingUp className="text-primary" size={24} />
          Available Plans
        </h2>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '2rem' 
        }}>
          {plans.map((plan) => (
            <motion.div 
              key={plan.id}
              whileHover={{ y: -8 }}
              className="card"
              style={{ 
                padding: '2.5rem', 
                display: 'flex', 
                flexDirection: 'column',
                border: plan.id === subscription?.planId ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                position: 'relative'
              }}
            >
              {plan.id === subscription?.planId && (
                <div style={{ 
                  position: 'absolute', 
                  top: '-12px', 
                  left: '50%', 
                  transform: 'translateX(-50%)',
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                  padding: '2px 12px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  textTransform: 'uppercase'
                }}>
                  Current Plan
                </div>
              )}

              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>{plan.name}</h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 800 }}>${plan.priceMonthly}</span>
                <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>/month</span>
              </div>

              <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '1rem 0' }} />

              <div style={{ flex: 1, marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--color-text)', fontWeight: 700, fontSize: '0.875rem' }}>
                  <Users size={16} className="text-primary" />
                  Up to {plan.maxSeats} seats
                </div>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {Array.isArray(plan.features) && plan.features.map((feature, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.875rem' }}>
                      <div style={{ 
                        marginTop: '2px',
                        padding: '2px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)',
                        color: 'var(--color-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Check size={12} strokeWidth={4} />
                      </div>
                      <span style={{ color: 'var(--color-text)' }}>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button 
                variant={plan.id === subscription?.planId ? 'outline' : 'primary'}
                fullWidth
                disabled={plan.id === subscription?.planId}
                onClick={() => openUpdateModal(plan.id)}
              >
                {plan.id === subscription?.planId ? 'Currently Active' : 'Switch to Plan'}
              </Button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Change Seats Modal */}
      <Modal 
        isOpen={isSeatsModalOpen} 
        onClose={() => setIsSeatsModalOpen(false)}
        title="Manage Seats"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Each additional seat allows you to invite more team members. You can increase or decrease seats at any time.
          </p>
          
          <div style={{ backgroundColor: 'var(--color-bg)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ fontWeight: 600 }}>Current Usage</span>
              <span style={{ fontWeight: 700 }}>{subscription?.usedSeats} seats</span>
            </div>
            <Input 
              label="Total Seats"
              type="number"
              value={newSeats}
              onChange={(e) => setNewSeats(parseInt(e.target.value))}
              min={subscription?.usedSeats}
              max={currentPlan?.maxSeats}
              helperText={`Plan maximum: ${currentPlan?.maxSeats} seats`}
            />
          </div>

          {actionError && (
            <div style={{ color: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
              <AlertCircle size={16} /> {actionError}
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem' }}>
            <Button variant="outline" onClick={() => setIsSeatsModalOpen(false)} fullWidth>Cancel</Button>
            <Button onClick={handleUpdateSeats} isLoading={isProcessing} fullWidth>Update Seats</Button>
          </div>
        </div>
      </Modal>

      {/* Change Plan Modal */}
      <Modal 
        isOpen={isUpdateModalOpen} 
        onClose={() => setIsUpdateModalOpen(false)}
        title="Change Subscription Plan"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '1rem', 
              padding: '1rem 2rem', 
              backgroundColor: 'var(--color-bg)', 
              borderRadius: '1rem',
              border: '1px solid var(--color-border)'
            }}>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Current</span>
                <span style={{ fontWeight: 700 }}>{currentPlan?.name}</span>
              </div>
              <ChevronRight size={20} className="text-primary" />
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Target</span>
                <span style={{ fontWeight: 700 }}>{selectedPlan?.name}</span>
              </div>
            </div>
          </div>

          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            You are about to switch your subscription plan. Your billing will be adjusted starting from the next period. 
            If your target plan has fewer seats than your current usage, you will need to remove members first.
          </p>

          <div className="card" style={{ padding: '1rem', backgroundColor: 'rgba(var(--color-primary-rgb), 0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem' }}>New Monthly Price</span>
              <span style={{ fontWeight: 700 }}>${selectedPlan?.priceMonthly}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.875rem' }}>Max Seats</span>
              <span style={{ fontWeight: 700 }}>{selectedPlan?.maxSeats}</span>
            </div>
          </div>

          {actionError && (
            <div style={{ color: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
              <AlertCircle size={16} /> {actionError}
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem' }}>
            <Button variant="outline" onClick={() => setIsUpdateModalOpen(false)} fullWidth>Cancel</Button>
            <Button onClick={handleUpdatePlan} isLoading={isProcessing} fullWidth>Confirm Switch</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SubscriptionPage;
