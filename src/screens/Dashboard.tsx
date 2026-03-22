import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  TrendingUp, 
  Users, 
  Building2, 
  Calendar,
  HandCoins,
  Loader2,
  Settings2,
  X,
  Check,
  Plus,
  GripVertical,
  Activity,
  LayoutGrid,
  Maximize2,
  Square
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Responsive as ResponsiveLayout, WidthProvider } from 'react-grid-layout/legacy';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import { dashboardService, type DashboardStat, type RecentLead, type UpcomingTask, type RecentActivity } from '../api/dashboard';
import { userService, type UserProfile } from '../api/users';
import Button from '../components/Button';
import ConfirmModal from '../components/ConfirmModal';

const ResponsiveGridLayout = WidthProvider(ResponsiveLayout);

interface DashboardProps {
  organizationId: string;
  user: UserProfile;
  onUserUpdate: (user: UserProfile) => void;
}

type WidgetSize = 'small' | 'medium' | 'large';
type WidgetType = 'totalLeads' | 'totalProperties' | 'activeOffers' | 'totalRevenue' | 'recentLeads' | 'upcomingTasks' | 'recentActivities';

interface WidgetConfig {
  id: WidgetType;
  type: WidgetType;
  size: WidgetSize;
  x: number;
  y: number;
  w: number;
  h: number;
  order: number;
}

const SIZE_MAP: Record<WidgetSize, { w: number, h: number }> = {
  small: { w: 3, h: 2 },
  medium: { w: 6, h: 4 },
  large: { w: 12, h: 6 }
};

interface DashboardLayouts {
  lg: WidgetConfig[];
  md: WidgetConfig[];
  sm: WidgetConfig[];
  xs: WidgetConfig[];
  xxs: WidgetConfig[];
}

const DEFAULT_LAYOUTS: DashboardLayouts = {
  lg: [
    { id: 'totalLeads', type: 'totalLeads', size: 'small', x: 0, y: 0, w: 3, h: 2, order: 0 },
    { id: 'totalProperties', type: 'totalProperties', size: 'small', x: 3, y: 0, w: 3, h: 2, order: 1 },
    { id: 'activeOffers', type: 'activeOffers', size: 'small', x: 6, y: 0, w: 3, h: 2, order: 2 },
    { id: 'totalRevenue', type: 'totalRevenue', size: 'small', x: 9, y: 0, w: 3, h: 2, order: 3 },
    { id: 'recentLeads', type: 'recentLeads', size: 'medium', x: 0, y: 2, w: 6, h: 4, order: 4 },
    { id: 'upcomingTasks', type: 'upcomingTasks', size: 'medium', x: 6, y: 2, w: 6, h: 4, order: 5 },
    { id: 'recentActivities', type: 'recentActivities', size: 'large', x: 0, y: 6, w: 12, h: 5, order: 6 },
  ],
  md: [
    { id: 'totalLeads', type: 'totalLeads', size: 'small', x: 0, y: 0, w: 3, h: 2, order: 0 },
    { id: 'totalProperties', type: 'totalProperties', size: 'small', x: 3, y: 0, w: 3, h: 2, order: 1 },
    { id: 'activeOffers', type: 'activeOffers', size: 'small', x: 6, y: 0, w: 2, h: 2, order: 2 },
    { id: 'totalRevenue', type: 'totalRevenue', size: 'small', x: 8, y: 0, w: 2, h: 2, order: 3 },
    { id: 'recentLeads', type: 'recentLeads', size: 'medium', x: 0, y: 2, w: 5, h: 4, order: 4 },
    { id: 'upcomingTasks', type: 'upcomingTasks', size: 'medium', x: 5, y: 2, w: 5, h: 4, order: 5 },
    { id: 'recentActivities', type: 'recentActivities', size: 'large', x: 0, y: 6, w: 10, h: 5, order: 6 },
  ],
  sm: [
    { id: 'totalLeads', type: 'totalLeads', size: 'small', x: 0, y: 0, w: 3, h: 2, order: 0 },
    { id: 'totalProperties', type: 'totalProperties', size: 'small', x: 3, y: 0, w: 3, h: 2, order: 1 },
    { id: 'activeOffers', type: 'activeOffers', size: 'small', x: 0, y: 2, w: 3, h: 2, order: 2 },
    { id: 'totalRevenue', type: 'totalRevenue', size: 'small', x: 3, y: 2, w: 3, h: 2, order: 3 },
    { id: 'recentLeads', type: 'recentLeads', size: 'medium', x: 0, y: 4, w: 6, h: 4, order: 4 },
    { id: 'upcomingTasks', type: 'upcomingTasks', size: 'medium', x: 0, y: 8, w: 6, h: 4, order: 5 },
    { id: 'recentActivities', type: 'recentActivities', size: 'large', x: 0, y: 12, w: 6, h: 5, order: 6 },
  ],
  xs: [
    { id: 'totalLeads', type: 'totalLeads', size: 'small', x: 0, y: 0, w: 1, h: 2, order: 0 },
    { id: 'totalProperties', type: 'totalProperties', size: 'small', x: 0, y: 2, w: 1, h: 2, order: 1 },
    { id: 'activeOffers', type: 'activeOffers', size: 'small', x: 0, y: 4, w: 1, h: 2, order: 2 },
    { id: 'totalRevenue', type: 'totalRevenue', size: 'small', x: 0, y: 6, w: 1, h: 2, order: 3 },
    { id: 'recentLeads', type: 'recentLeads', size: 'medium', x: 0, y: 8, w: 1, h: 4, order: 4 },
    { id: 'upcomingTasks', type: 'upcomingTasks', size: 'medium', x: 0, y: 12, w: 1, h: 4, order: 5 },
    { id: 'recentActivities', type: 'recentActivities', size: 'large', x: 0, y: 16, w: 1, h: 5, order: 6 },
  ],
  xxs: [
    { id: 'totalLeads', type: 'totalLeads', size: 'small', x: 0, y: 0, w: 1, h: 2, order: 0 },
    { id: 'totalProperties', type: 'totalProperties', size: 'small', x: 0, y: 2, w: 1, h: 2, order: 1 },
    { id: 'activeOffers', type: 'activeOffers', size: 'small', x: 0, y: 4, w: 1, h: 2, order: 2 },
    { id: 'totalRevenue', type: 'totalRevenue', size: 'small', x: 0, y: 6, w: 1, h: 2, order: 3 },
    { id: 'recentLeads', type: 'recentLeads', size: 'medium', x: 0, y: 8, w: 1, h: 4, order: 4 },
    { id: 'upcomingTasks', type: 'upcomingTasks', size: 'medium', x: 0, y: 12, w: 1, h: 4, order: 5 },
    { id: 'recentActivities', type: 'recentActivities', size: 'large', x: 0, y: 16, w: 1, h: 5, order: 6 },
  ]
};

