import React, { useState, useEffect, forwardRef } from 'react';
import { 
  Users, 
  Building2, 
  HandCoins, 
  Clock, 
  Loader2,
  AlertCircle,
  Plus,
  Target,
  Trash2,
  Settings,
  GripHorizontal
} from 'lucide-react';
import { dashboardService, type DashboardStat, type RecentLead, type UpcomingTask, type RecentActivity, type PipelineData } from '../api/dashboard';
import Button from '../components/Button';
import { type UserProfile } from '../api/users';
import { useNavigation } from '../contexts/NavigationContext';
import { Responsive, WidthProvider } from 'react-grid-layout/legacy';
import { formatCurrency } from '../utils/currency';

// Direct imports for standard CSS
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardProps {
  organizationId: string;
  user: UserProfile;
}

const DEFAULT_LAYOUTS = {
  lg: [
    { i: 'stats', x: 0, y: 0, w: 12, h: 4 },
    { i: 'pipeline', x: 0, y: 4, w: 8, h: 10 },
    { i: 'tasks', x: 8, y: 4, w: 4, h: 10 },
    { i: 'leads', x: 0, y: 14, w: 6, h: 10 },
    { i: 'activity', x: 6, y: 14, w: 6, h: 10 },
  ],
  md: [
    { i: 'stats', x: 0, y: 0, w: 10, h: 4 },
    { i: 'pipeline', x: 0, y: 4, w: 10, h: 8 },
    { i: 'tasks', x: 0, y: 12, w: 10, h: 8 },
    { i: 'leads', x: 0, y: 20, w: 10, h: 8 },
    { i: 'activity', x: 0, y: 28, w: 10, h: 8 },
  ]
};

