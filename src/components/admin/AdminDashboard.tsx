import React, { useEffect, useState } from 'react';
import { adminService, type SystemMetrics } from '../../api/admin';
import { Users, Building, Activity, DollarSign, Loader2, Package, TrendingUp } from 'lucide-react';
import Badge from '../Badge';

const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setError(null);
      const { data } = await adminService.getSystemMetrics();
      setMetrics(data);
    } catch (err: any) {
      console.error('Failed to fetch admin metrics', err);
      setError(err?.response?.data?.message || 'Failed to load dashboard metrics.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Loader2 className="animate-spin" size={32} color="var(--primary)" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <div style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--danger)', marginBottom: '0.5rem' }}>
          Error Loading Dashboard
        </div>
        <div style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>{error}</div>
        <button
          onClick={fetchMetrics}
          className="btn btn-primary"
          style={{ padding: '0.5rem 1.5rem' }}
        >
          Retry
        </button>
      </div>
    );
  }

  const kpis = [
    { title: 'Total Organizations', value: metrics?.totalOrganizations || 0, icon: Building, color: '#3b82f6' },
    { title: 'Total Users', value: metrics?.totalUsers || 0, icon: Users, color: '#10b981' },
    { title: 'Active Subscriptions', value: metrics?.activeSubscriptions || 0, icon: Activity, color: '#8b5cf6' },
    { title: 'Est. Monthly Revenue', value: `$${(metrics?.mrr || 0).toLocaleString()}`, icon: DollarSign, color: '#f59e0b' },
    { title: 'Available Add-ons', value: metrics?.totalAddons || 0, icon: Package, color: '#ec4899' },
    { title: 'Active Add-on Subs', value: metrics?.activeAddonAssignments || 0, icon: TrendingUp, color: '#06b6d4' },
  ];

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem' }}>System Dashboard</h1>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        {kpis.map((kpi, idx) => (
          <div key={idx} style={{
            backgroundColor: 'var(--surface)',
            borderRadius: '0.75rem',
            padding: '1.25rem',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            transition: 'box-shadow 0.2s',
          }}>
            <div style={{ height: '44px', width: '44px', borderRadius: '0.75rem', backgroundColor: `${kpi.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <kpi.icon size={22} color={kpi.color} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>{kpi.title}</div>
              <div style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--foreground)' }}>{kpi.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Plan Distribution & Recent Orgs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Plan Distribution */}
        <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0.75rem', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.25rem', color: 'var(--foreground)' }}>Plan Distribution</h2>
          {metrics?.planDistribution && metrics.planDistribution.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {metrics.planDistribution.map((plan, idx) => {
                const maxCount = Math.max(...metrics.planDistribution.map((p) => p.count), 1);
                const pct = (plan.count / maxCount) * 100;
                return (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--foreground)' }}>{plan.name}</span>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>{plan.count} org{plan.count !== 1 ? 's' : ''}</span>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--primary)' }}>${plan.revenue.toLocaleString()}/mo</span>
                      </div>
                    </div>
                    <div style={{ height: '6px', borderRadius: '3px', backgroundColor: 'var(--bg-secondary)', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', borderRadius: '3px', backgroundColor: 'var(--primary)', transition: 'width 0.5s' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem 0' }}>
              No plans created yet.
            </div>
          )}
        </div>

        {/* Recent Organizations */}
        <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0.75rem', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.25rem', color: 'var(--foreground)' }}>Recent Organizations</h2>
          {metrics?.recentOrganizations && metrics.recentOrganizations.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {metrics.recentOrganizations.map((org: any) => (
                <div key={org.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.625rem 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--foreground)' }}>{org.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {org._count?.memberships || 0} users · {org.subscription?.plan?.name || 'No plan'}
                    </div>
                  </div>
                  <Badge variant={org.isSuspended ? 'danger' : 'success'} size="sm">
                    {org.isSuspended ? 'Suspended' : 'Active'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem 0' }}>
              No organizations yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
