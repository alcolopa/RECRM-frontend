import api from './client';

export interface DashboardStat {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon?: any;
  color?: string;
}

export interface RecentLead {
  name: string;
  email: string;
  status: string;
  time: string;
}

export interface UpcomingTask {
  title: string;
  time: string;
  isToday: boolean;
}

export interface RecentActivity {
  id: string;
  type: string;
  subject: string;
  content?: string;
  userName: string;
  time: string;
}

export interface PipelineData {
  stage: string;
  count: number;
  value: number;
}

export const dashboardService = {
  getStats: (orgId: string) => 
    api.get<DashboardStat[]>('/dashboard/stats', { params: { organizationId: orgId } }),
  
  getRecentLeads: (orgId: string) => 
    api.get<RecentLead[]>('/dashboard/recent-leads', { params: { organizationId: orgId } }),
  
  getUpcomingTasks: (orgId: string) => 
    api.get<UpcomingTask[]>('/dashboard/upcoming-tasks', { params: { organizationId: orgId } }),

  getRecentActivities: (orgId: string) =>
    api.get<RecentActivity[]>('/dashboard/recent-activities', { params: { organizationId: orgId } }),

  getPipeline: (orgId: string) =>
    api.get<PipelineData[]>('/dashboard/pipeline', { params: { organizationId: orgId } }),
};