// Crucial: WidgetWrapper must spread props (style, className) from RGL
const WidgetWrapper = forwardRef<HTMLDivElement, { children: React.ReactNode, id: string, isEditMode: boolean } & any>((
  { children, isEditMode, style, className, onMouseDown, onMouseUp, onTouchEnd, ...props }, ref
) => {
  return (
    <div
      ref={ref}
      style={{ ...style, height: '100%' }}
      className={`${className} ${isEditMode ? 'widget-edit-mode' : ''}`}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onTouchEnd={onTouchEnd}
      {...props}
    >
      <div style={{ height: '100%', position: 'relative', display: 'flex', flexDirection: 'column' }}>
        {isEditMode && (
          <div className="drag-handle" style={{
            position: 'absolute',
            top: '0.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            cursor: 'grab',
            padding: '4px',
            backgroundColor: 'var(--color-bg)',
            borderRadius: '4px',
            border: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <GripHorizontal size={16} color="var(--color-text-muted)" />
          </div>
        )}
        <div style={{ flex: 1, height: '100%' }}>
          {children}
        </div>
      </div>
    </div>
  );
});

const Dashboard: React.FC<DashboardProps> = ({ organizationId, user }) => {
  const { navigate } = useNavigation();
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [recentLeads, setRecentLeads] = useState<RecentLead[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<UpcomingTask[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [pipelineData, setPipelineData] = useState<PipelineData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [layouts, setLayouts] = useState<any>(() => {
    const saved = localStorage.getItem(`dashboard-layout-${user.id}`);
    return saved ? JSON.parse(saved) : DEFAULT_LAYOUTS;
  });

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [statsRes, leadsRes, tasksRes, activitiesRes, pipelineRes] = await Promise.all([
        dashboardService.getStats(organizationId),
        dashboardService.getRecentLeads(organizationId),
        dashboardService.getUpcomingTasks(organizationId),
        dashboardService.getRecentActivities(organizationId),
        dashboardService.getPipeline(organizationId),
      ]);

      setStats(statsRes.data);
      setRecentLeads(leadsRes.data);
      setUpcomingTasks(tasksRes.data);
      setRecentActivities(activitiesRes.data);
      setPipelineData(pipelineRes.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [organizationId]);

  const handleLayoutChange = (_currentLayout: any, allLayouts: any) => {
    setLayouts(allLayouts);
  };

  const saveLayout = () => {
    localStorage.setItem(`dashboard-layout-${user.id}`, JSON.stringify(layouts));
    setIsEditMode(false);
  };

  const resetLayout = () => {
    setLayouts(DEFAULT_LAYOUTS);
    localStorage.removeItem(`dashboard-layout-${user.id}`);
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Loader2 size={40} className="animate-spin" color="var(--color-primary)" />
      </div>
    );
  }

  const renderStatsWidget = () => (
    <div className="grid grid-2 grid-4" style={{ gap: '1rem', height: '100%' }}>
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="card"
          style={{ padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
            <div style={{ 
              padding: '0.5rem', 
              borderRadius: '0.5rem', 
              backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)',
              color: 'var(--color-primary)'
            }}>
              {stat.label === 'Total Revenue' ? <HandCoins size={18} /> : 
               stat.label === 'Active Properties' ? <Building2 size={18} /> :
               stat.label === 'New Leads' ? <Users size={18} /> : <Target size={18} />}
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              color: stat.trend === 'up' ? 'var(--color-success)' : 'var(--color-error)',
              fontSize: '0.7rem',
              fontWeight: 700,
              backgroundColor: stat.trend === 'up' ? 'rgba(22, 163, 74, 0.1)' : 'rgba(220, 38, 38, 0.1)',
              padding: '0.125rem 0.375rem',
              borderRadius: '2rem'
            }}>
              {stat.change}
            </div>
          </div>
          <h3 style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>{stat.label}</h3>
          <p style={{ fontSize: '1.25rem', fontWeight: 800 }}>{stat.value}</p>
        </div>
      ))}
    </div>
  );

  const renderPipelineWidget = () => (
    <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Deal Pipeline</h3>
        <Button variant="ghost" size="sm" onClick={() => navigate('deals')}>View All</Button>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
        {pipelineData.map((stage) => {
          const maxValue = Math.max(...pipelineData.map(d => d.value), 1);
          const percentage = (stage.value / maxValue) * 100;
          
          return (
            <div key={stage.stage} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600 }}>
                <span>{stage.stage} <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>({stage.count})</span></span>
                <span>{formatCurrency(stage.value, 'USD', { maximumFractionDigits: 0 })}</span>
              </div>
              <div style={{ height: '0.5rem', backgroundColor: 'var(--color-bg)', borderRadius: '1rem', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  width: `${Math.max(percentage, 2)}%`, 
                  backgroundColor: stage.stage === 'Closed Won' ? 'var(--color-success)' : 
                                  stage.stage === 'Closed Lost' ? 'var(--color-error)' : 'var(--color-primary)',
                  borderRadius: '1rem',
                  transition: 'width 0.5s ease-out'
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderTasksWidget = () => (
    <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Upcoming Tasks</h3>
        <Button variant="ghost" size="sm" onClick={() => navigate('tasks')}>View All</Button>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto' }}>
        {upcomingTasks.map((task, idx) => (
          <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '0.75rem', borderRadius: '0.75rem', backgroundColor: 'var(--color-bg)' }}>
            <div style={{ 
              width: '2rem', height: '2rem', borderRadius: '50%', 
              backgroundColor: task.isToday ? 'rgba(var(--color-primary-rgb), 0.1)' : 'var(--color-surface)',
              color: task.isToday ? 'var(--color-primary)' : 'var(--color-text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <Clock size={16} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '0.8125rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.title}</p>
              <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{task.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderLeadsWidget = () => (
    <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Recent Leads</h3>
        <Button variant="ghost" size="sm" onClick={() => navigate('leads')}>View All</Button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Lead</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentLeads.map((lead, idx) => (
              <tr key={idx}>
                <td>
                  <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{lead.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{lead.email}</div>
                </td>
                <td>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.125rem 0.375rem', borderRadius: '2rem', backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)', color: 'var(--color-primary)' }}>
                    {lead.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderActivityWidget = () => (
    <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Recent Activity</h3>
        <Button variant="ghost" size="sm">Refresh</Button>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
        {recentActivities.map((activity) => (
          <div key={activity.id} style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{ width: '1.75rem', height: '1.75rem', borderRadius: '50%', backgroundColor: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Clock size={12} color="var(--color-text-muted)" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '0.8125rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{activity.subject}</p>
              <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.25rem' }}>Welcome back, {user.firstName}!</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Here's what's happening with your properties and leads today.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {isEditMode ? (
            <>
              <Button variant="outline" onClick={resetLayout} leftIcon={<Trash2 size={18} />}>Reset</Button>
              <Button variant="primary" onClick={saveLayout} leftIcon={<Check size={18} />}>Save Layout</Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => setIsEditMode(true)} leftIcon={<Settings size={18} />}>Customize</Button>
          )}
          <Button onClick={() => navigate('properties', { context: 'add' })} leftIcon={<Plus size={20} />}>New Listing</Button>
        </div>
      </header>

      {error && (
        <div style={{ padding: '1rem', backgroundColor: 'rgba(220, 38, 38, 0.1)', color: 'var(--color-error)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      <div style={{ minHeight: '800px' }}>
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={30}
          onLayoutChange={handleLayoutChange}
          isDraggable={isEditMode}
          isResizable={isEditMode}
          draggableHandle=".drag-handle"
          margin={[20, 20]}
        >
          <div key="stats">
            <WidgetWrapper id="stats" isEditMode={isEditMode}>
              {renderStatsWidget()}
            </WidgetWrapper>
          </div>
          <div key="pipeline">
            <WidgetWrapper id="pipeline" isEditMode={isEditMode}>
              {renderPipelineWidget()}
            </WidgetWrapper>
          </div>
          <div key="tasks">
            <WidgetWrapper id="tasks" isEditMode={isEditMode}>
              {renderTasksWidget()}
            </WidgetWrapper>
          </div>
          <div key="leads">
            <WidgetWrapper id="leads" isEditMode={isEditMode}>
              {renderLeadsWidget()}
            </WidgetWrapper>
          </div>
          <div key="activity">
            <WidgetWrapper id="activity" isEditMode={isEditMode}>
              {renderActivityWidget()}
            </WidgetWrapper>
          </div>
        </ResponsiveGridLayout>
      </div>
    </div>
  );
};

const Check = ({ size, color }: { size?: number, color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

export default Dashboard;
