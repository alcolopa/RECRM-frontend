import api from './client';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  billingModel: 'FLAT' | 'PER_USER';
  price: number | string | null;
  basePrice: number | string | null;
  pricePerUser: number | string | null;
  maxUsers: number | null;
  maxContacts: number | null;
  maxProperties: number | null;
  maxDeals: number | null;
  maxStorage: number | null;
  features: string[] | null;
  isActive: boolean;
  _count?: { subscriptions: number };
}

export interface PlanAddon {
  id: string;
  name: string;
  description: string | null;
  price: number | string;
  features: string[] | null;
  isActive: boolean;
  _count?: { subscriptionAddons: number };
}

export interface SubscriptionAddon {
  id: string;
  subscriptionId: string;
  addonId: string;
  quantity: number;
  activatedAt: string;
  addon: PlanAddon;
}

export interface SystemMetrics {
  totalUsers: number;
  totalOrganizations: number;
  activeSubscriptions: number;
  totalAddons: number;
  activeAddonAssignments: number;
  mrr: number;
  planDistribution: { name: string; count: number; revenue: number }[];
  recentOrganizations: any[];
}

export const adminService = {
  // Metrics
  getSystemMetrics: () => api.get<SystemMetrics>('/admin/metrics'),

  // Organizations
  getOrganizations: () => api.get('/admin/organizations'),
  getOrganizationDetails: (id: string) => api.get(`/admin/organizations/${id}`),
  updateOrganizationStatus: (id: string, isSuspended: boolean) =>
    api.patch(`/admin/organizations/${id}/status`, { isSuspended }),

  // Plans
  getPlans: () => api.get<SubscriptionPlan[]>('/admin/subscriptions'),
  createPlan: (data: Partial<SubscriptionPlan>) => api.post('/admin/subscriptions', data),
  updatePlan: (id: string, data: Partial<SubscriptionPlan>) =>
    api.patch(`/admin/subscriptions/${id}`, data),
  deletePlan: (id: string) => api.delete(`/admin/subscriptions/${id}`),

  // Plan assignment
  assignPlanToOrg: (orgId: string, planId: string, overrides: any) =>
    api.post(`/admin/subscriptions/assign/${orgId}/${planId}`, overrides),

  // Add-ons
  getAddons: () => api.get<PlanAddon[]>('/admin/subscriptions/addons'),
  createAddon: (data: Partial<PlanAddon>) => api.post('/admin/subscriptions/addons', data),
  updateAddon: (id: string, data: Partial<PlanAddon>) =>
    api.patch(`/admin/subscriptions/addons/${id}`, data),
  deleteAddon: (id: string) => api.delete(`/admin/subscriptions/addons/${id}`),

  // Addon assignment to org subscription
  assignAddonToOrg: (subscriptionId: string, addonId: string, quantity?: number) =>
    api.post(`/admin/subscriptions/${subscriptionId}/addons/${addonId}`, { quantity: quantity || 1 }),
  removeAddonFromOrg: (subscriptionId: string, addonId: string) =>
    api.delete(`/admin/subscriptions/${subscriptionId}/addons/${addonId}`),
};
