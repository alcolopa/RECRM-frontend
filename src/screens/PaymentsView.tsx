import React, { useState, useEffect, useMemo } from 'react';
import {
  Banknote,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  User as UserIcon,
  ArrowUpRight,
  Calendar as CalendarIcon,
  Search,
  Wallet,
  PiggyBank,
  Layers,
  ChevronRight,
  ArrowLeft,
  CheckSquare,
  Square,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/Button';
import DateSelector from '../components/DateSelector';
import ConfirmModal from '../components/ConfirmModal';
import { payoutsService } from '../api/payouts';
import type { AdminPayoutStats, PersonalPayoutStats, AgentPayoutStats } from '../api/payouts';
import AgentPaymentsView from '../components/AgentPaymentsView';
import { usePermissions } from '../hooks/usePermissions';
import { Permission } from '../api/users';

interface PaymentsViewProps {
  organizationId: string;
  user: any;
}

type RangeType = 'daily' | 'weekly' | 'monthly' | 'custom';

const PaymentsView: React.FC<PaymentsViewProps> = ({ organizationId, user: _user }) => {
  const { hasPermission, isPrivileged } = usePermissions();
  const isAdmin = isPrivileged || hasPermission(Permission.PAYOUTS_VIEW_ALL);
  const [adminStats, setAdminStats] = useState<AdminPayoutStats | null>(null);
  const [agentStats, setAgentStats] = useState<PersonalPayoutStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [rangeType, setRangeType] = useState<RangeType>('monthly');

  // Agent drill-down state
  const [expandedAgentId, setExpandedAgentId] = useState<string | null>(null);
  const [selectedDealIds, setSelectedDealIds] = useState<Set<string>>(new Set());
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Confirmation Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ type: 'selected' | 'all'; agentId?: string; agentName?: string; amount: number } | null>(null);

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

  // Selection helpers
  const expandedAgent = useMemo(() => {
    if (!expandedAgentId || !adminStats) return null;
    return adminStats.agents.find(a => a.id === expandedAgentId) || null;
  }, [expandedAgentId, adminStats]);

  const unpaidDeals = useMemo(() => {
    if (!expandedAgent) return [];
    return expandedAgent.deals.filter(d => !d.isPaid);
  }, [expandedAgent]);

  const selectedAmount = useMemo(() => {
    if (!expandedAgent) return 0;
    return expandedAgent.deals
      .filter(d => selectedDealIds.has(d.id))
      .reduce((sum, d) => sum + (Number(d.agentCommission) || 0), 0);
  }, [selectedDealIds, expandedAgent]);

  const selectedCount = selectedDealIds.size;

  const toggleDealSelection = (dealId: string) => {
    setSelectedDealIds(prev => {
      const next = new Set(prev);
      if (next.has(dealId)) {
        next.delete(dealId);
      } else {
        next.add(dealId);
      }
      return next;
    });
  };

  const toggleSelectAllUnpaid = () => {
    if (selectedDealIds.size === unpaidDeals.length && unpaidDeals.length > 0) {
      setSelectedDealIds(new Set());
    } else {
      setSelectedDealIds(new Set(unpaidDeals.map(d => d.id)));
    }
  };

  const handleMarkSelectedPaid = () => {
    if (selectedCount === 0) return;
    setConfirmAction({ type: 'selected', amount: selectedAmount });
    setShowConfirmModal(true);
  };

  const handleMarkAllPaid = (agent: AgentPayoutStats) => {
    setConfirmAction({ type: 'all', agentId: agent.id, agentName: agent.name, amount: agent.pendingPayout });
    setShowConfirmModal(true);
  };

  const handleConfirmPay = async () => {
    if (!confirmAction) return;
    setIsProcessingPayment(true);
    try {
      if (confirmAction.type === 'selected') {
        await payoutsService.markSelectedPaid(Array.from(selectedDealIds), organizationId);
        setSelectedDealIds(new Set());
      } else if (confirmAction.type === 'all' && confirmAction.agentId) {
        await payoutsService.markAllPaid(confirmAction.agentId, organizationId);
      }
      await fetchData();
      setShowConfirmModal(false);
      setConfirmAction(null);
    } catch (err) {
      console.error('Failed to mark as paid', err);
      alert('Failed to update payout status.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleAgentClick = (agentId: string) => {
    setExpandedAgentId(agentId);
    setSelectedDealIds(new Set());
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

  // =================== Agent Drill-down View ===================
  const renderAgentDrillDown = () => {
    if (!expandedAgent) return null;

    const allDeals = expandedAgent.deals;
    const paidDeals = allDeals.filter(d => d.isPaid);
    const pendingDeals = allDeals.filter(d => !d.isPaid);
    const allUnpaidSelected = pendingDeals.length > 0 && selectedDealIds.size === pendingDeals.length;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Back button + agent header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => { setExpandedAgentId(null); setSelectedDealIds(new Set()); }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '40px', height: '40px', borderRadius: '12px',
              border: '1px solid var(--color-border)', background: 'var(--color-surface)',
              cursor: 'pointer', color: 'var(--color-text-muted)',
              transition: 'all 0.15s ease'
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
              {expandedAgent.name}
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: 0 }}>
              {expandedAgent.email} · {allDeals.length} transactions
            </p>
          </div>
        </div>

        {/* Agent summary cards */}
        <div className="grid grid-3">
          <StatCard
            title="Total Sales"
            value={formatCurrency(expandedAgent.totalSales)}
            icon={Wallet}
            color="var(--color-primary)"
          />
          <StatCard
            title="Pending Payout"
            value={formatCurrency(expandedAgent.pendingPayout)}
            icon={Clock}
            color="var(--color-warning)"
            footerText={`${pendingDeals.length} deal${pendingDeals.length !== 1 ? 's' : ''} unpaid`}
          />
          <StatCard
            title="Paid Out"
            value={formatCurrency(expandedAgent.paidPayout)}
            icon={CheckCircle2}
            color="var(--color-success)"
            footerText={`${paidDeals.length} deal${paidDeals.length !== 1 ? 's' : ''} paid`}
          />
        </div>

        {/* Selection summary bar */}
        <AnimatePresence>
          {selectedCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '1rem 1.5rem', borderRadius: '14px',
                background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.08), rgba(5, 150, 105, 0.15))',
                border: '1px solid rgba(5, 150, 105, 0.25)',
                flexWrap: 'wrap', gap: '1rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '12px',
                  backgroundColor: 'var(--color-primary)', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: '1rem'
                }}>
                  {selectedCount}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: '0.9375rem' }}>
                    {selectedCount} deal{selectedCount !== 1 ? 's' : ''} selected
                  </div>
                  <div style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: '1.25rem' }}>
                    {formatCurrency(selectedAmount)}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Button variant="outline" size="sm" onClick={() => setSelectedDealIds(new Set())}>
                  Clear
                </Button>
                <Button size="sm" onClick={handleMarkSelectedPaid}>
                  <Banknote size={16} style={{ marginRight: '0.375rem' }} />
                  Mark Selected as Paid
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Deals table */}
        <div className="card" style={{
          padding: '0', overflow: 'hidden',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '16px',
          transform: 'none',
          boxShadow: 'var(--shadow)'
        }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>Transactions</h3>
            {pendingDeals.length > 0 && (
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <button
                  onClick={toggleSelectAllUnpaid}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    border: 'none', background: 'none', cursor: 'pointer',
                    fontSize: '0.8125rem', fontWeight: 600,
                    color: allUnpaidSelected ? 'var(--color-primary)' : 'var(--color-text-muted)',
                    padding: '0.375rem 0.75rem', borderRadius: '8px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {allUnpaidSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                  Select all unpaid
                </button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={expandedAgent.pendingPayout === 0}
                  onClick={() => handleMarkAllPaid(expandedAgent)}
                >
                  Mark All Paid
                </Button>
              </div>
            )}
          </div>
          <div className="table-responsive">
            <table className="table" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th style={{ width: '48px', paddingLeft: '1.5rem' }}></th>
                  <th>Deal</th>
                  <th>Deal Value</th>
                  <th>Commission</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'right', paddingRight: '1.5rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {allDeals.map((deal) => {
                  const isSelected = selectedDealIds.has(deal.id);
                  return (
                    <tr
                      key={deal.id}
                      onClick={() => !deal.isPaid && toggleDealSelection(deal.id)}
                      style={{
                        cursor: deal.isPaid ? 'default' : 'pointer',
                        backgroundColor: isSelected ? 'rgba(5, 150, 105, 0.04)' : 'transparent',
                        transition: 'background-color 0.15s ease'
                      }}
                    >
                      <td style={{ paddingLeft: '1.5rem' }}>
                        {!deal.isPaid && (
                          <div style={{
                            width: '20px', height: '20px', borderRadius: '6px',
                            border: isSelected ? '2px solid var(--color-primary)' : '2px solid var(--color-border)',
                            backgroundColor: isSelected ? 'var(--color-primary)' : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.15s ease',
                            flexShrink: 0
                          }}>
                            {isSelected && (
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <path d="M3 6L5.5 8.5L9 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </div>
                        )}
                        {deal.isPaid && (
                          <CheckCircle2 size={18} color="var(--color-success)" style={{ opacity: 0.5 }} />
                        )}
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--color-text)' }}>{deal.title}</td>
                      <td>{formatCurrency(Number(deal.value))}</td>
                      <td style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{formatCurrency(Number(deal.agentCommission))}</td>
                      <td style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>{new Date(deal.createdAt).toLocaleDateString()}</td>
                      <td style={{ textAlign: 'right', paddingRight: '1.5rem' }}>
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                          padding: '0.25rem 0.75rem', borderRadius: '999px',
                          fontSize: '0.75rem', fontWeight: 700,
                          backgroundColor: deal.isPaid ? 'rgba(22, 163, 74, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                          color: deal.isPaid ? 'var(--color-success)' : 'var(--color-warning)',
                        }}>
                          {deal.isPaid ? (
                            <><CheckCircle2 size={12} /> Paid{deal.paidAt ? ` · ${new Date(deal.paidAt).toLocaleDateString()}` : ''}</>
                          ) : (
                            <><Clock size={12} /> Pending</>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {allDeals.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '4rem' }}>
                      <p style={{ color: 'var(--color-text-muted)' }}>No transactions found for this period.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

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
          {/* When drilling down into an agent */}
          {expandedAgentId ? (
            renderAgentDrillDown()
          ) : (
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
                        <tr
                          key={agent.id}
                          onClick={() => handleAgentClick(agent.id)}
                          style={{ cursor: 'pointer', transition: 'background-color 0.15s ease' }}
                        >
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <UserIcon size={18} color="var(--color-text-muted)" />
                              </div>
                              <div>
                                <div style={{ fontWeight: 600, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                  {agent.name}
                                  <ChevronRight size={14} color="var(--color-text-muted)" />
                                </div>
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
                            <div style={{
                              display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                              padding: '0.25rem 0.75rem', borderRadius: '999px',
                              fontSize: '0.75rem', fontWeight: 700,
                              backgroundColor: agent.pendingPayout > 0 ? 'rgba(234, 179, 8, 0.1)' : 'rgba(22, 163, 74, 0.1)',
                              color: agent.pendingPayout > 0 ? 'var(--color-warning)' : 'var(--color-success)'
                            }}>
                              {agent.pendingPayout > 0 ? 'Pending Payout' : 'All Paid'}
                            </div>
                          </td>
                          <td style={{ textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={agent.pendingPayout === 0}
                              onClick={() => handleMarkAllPaid(agent)}
                            >
                              Mark All Paid
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
        </>
      )}

      {/* Agent View */}
      {!isAdmin && agentStats && (
        <AgentPaymentsView stats={agentStats} formatCurrency={formatCurrency} />
      )}

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmPay}
        title="Confirm Payout"
        message={
          confirmAction?.type === 'selected'
            ? `Mark ${selectedCount} selected deal${selectedCount !== 1 ? 's' : ''} totaling ${formatCurrency(confirmAction.amount)} as paid?`
            : `Mark all pending transactions (${formatCurrency(confirmAction?.amount || 0)}) as paid for ${confirmAction?.agentName}?`
        }
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
