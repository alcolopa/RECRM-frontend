import { useState, useEffect } from 'react';
import { 
  Users, 
  Building2, 
  HandCoins, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  ChevronRight, 
  Loader2,
  AlertCircle,
  Plus,
  Target,
  User,
  Trash2,
  Settings
} from 'lucide-react';
import { motion } from 'framer-motion';
import { dashboardService, type DashboardStat, type RecentLead, type UpcomingTask, type RecentActivity } from '../api/dashboard';
import Button from '../components/Button';
import { type UserProfile } from '../api/users';
import { useNavigation } from '../contexts/NavigationContext';
import { Responsive, WidthProvider } from 'react-grid-layout/legacy';
import '/node_modules/react-grid-layout/css/styles.css';
import '/node_modules/react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardProps {
  organizationId: string;
  user: UserProfile;
}

const DEFAULT_LAYOUTS = {
  lg: [
    { i: 'stats', x: 0, y: 0, w: 12, h: 4, static: false },
    { i: 'pipeline', x: 0, y: 4, w: 8, h: 10, static: false },
    { i: 'tasks', x: 8, y: 4, w: 4, h: 10, static: false },
    { i: 'leads', x: 0, y: 14, w: 6, h: 10, static: false },
    { i: 'activity', x: 6, y: 14, w: 6, h: 10, static: false },
  ],
  md: [
    { i: 'stats', x: 0, y: 0, w: 10, h: 4 },
    { i: 'pipeline', x: 0, y: 4, w: 10, h: 8 },
    { i: 'tasks', x: 0, y: 12, w: 10, h: 8 },
    { i: 'leads', x: 0, y: 20, w: 10, h: 8 },
    { i: 'activity', x: 0, y: 28, w: 10, h: 8 },
  ]
};

const Dashboard: React.FC<DashboardProps> = ({ organizationId, user }) => {
  const { navigate } = useNavigation();
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [recentLeads, setRecentLeads] = useState<RecentLead[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<UpcomingTask[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
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
      const [statsRes, leadsRes, tasksRes, activitiesRes] = await Promise.all([
        dashboardService.getStats(organizationId),
        dashboardService.getRecentLeads(organizationId),
        dashboardService.getUpcomingTasks(organizationId),
        dashboardService.getRecentActivities(organizationId),
      ]);

      setStats(statsRes.data);
      setRecentLeads(leadsRes.data);
      setUpcomingTasks(tasksRes.data);
      setRecentActivities(activitiesRes.data);
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
    if (isEditMode) {
      setLayouts(allLayouts);
    }
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

  const renderStats = () => (
    <div key="stats" className={isEditMode ? "widget-edit-wrapper" : ""}>
      <div className="grid grid-2 grid-4" style={{ gap: '1.5rem', height: '100%' }}>
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="card"
            style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ 
                padding: '0.75rem', 
                borderRadius: '0.75rem', 
                backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)',
                color: 'var(--color-primary)'
              }}>
                {stat.label === 'Total Revenue' ? <HandCoins size={24} /> : 
                 stat.label === 'Active Properties' ? <Building2 size={24} /> :
                 stat.label === 'New Leads' ? <Users size={24} /> : <Target size={24} />}
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.25rem',
                color: stat.trend === 'up' ? 'var(--color-success)' : 'var(--color-error)',
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: stat.trend === 'up' ? 'rgba(22, 163, 74, 0.1)' : 'rgba(220, 38, 38, 0.1)',
                padding: '0.25rem 0.5rem',
                borderRadius: '2rem'
              }}>
                {stat.trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {stat.change}
              </div>
            </div>
            <h3 style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>{stat.label}</h3>
            <p style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem' }}>{stat.value}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderPipeline = () => (
    <div key="pipeline" className={`card ${isEditMode ? "widget-edit-wrapper" : ""}`} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Deal Pipeline</h3>
        <Button variant="ghost" size="sm" onClick={() => navigate('deals')}>View All</Button>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius)' }}>
        Pipeline Chart Placeholder
      </div>
    </div>
  );

  const renderTasks = () => (
    <div key="tasks" className={`card ${isEditMode ? "widget-edit-wrapper" : ""}`} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Upcoming Tasks</h3>
        <Button variant="ghost" size="sm" onClick={() => navigate('tasks')}>View All</Button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {upcomingTasks.map((task, idx) => (
          <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '0.75rem', borderRadius: '0.75rem', backgroundColor: 'var(--color-bg)' }}>
            <div style={{ 
              width: '2.5rem', height: '2.5rem', borderRadius: '50%', 
              backgroundColor: task.isToday ? 'rgba(var(--color-primary-rgb), 0.1)' : 'var(--color-surface)',
              color: task.isToday ? 'var(--color-primary)' : 'var(--color-text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Clock size={18} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>{task.title}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{task.time}</p>
            </div>
            <ChevronRight size={16} color="var(--color-text-muted)" />
          </div>
        ))}
      </div>
    </div>
  );

  const renderLeads = () => (
    <div key="leads" className={`card ${isEditMode ? "widget-edit-wrapper" : ""}`} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Recent Leads</h3>
        <Button variant="ghost" size="sm" onClick={() => navigate('leads')}>View All</Button>
      </div>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Lead</th>
              <th>Status</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {recentLeads.map((lead, idx) => (
              <tr key={idx}>
                <td>
                  <div style={{ fontWeight: 600 }}>{lead.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{lead.email}</div>
                </td>
                <td>
                  <span style={{ 
                    fontSize: '0.7rem', fontWeight: 700, padding: '0.25rem 0.5rem', borderRadius: '2rem',
                    backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)', color: 'var(--color-primary)'
                  }}>
                    {lead.status}
                  </span>
                </td>
                <td style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{lead.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderActivity = () => (
    <div key="activity" className={`card ${isEditMode ? "widget-edit-wrapper" : ""}`} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Recent Activity</h3>
        <Button variant="ghost" size="sm">Refresh</Button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {recentActivities.length > 0 ? recentActivities.map((activity) => (
          <div key={activity.id} style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ 
              width: '2rem', height: '2rem', borderRadius: '50%', 
              backgroundColor: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, marginTop: '0.25rem'
            }}>
              <Clock size={14} color="var(--color-text-muted)" />
            </div>
            <div style={{ flex: 1, borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)' }}>{activity.subject}</p>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>{activity.time}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.125rem' }}>
                <User size={10} color="var(--color-primary)" />
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{activity.userName}</span>
              </div>
            </div>
          </div>
        )) : <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', textAlign: 'center', padding: '2rem' }}>No recent activity</p>}
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

      {isEditMode ? (
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={30}
          onLayoutChange={handleLayoutChange}
          draggableHandle=".widget-edit-wrapper"
        >
          {renderStats()}
          {renderPipeline()}
          {renderTasks()}
          {renderLeads()}
          {renderActivity()}
        </ResponsiveGridLayout>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div key="stats">{renderStats()}</div>
          <div className="grid grid-12" style={{ gap: '2rem' }}>
            <div className="grid-col-span-8">{renderPipeline()}</div>
            <div className="grid-col-span-4">{renderTasks()}</div>
          </div>
          <div className="grid grid-2" style={{ gap: '2rem' }}>
            {renderLeads()}
            {renderActivity()}
          </div>
        </div>
      )}
    </div>
  );
};

const Check = ({ size, color }: { size?: number, color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

export default Dashboard;
