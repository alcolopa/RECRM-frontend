import React from 'react';
import { Clock, CheckCircle2 } from 'lucide-react';
import type { PersonalPayoutStats } from '../api/payouts';

import { formatCurrency } from '../utils/currency';

interface AgentPaymentsViewProps {
  stats: PersonalPayoutStats;
}

const AgentPaymentsView: React.FC<AgentPaymentsViewProps> = ({ stats }) => {
  return (
    <div className="agent-payments-view" style={{ display: 'flex', flexDirection: 'column', gap: '4rem', paddingBottom: '3rem' }}>
      {/* Editorial Header - Large Metrics */}
      <section style={{ padding: '1rem 0', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Performance Overview
          </span>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>
            Your Earnings
          </h2>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4rem' }}>
          <div style={{ flex: '1 1 300px' }}>
            <span style={{ fontSize: '1rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem', display: 'block' }}>Total Sales Volume</span>
            <div style={{ fontSize: '4.5rem', fontWeight: 900, color: 'var(--color-text)', fontFamily: 'var(--font-display)', lineHeight: 1, letterSpacing: '-0.02em' }}>
              {formatCurrency(stats.totalSales)}
            </div>
          </div>
          
          <div className="commission-stat" style={{ flex: '1 1 300px', borderLeft: '1px solid var(--color-border)', paddingLeft: '4rem' }}>
            <span style={{ fontSize: '1rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem', display: 'block' }}>Total Commission</span>
            <div style={{ fontSize: '4.5rem', fontWeight: 900, color: 'var(--color-primary)', fontFamily: 'var(--font-display)', lineHeight: 1, letterSpacing: '-0.02em' }}>
              {formatCurrency(stats.totalEarned)}
            </div>
          </div>
        </div>
      </section>

      {/* Tonal Transition Section for Status */}
      <div style={{ 
        background: 'var(--color-bg-hover)', 
        margin: '0 -2rem', 
        padding: '3rem 2rem',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '3rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ padding: '0.875rem', borderRadius: '14px', background: 'var(--color-surface)', color: 'var(--color-warning)', boxShadow: 'var(--shadow-sm)' }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Pending Payout</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text)' }}>{formatCurrency(stats.pendingPayout)}</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ padding: '0.875rem', borderRadius: '14px', background: 'var(--color-surface)', color: 'var(--color-success)', boxShadow: 'var(--shadow-sm)' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Paid to Date</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text)' }}>{formatCurrency(stats.totalPaid)}</div>
          </div>
        </div>
      </div>

      {/* Transaction List - Clean Inter Typography */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text)' }}>Recent Transactions</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {stats.deals.map((deal) => (
            <div key={deal.id} style={{ 
              background: 'var(--color-surface)', 
              padding: '1.75rem 0', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              borderBottom: '1px solid var(--color-border)'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div style={{ fontWeight: 600, fontSize: '1.125rem', color: 'var(--color-text)' }}>{deal.title}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                  {new Date(deal.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--color-text)', marginBottom: '0.25rem' }}>
                  {formatCurrency(deal.agentCommission)}
                </div>
                <div style={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  fontSize: '0.75rem', 
                  fontWeight: 700, 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.05em',
                  color: deal.isPaid ? 'var(--color-success)' : 'var(--color-warning)',
                }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: deal.isPaid ? 'var(--color-success)' : 'var(--color-warning)' }} />
                  {deal.isPaid ? 'Paid' : 'Pending'}
                </div>
              </div>
            </div>
          ))}
          {stats.deals.length === 0 && (
            <div style={{ background: 'var(--color-surface)', padding: '5rem', textAlign: 'center', color: 'var(--color-text-muted)', borderRadius: '16px', border: '1px dashed var(--color-border)' }}>
              No transactions found in this period.
            </div>
          )}
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .agent-payments-view h2 { font-size: 2rem !important; }
          .agent-payments-view div[style*="font-size: 4.5rem"] { font-size: 2.75rem !important; }
          .agent-payments-view .commission-stat { padding-left: 0 !important; border-left: none !important; border-top: 1px solid var(--color-border) !important; padding-top: 2rem !important; }
          .agent-payments-view section { gap: 2rem !important; }
          .agent-payments-view { gap: 3rem !important; }
        }
      `}</style>
    </div>
  );
};

export default AgentPaymentsView;