const Dashboard: React.FC<DashboardProps> = ({ organizationId, user, onUserUpdate }) => {
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [recentLeads, setRecentLeads] = useState<RecentLead[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<UpcomingTask[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const lastMoveTime = useRef<number>(0);
  
  const [isEditMode, setIsEditingMode] = useState(false);
  const [currentBreakpoint, setCurrentBreakpoint] = useState<string>('lg');
  const [layouts, setLayouts] = useState<DashboardLayouts>(() => {
    const saved = localStorage.getItem(`dashboard_layout_${user?.id}`);
    let loadedConfig: any = null;

    if (saved) {
      try {
        loadedConfig = JSON.parse(saved);
      } catch (e) {}
    } else if (user?.dashboardConfig) {
      loadedConfig = user.dashboardConfig;
    }

    if (!loadedConfig) return DEFAULT_LAYOUTS;

    // Migration logic: if widgets is an array, it's an old config
    if (Array.isArray(loadedConfig.widgets)) {
      const oldWidgets = loadedConfig.widgets as WidgetConfig[];
      // Apply old array to all breakpoints as a starting point
      const migrated: any = {};
      Object.keys(DEFAULT_LAYOUTS).forEach(bp => {
        migrated[bp] = (DEFAULT_LAYOUTS as any)[bp].map((def: WidgetConfig) => {
          const match = oldWidgets.find(w => w.id === def.id);
          return match ? { ...def, ...match } : def;
        });
      });
      return migrated as DashboardLayouts;
    }

    // Ensure all breakpoints exist and are valid
    const finalLayouts: any = {};
    Object.keys(DEFAULT_LAYOUTS).forEach(bp => {
      const bpLayout = loadedConfig[bp] || (loadedConfig.widgets && loadedConfig.widgets[bp]);
      if (Array.isArray(bpLayout)) {
        finalLayouts[bp] = (DEFAULT_LAYOUTS as any)[bp].map((def: WidgetConfig) => {
          const match = bpLayout.find(w => w.id === def.id);
          return match ? { ...def, ...match } : def;
        });
      } else {
        finalLayouts[bp] = (DEFAULT_LAYOUTS as any)[bp];
      }
    });

    return finalLayouts as DashboardLayouts;
  });

  const activeWidgets = useMemo(() => layouts[currentBreakpoint as keyof DashboardLayouts] || layouts.lg, [layouts, currentBreakpoint]);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, leadsRes, tasksRes, activitiesRes] = await Promise.all([
        dashboardService.getStats(organizationId),
        dashboardService.getRecentLeads(organizationId),
        dashboardService.getUpcomingTasks(organizationId),
        dashboardService.getRecentActivities(organizationId),
      ]);
      
      const statsWithIcons = (Array.isArray(statsRes.data) ? statsRes.data : []).map(stat => {
        if (stat.label === 'Total Leads') return { ...stat, icon: Users, color: 'var(--color-primary)' };
        if (stat.label === 'Properties') return { ...stat, icon: Building2, color: 'var(--color-success)' };
        if (stat.label === 'Active Offers') return { ...stat, icon: HandCoins, color: 'var(--color-warning)' };
        if (stat.label === 'Revenue') return { ...stat, icon: TrendingUp, color: 'var(--color-primary)' };
        return stat;
      });

      setStats(statsWithIcons);
      setRecentLeads(Array.isArray(leadsRes.data) ? leadsRes.data : []);
      setUpcomingTasks(Array.isArray(tasksRes.data) ? tasksRes.data : []);
      setRecentActivities(Array.isArray(activitiesRes.data) ? activitiesRes.data.slice(0, 5) : []);
    } catch (err) {
      // Error handled by UI or silent
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (organizationId) {
      fetchData();
    }
  }, [organizationId]);

  const saveLayout = async (currentLayouts: DashboardLayouts) => {
    if (!user?.id) return;
    
    localStorage.setItem(`dashboard_layout_${user.id}`, JSON.stringify(currentLayouts));
    setIsSaving(true);
    try {
      const response = await userService.updateMe({ 
        dashboardConfig: currentLayouts
      });
      if (response.data) {
        onUserUpdate(response.data);
      }
    } catch (err: any) {
      setSaveError(err.response?.data?.message || 'Failed to sync dashboard. Progress saved locally.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLayoutChange = (_: any[], allLayouts: any) => {
    if (!isEditMode) return;
    
    const now = Date.now();
    if (now - lastMoveTime.current < 100) return;
    
    const nextDashboardLayouts = { ...layouts };
    
    // Update all breakpoints that were provided
    Object.keys(allLayouts).forEach(bp => {
      const bpLayout = allLayouts[bp];
      const existingWidgets = (Array.isArray(nextDashboardLayouts[bp as keyof DashboardLayouts]) ? nextDashboardLayouts[bp as keyof DashboardLayouts] : []);
      
      const updatedWidgets = existingWidgets.map(w => {
        const match = bpLayout.find((l: any) => l.i === w.id);
        if (match) {
          return { ...w, x: match.x, y: match.y, w: match.w, h: match.h };
        }
        return w;
      });

      // Update order based on position
      const sortedByPosition = [...updatedWidgets].sort((a, b) => {
        if (a.y !== b.y) return a.y - b.y;
        return a.x - b.x;
      });

      nextDashboardLayouts[bp as keyof DashboardLayouts] = updatedWidgets.map(w => ({
        ...w,
        order: sortedByPosition.findIndex(s => s.id === w.id)
      }));
    });
    
    lastMoveTime.current = now;
    setLayouts(nextDashboardLayouts);
  };

  const updateWidgetSize = (id: string, size: WidgetSize) => {
    const dimensions = SIZE_MAP[size];
    const nextLayouts = { ...layouts };
    
    Object.keys(nextLayouts).forEach(bp => {
      const widgets = nextLayouts[bp as keyof DashboardLayouts];
      if (Array.isArray(widgets)) {
        nextLayouts[bp as keyof DashboardLayouts] = widgets.map(w => 
          w.id === id ? { ...w, size, w: dimensions.w, h: dimensions.h } : w
        );
      }
    });
    
    setLayouts(nextLayouts);
  };

  const removeWidget = (id: string) => {
    const nextLayouts = { ...layouts };
    Object.keys(nextLayouts).forEach(bp => {
      const widgets = nextLayouts[bp as keyof DashboardLayouts];
      if (Array.isArray(widgets)) {
        nextLayouts[bp as keyof DashboardLayouts] = widgets.filter(w => w.id !== id);
      }
    });
    setLayouts(nextLayouts);
  };

  const addWidget = (type: WidgetType) => {
    if ((Array.isArray(activeWidgets) ? activeWidgets : []).find(l => l.type === type)) return;
    const size = isStatWidget(type) ? 'small' : 'medium';
    const dimensions = SIZE_MAP[size];
    
    const nextLayouts = { ...layouts };
    Object.keys(nextLayouts).forEach(bp => {
      const bpWidgets = (Array.isArray(nextLayouts[bp as keyof DashboardLayouts]) ? nextLayouts[bp as keyof DashboardLayouts] : []);
      const newWidget: WidgetConfig = {
        id: type,
        type,
        size,
        x: 0,
        y: Infinity,
        w: bp === 'xs' || bp === 'xxs' ? 1 : dimensions.w,
        h: dimensions.h,
        order: bpWidgets.length
      };
      nextLayouts[bp as keyof DashboardLayouts] = [...bpWidgets, newWidget];
    });
    
    setLayouts(nextLayouts);
  };

  const isStatWidget = (type: string) => 
    ['totalLeads', 'totalProperties', 'activeOffers', 'totalRevenue'].includes(type);

  const renderStatWidget = (label: string, isEdit: boolean) => {
    const stat = (Array.isArray(stats) ? stats : []).find(s => s.label === label);
    if (!stat) return <div className="card" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 className="animate-spin" size={16} /></div>;

    return (
      <div className="card" style={{ 
        padding: isMobile ? '0.75rem' : '1rem', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '0.5rem', 
        height: '100%', 
        border: isEdit ? '1px dashed var(--color-primary)' : '1px solid var(--color-border)', 
        backgroundColor: 'var(--color-surface)', 
        overflow: 'hidden',
        transform: isEdit ? 'none' : undefined,
        boxShadow: isEdit ? 'none' : undefined,
        cursor: isEdit ? 'grab' : 'pointer'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ 
            width: isMobile ? '1.75rem' : '2rem', 
            height: isMobile ? '1.75rem' : '2rem', 
            borderRadius: '0.4rem', 
            backgroundColor: `${stat.color}15`, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: stat.color 
          }}>
            {stat.icon && <stat.icon size={isMobile ? 14 : 16} />}
          </div>
          <div style={{ color: stat.trend === 'up' ? 'var(--color-success)' : 'var(--color-error)', fontSize: '0.7rem', fontWeight: 700 }}>
            {stat.change}
          </div>
        </div>
        <div>
          <p style={{ fontSize: isMobile ? '0.6rem' : '0.65rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{stat.label}</p>
          <h3 style={{ fontSize: isMobile ? '1rem' : '1.125rem', fontWeight: 800 }}>{stat.value}</h3>
        </div>
      </div>
    );
  };

  const renderWidgetContent = (widget: WidgetConfig) => {
    const { type } = widget;
    const isEdit = isEditMode;

    switch (type) {
      case 'totalLeads': return renderStatWidget('Total Leads', isEdit);
      case 'totalProperties': return renderStatWidget('Properties', isEdit);
      case 'activeOffers': return renderStatWidget('Active Offers', isEdit);
      case 'totalRevenue': return renderStatWidget('Revenue', isEdit);
      case 'recentLeads':
        return (
          <div className="card" style={{ 
            padding: '1.25rem', 
            height: '100%', 
            border: isEdit ? '1px dashed var(--color-primary)' : '1px solid var(--color-border)', 
            backgroundColor: 'var(--color-surface)', 
            overflow: 'hidden',
            transform: isEdit ? 'none' : undefined,
            boxShadow: isEdit ? 'none' : undefined,
            cursor: isEdit ? 'grab' : 'pointer'
          }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Recent Leads</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(Array.isArray(recentLeads) ? recentLeads : []).length > 0 ? (Array.isArray(recentLeads) ? recentLeads : []).map((lead, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.25rem 0' }}>
                  <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', backgroundColor: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600, flexShrink: 0 }}>{lead.name[0]}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.8125rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.name}</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.email}</p>
                  </div>
                </div>
              )) : <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', textAlign: 'center', padding: '1rem' }}>No recent leads</p>}
            </div>
          </div>
        );
      case 'upcomingTasks':
        return (
          <div className="card" style={{ 
            padding: '1.25rem', 
            height: '100%', 
            border: isEdit ? '1px dashed var(--color-primary)' : '1px solid var(--color-border)', 
            backgroundColor: 'var(--color-surface)', 
            overflow: 'hidden',
            transform: isEdit ? 'none' : undefined,
            boxShadow: isEdit ? 'none' : undefined,
            cursor: isEdit ? 'grab' : 'pointer'
          }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Upcoming Tasks</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {(Array.isArray(upcomingTasks) ? upcomingTasks : []).length > 0 ? (Array.isArray(upcomingTasks) ? upcomingTasks : []).map((task, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.75rem' }}>
                  <Calendar size={16} color="var(--color-primary)" style={{ flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: '0.8125rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{task.time}</p>
                  </div>
                </div>
              )) : <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', textAlign: 'center', padding: '1rem' }}>No upcoming tasks</p>}
            </div>
          </div>
        );
      case 'recentActivities':
        return (
          <div className="card" style={{ 
            padding: '1.25rem', 
            height: '100%', 
            border: isEdit ? '1px dashed var(--color-primary)' : '1px solid var(--color-border)', 
            backgroundColor: 'var(--color-surface)', 
            overflow: 'hidden',
            transform: isEdit ? 'none' : undefined,
            boxShadow: isEdit ? 'none' : undefined,
            cursor: isEdit ? 'grab' : 'pointer'
          }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Recent Activity</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(Array.isArray(recentActivities) ? recentActivities : []).length > 0 ? (Array.isArray(recentActivities) ? recentActivities : []).map((activity, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.75rem' }}>
                  <Activity size={14} color="var(--color-primary)" style={{ flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: '0.8125rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{activity.subject}</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{activity.time}</p>
                  </div>
                </div>
              )) : <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', textAlign: 'center', padding: '1rem' }}>No recent activity</p>}
            </div>
          </div>
        );
      default: return null;
    }
  };

  const gridLayouts = useMemo(() => {
    const rglLayouts: any = {};
    Object.keys(layouts).forEach(bp => {
      const widgets = (Array.isArray(layouts[bp as keyof DashboardLayouts]) ? layouts[bp as keyof DashboardLayouts] : []);
      rglLayouts[bp] = widgets.map(l => ({ 
        i: l.id, x: l.x, y: l.y, w: l.w, h: l.h 
      }));
    });
    return rglLayouts;
  }, [layouts]);

  const disabledWidgetList = useMemo(() => {
    const allTypes: WidgetType[] = ['totalLeads', 'totalProperties', 'activeOffers', 'totalRevenue', 'recentLeads', 'upcomingTasks', 'recentActivities'];
    const widgets = (Array.isArray(activeWidgets) ? activeWidgets : []);
    return allTypes.filter(t => !widgets.find(l => l.type === t));
  }, [activeWidgets]);

  const handleCancel = () => {
    if (user?.id) {
      const saved = localStorage.getItem(`dashboard_layout_${user.id}`);
      if (saved) {
        try {
          setLayouts(JSON.parse(saved));
        } catch(e) {}
      }
      else if (user.dashboardConfig) setLayouts(user.dashboardConfig);
      else setLayouts(DEFAULT_LAYOUTS);
    }
    setIsEditingMode(false);
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', padding: '4rem' }}>
        <Loader2 size={40} className="animate-spin" color="var(--color-primary)" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '4rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.25rem' }}>Dashboard Overview</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Customize your dashboard view.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {isEditMode ? (
            <>
              <Button variant="outline" onClick={handleCancel}>Cancel</Button>
              <Button variant="primary" onClick={() => {
                saveLayout(layouts);
                setIsEditingMode(false);
              }} isLoading={isSaving} leftIcon={<Check size={18} />}>Done</Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => setIsEditingMode(true)} leftIcon={<Settings2 size={18} />}>Edit Layout</Button>
          )}
        </div>
      </header>

      <div style={{ 
        margin: isMobile ? '0 -1rem' : '0 -1.5rem', 
        minHeight: '500px' 
      }}>
        <ResponsiveGridLayout
          className="layout"
          layouts={gridLayouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 1, xxs: 1 }}
          rowHeight={isMobile ? 50 : 60}
          isDraggable={isEditMode}
          isResizable={isEditMode && !isMobile}
          onLayoutChange={handleLayoutChange as any}
          onBreakpointChange={setCurrentBreakpoint}
          margin={isMobile ? [12, 12] : [24, 24]}
          useCSSTransforms={true}
          resizeHandle={
            <div className="react-resizable-handle" style={{ 
              position: 'absolute', 
              right: '2px', 
              bottom: '2px', 
              cursor: 'nwse-resize', 
              width: '18px', 
              height: '18px', 
              display: isEditMode && !isMobile ? 'flex' : 'none',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary)',
              opacity: 0.6,
              transition: 'opacity 0.2s',
              zIndex: 10
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v6h-6M21 21L12 12" />
              </svg>
            </div>
          }
        >
          {(Array.isArray(activeWidgets) ? activeWidgets : []).map((widget) => (
            <div key={widget.id} style={{ 
              position: 'relative', 
              userSelect: isEditMode ? 'none' : 'auto',
              WebkitUserSelect: isEditMode ? 'none' : 'auto',
              cursor: isEditMode ? 'default' : 'inherit'
            }}>
              <AnimatePresence>
                {isEditMode && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    style={{ 
                      position: 'absolute', 
                      top: '0.625rem', 
                      right: '0.625rem', 
                      display: 'flex', 
                      gap: '0.4rem',
                      zIndex: 100
                    }}
                  >
                    {isMobile && (
                      <div style={{ display: 'flex', backgroundColor: 'var(--color-surface)', borderRadius: '0.5rem', border: '1px solid var(--color-border)', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
                        <button onClick={() => updateWidgetSize(widget.id, 'small')} style={{ padding: '0.45rem', border: 'none', background: widget.size === 'small' ? 'var(--color-primary)' : 'none', color: widget.size === 'small' ? 'white' : 'inherit', cursor: 'pointer', transition: 'all 0.2s' }}><Square size={12} /></button>
                        <button onClick={() => updateWidgetSize(widget.id, 'medium')} style={{ padding: '0.45rem', border: 'none', background: widget.size === 'medium' ? 'var(--color-primary)' : 'none', color: widget.size === 'medium' ? 'white' : 'inherit', cursor: 'pointer', transition: 'all 0.2s' }}><Maximize2 size={12} /></button>
                      </div>
                    )}
                    
                    <div style={{ 
                      padding: '0.45rem', 
                      backgroundColor: 'var(--color-surface)', 
                      borderRadius: '0.5rem', 
                      border: '1px solid var(--color-border)', 
                      cursor: 'grab', 
                      color: 'var(--color-primary)', 
                      boxShadow: 'var(--shadow-md)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                      pointerEvents: 'none' // Allow dragging through this icon
                    }}>
                      <GripVertical size={16} />
                    </div>
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        removeWidget(widget.id);
                      }}
                      style={{ 
                        padding: '0.45rem', 
                        backgroundColor: 'var(--color-surface)', 
                        color: '#ef4444', 
                        borderRadius: '0.5rem', 
                        border: '1px solid var(--color-border)', 
                        cursor: 'pointer', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        boxShadow: 'var(--shadow-md)',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.backgroundColor = '#fef2f2';
                        e.currentTarget.style.borderColor = '#fecaca';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor = 'var(--color-surface)';
                        e.currentTarget.style.borderColor = 'var(--color-border)';
                      }}
                    >
                      <X size={16} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
              <div style={{ height: '100%', opacity: isEditMode ? 0.95 : 1, transition: 'opacity 0.2s' }}>
                {renderWidgetContent(widget)}
              </div>
            </div>
          ))}
        </ResponsiveGridLayout>
      </div>

      <AnimatePresence>
        {isEditMode && (Array.isArray(disabledWidgetList) ? disabledWidgetList : []).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{ marginTop: '2rem', padding: '2rem', border: '2px dashed var(--color-border)', borderRadius: '1rem' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--color-text-muted)' }}>
              <Plus size={20} />
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Add Widgets</h3>
            </div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', 
              gap: isMobile ? '0.75rem' : '1rem' 
            }}>
              {(Array.isArray(disabledWidgetList) ? disabledWidgetList : []).map(type => (
                <div 
                  key={type}
                  onClick={() => addWidget(type)}
                  className="card"
                  style={{ padding: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', transition: 'all 0.2s ease', backgroundColor: 'rgba(var(--color-primary-rgb), 0.03)' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(var(--color-primary-rgb), 0.08)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(var(--color-primary-rgb), 0.03)'}
                >
                  <div style={{ padding: '0.5rem', backgroundColor: 'var(--color-surface)', borderRadius: '0.5rem', color: 'var(--color-primary)' }}>
                    <LayoutGrid size={18} />
                  </div>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'capitalize' }}>
                    {type.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={!!saveError}
        onClose={() => setSaveError(null)}
        onConfirm={() => setSaveError(null)}
        title="Error"
        message={saveError || ''}
        confirmLabel="Close"
        variant="primary"
      />
    </div>
  );
};

export default Dashboard;