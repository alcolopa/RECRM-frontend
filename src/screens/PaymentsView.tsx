import React, { useState, useEffect } from 'react';
import { 
  Banknote, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  User as UserIcon,
  ArrowUpRight,
  Calendar as CalendarIcon,
  Filter,
  Search,
  Wallet,
  PiggyBank,
  Layers
} from 'lucide-react';
import Button from '../components/Button';
import DateSelector from '../components/DateSelector';
import ConfirmModal from '../components/ConfirmModal';
import { payoutsService } from '../api/payouts';
import type { AdminPayoutStats, PersonalPayoutStats } from '../api/payouts';

interface PaymentsViewProps {
  organizationId: string;
  user: any;
}

type RangeType = 'daily' | 'weekly' | 'monthly' | 'custom';

const PaymentsView: React.FC<PaymentsViewProps> = ({ organizationId, user }) => {
  const isAdmin = user.role === 'OWNER' || user.role === 'ADMIN';
  const [adminStats, setAdminStats] = useState<AdminPayoutStats | null>(null);
  const [agentStats, setAgentStats] = useState<PersonalPayoutStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [rangeType, setRangeType] = useState<RangeType>('monthly');
  
  // Confirmation Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAgent, setPendingAgent] = useState<{ id: string; name: string; amount: number } | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const setPresetRange = (type: RangeType) => {
    if (type === 'custom') {
      setRangeType('custom');
      return;
    }

    const now = new Date();
    let start = new Date();
    let end = new Date();

    if (type === 'daily') {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else if (type === 'weekly') {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      start = new Date(now.setDate(diff));
      start.setHours(0, 0, 0, 0);
      end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
    } else if (type === 'monthly') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
    }

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
    setRangeType(type);
  };

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (isAdmin) {
        const response = await payoutsService.getAdminStats(organizationId, startDate, endDate);
        setAdminStats(response.data);
      } else {
        const response = await payoutsService.getAgentStats(organizationId, startDate, endDate);
        setAgentStats(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch payout data', err);
      setError('Could not load financial data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setPresetRange('monthly');
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchData();
    }
  }, [organizationId, startDate, endDate]);

  const handleConfirmPay = async () => {
    if (!pendingAgent) return;
    setIsProcessingPayment(true);
    try {
      await payoutsService.markAllPaid(pendingAgent.id, organizationId);
      await fetchData();
      setShowConfirmModal(false);
      setPendingAgent(null);
    } catch (err) {
      console.error('Failed to mark all as paid', err);
      alert('Failed to update payout status.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const StatCard = ({ title, value, icon: Icon, color, trend, footerText }: any) => (
    <div className="card" style={{ 
      padding: '1.5rem', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '1rem',
      backgroundColor: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      boxShadow: 'var(--shadow-sm)',
      transform: 'none',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</span>
        <div style={{ 
          padding: '0.625rem', 
          borderRadius: '10px', 
          backgroundColor: `${color}15`, 
          color: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Icon size={18} />
        </div>
      </div>
      <div>
        <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text)' }}>{value}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.5rem' }}>
          {trend !== undefined && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: trend >= 0 ? 'var(--color-success)' : 'var(--color-error)', fontSize: '0.8125rem', fontWeight: 600 }}>
              {trend >= 0 ? <TrendingUp size={14} /> : <ArrowUpRight size={14} style={{ transform: 'rotate(90deg)' }} />}
              {trend}% vs last month
            </div>
          )}
          {(!trend && footerText) && (
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>{footerText}</div>
          )}
        </div>
      </div>
    </div>
  );

  if (isLoading && !adminStats && !agentStats) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '400px' }}>
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="payments-view" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', maxWidth: '1400px', margin: '0 auto' }}>
      <header className="payments-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div style={{ minWidth: '300px' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--color-text)' }}>
            {isAdmin ? 'Payments & Payouts' : 'My Payouts'}
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.0625rem' }}>
            {isAdmin 
              ? 'Manage agent commissions and track company revenue' 
              : 'Track your sales performance and earned commissions'}
          </p>
        </div>
        
        <div className="payments-filters" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-end', flex: '1 1 auto' }}>
          <div className="view-toggle" style={{ display: 'flex', background: 'var(--color-bg)', padding: '0.375rem', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
            {(['daily', 'weekly', 'monthly'] as RangeType[]).map((type) => (
              <button
                key={type}
                onClick={() => setPresetRange(type)}
                className={`view-toggle-btn ${rangeType === type ? 'active' : ''}`}
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: rangeType === type ? 'var(--color-surface)' : 'transparent',
                  color: rangeType === type ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textTransform: 'capitalize',
                  boxShadow: rangeType === type ? 'var(--shadow-sm)' : 'none'
                }}
              >
                {type}
              </button>
            ))}
          </div>
          
          <div className="date-range-bar" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            backgroundColor: 'var(--color-surface)', 
            padding: '0.25rem 0.75rem', 
            borderRadius: '12px', 
            border: '1px solid var(--color-border)',
            cursor: 'pointer',
            width: '100%',
            maxWidth: '430px',
            minHeight: '44px'
          }}>
            <CalendarIcon size={18} color="var(--color-text-muted)" style={{ marginLeft: '0.25rem' }} />
            <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', flex: 1, justifyContent: 'center' }}>
              <div className="minimal-date-selector">
                <DateSelector 
                  value={startDate} 
                  onChange={(val) => { setStartDate(val || ''); setRangeType('custom'); }}
                  placeholder="Start"
                />
              </div>
              <span style={{ color: 'var(--color-text-muted)', fontWeight: 300, margin: '0 0.5rem' }}>—</span>
              <div className="minimal-date-selector">
                <DateSelector 
                  value={endDate} 
                  onChange={(val) => { setEndDate(val || ''); setRangeType('custom'); }}
                  placeholder="End"
                  align="right"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {error && (
        <div className="alert-error" style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-error)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid var(--color-error)' }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Admin View */}
      {isAdmin && adminStats && (
        <>
          <div className="grid grid-4">
            <StatCard 
              title="Total Sales" 
              value={formatCurrency(adminStats.summary.totalSales)} 
              icon={Wallet} 
              color="var(--color-primary)" 
              trend={0}
            />
            <StatCard 
              title="Total Commissions" 
              value={formatCurrency(adminStats.summary.totalCommissions)} 
              icon={Layers} 
              color="#A78BFA" 
              footerText="No activity yet"
            />
            <StatCard 
              title="Agent Payouts" 
              value={formatCurrency(adminStats.summary.agentPayouts)} 
              icon={ArrowUpRight} 
              color="#F472B6" 
              footerText="0 agents paid this period"
            />
            <StatCard 
              title="Net Profit" 
              value={formatCurrency(adminStats.summary.totalProfit)} 
              icon={PiggyBank} 
              color="#60A5FA" 
            />
          </div>

          <div className="card" style={{ 
            padding: '2rem', 
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '16px',
            transform: 'none',
            boxShadow: 'var(--shadow)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text)' }}>Agent Commission Status</h3>
              <Button variant="outline" size="sm">
                <Filter size={16} style={{ marginRight: '0.5rem' }} /> Filter Table
              </Button>
            </div>

            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Agent</th>
                    <th>Total Sales</th>
                    <th>Paid Payouts</th>
                    <th>Needed Payment</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {adminStats.agents.map((agent) => (
                    <tr key={agent.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <UserIcon size={18} color="var(--color-text-muted)" />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>{agent.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{agent.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ color: 'var(--color-text)' }}>{formatCurrency(agent.totalSales)}</td>
                      <td style={{ color: 'var(--color-text)' }}>{formatCurrency(agent.paidPayout)}</td>
                      <td style={{ fontWeight: 700, color: agent.pendingPayout > 0 ? 'var(--color-warning)' : 'var(--color-success)' }}>
                        {formatCurrency(agent.pendingPayout)}
                      </td>
                      <td>
                        <div className={`badge ${agent.pendingPayout > 0 ? 'badge-warning' : 'badge-success'}`} style={{ 
                          backgroundColor: agent.pendingPayout > 0 ? 'rgba(var(--color-warning-rgb, 180, 83, 9), 0.1)' : 'rgba(var(--color-success-rgb, 21, 128, 61), 0.1)',
                          color: agent.pendingPayout > 0 ? 'var(--color-warning)' : 'var(--color-success)'
                        }}>
                          {agent.pendingPayout > 0 ? 'Pending Payout' : 'All Paid'}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          disabled={agent.pendingPayout === 0}
                          onClick={() => {
                            setPendingAgent({ id: agent.id, name: agent.name, amount: agent.pendingPayout });
                            setShowConfirmModal(true);
                          }}
                        >
                          Mark as Paid
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {adminStats.agents.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                          <div style={{ padding: '1.5rem', borderRadius: '20px', backgroundColor: 'var(--color-bg)', color: 'var(--color-text-muted)' }}>
                            <Search size={48} />
                          </div>
                          <div>
                            <h4 style={{ color: 'var(--color-text)', fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>No data found</h4>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem' }}>No agents with sales found in this period.</p>
                          </div>
                          <Button variant="outline" onClick={() => setPresetRange('monthly')}>
                            Try another date range
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Agent View */}
      {!isAdmin && agentStats && (
        <>
          <div className="grid grid-4">
            <StatCard 
              title="My Sales" 
              value={formatCurrency(agentStats.totalSales)} 
              icon={Wallet} 
              color="var(--color-primary)" 
              trend={0}
            />
            <StatCard 
              title="Total Earned" 
              value={formatCurrency(agentStats.totalEarned)} 
              icon={Layers} 
              color="#A78BFA" 
            />
            <StatCard 
              title="Pending Payout" 
              value={formatCurrency(agentStats.pendingPayout)} 
              icon={Clock} 
              color="var(--color-warning)" 
            />
            <StatCard 
              title="Total Paid" 
              value={formatCurrency(agentStats.totalPaid)} 
              icon={CheckCircle2} 
              color="var(--color-success)" 
            />
          </div>

          <div className="card" style={{ 
            padding: '2rem', 
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '16px',
            transform: 'none',
            boxShadow: 'var(--shadow)'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '2rem' }}>Sales History & Commissions</h3>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Deal Title</th>
                    <th>Deal Value</th>
                    <th>My Commission</th>
                    <th>Date Closed</th>
                    <th style={{ textAlign: 'right' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {agentStats.deals.map((deal) => (
                    <tr key={deal.id}>
                      <td style={{ fontWeight: 600, color: 'var(--color-text)' }}>{deal.title}</td>
                      <td>{formatCurrency(deal.value)}</td>
                      <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{formatCurrency(deal.agentCommission)}</td>
                      <td style={{ color: 'var(--color-text-muted)' }}>{new Date(deal.createdAt).toLocaleDateString()}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div className={`badge ${deal.isPaid ? 'badge-success' : 'badge-warning'}`} style={{ 
                          backgroundColor: deal.isPaid ? 'rgba(var(--color-success-rgb, 21, 128, 61), 0.1)' : 'rgba(var(--color-warning-rgb, 180, 83, 9), 0.1)',
                          color: deal.isPaid ? 'var(--color-success)' : 'var(--color-warning)'
                        }}>
                          {deal.isPaid ? `Paid` : 'Pending'}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {agentStats.deals.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                          <Search size={40} color="var(--color-text-muted)" opacity={0.2} />
                          <p style={{ color: 'var(--color-text-muted)' }}>You haven't closed any deals in this period yet.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <ConfirmModal 
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmPay}
        title="Confirm Payout"
        message={`Are you sure you want to mark ${formatCurrency(pendingAgent?.amount || 0)} as paid for ${pendingAgent?.name}? This will reset their pending balance.`}
        confirmLabel="Confirm Payment"
        variant="primary"
        isLoading={isProcessingPayment}
      />

      <style>{`
        .minimal-date-selector > div > div:first-child {
          border: none !important;
          background: transparent !important;
          padding: 0.5rem !important;
          min-height: unset !important;
          box-shadow: none !important;
        }
        .minimal-date-selector svg {
          display: none !important;
        }
        .minimal-date-selector .lucide-x {
          display: block !important;
          width: 14px;
          height: 14px;
        }
        @media (max-width: 768px) {
          .payments-header {
            flex-direction: column;
            align-items: flex-start !important;
          }
          .payments-filters {
            width: 100%;
            align-items: flex-start !important;
          }
          .date-range-bar {
            max-width: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PaymentsView;
