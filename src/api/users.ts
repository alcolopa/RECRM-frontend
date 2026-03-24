import api from './client';

export const Permission = {
  // Leads
  LEADS_VIEW: 'LEADS_VIEW',
  LEADS_CREATE: 'LEADS_CREATE',
  LEADS_EDIT: 'LEADS_EDIT',
  LEADS_DELETE: 'LEADS_DELETE',
  LEADS_EXPORT: 'LEADS_EXPORT',

  // Contacts
  CONTACTS_VIEW: 'CONTACTS_VIEW',
  CONTACTS_CREATE: 'CONTACTS_CREATE',
  CONTACTS_EDIT: 'CONTACTS_EDIT',
  CONTACTS_DELETE: 'CONTACTS_DELETE',
  CONTACTS_EXPORT: 'CONTACTS_EXPORT',

  // Properties
  PROPERTIES_VIEW: 'PROPERTIES_VIEW',
  PROPERTIES_CREATE: 'PROPERTIES_CREATE',
  PROPERTIES_EDIT: 'PROPERTIES_EDIT',
  PROPERTIES_DELETE: 'PROPERTIES_DELETE',

  // Deals
  DEALS_VIEW: 'DEALS_VIEW',
  DEALS_CREATE: 'DEALS_CREATE',
  DEALS_EDIT: 'DEALS_EDIT',
  DEALS_DELETE: 'DEALS_DELETE',

  // Tasks
  TASKS_VIEW: 'TASKS_VIEW',
  TASKS_VIEW_ALL: 'TASKS_VIEW_ALL',
  TASKS_CREATE: 'TASKS_CREATE',
  TASKS_ASSIGN_ANY: 'TASKS_ASSIGN_ANY',
  TASKS_EDIT: 'TASKS_EDIT',
  TASKS_DELETE: 'TASKS_DELETE',

  // Calendar
  CALENDAR_VIEW: 'CALENDAR_VIEW',
  CALENDAR_VIEW_ALL: 'CALENDAR_VIEW_ALL',
  CALENDAR_EDIT: 'CALENDAR_EDIT',

  // Team
  TEAM_VIEW: 'TEAM_VIEW',
  TEAM_INVITE: 'TEAM_INVITE',
  TEAM_EDIT_ROLES: 'TEAM_EDIT_ROLES',
  TEAM_REMOVE_MEMBER: 'TEAM_REMOVE_MEMBER',

  // Organization
  ORG_SETTINGS_EDIT: 'ORG_SETTINGS_EDIT',
  ORG_BILLING_VIEW: 'ORG_BILLING_VIEW',

  // Dashboard
  DASHBOARD_VIEW: 'DASHBOARD_VIEW',
} as const;

export type Permission = keyof typeof Permission;

export interface CustomRole {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  isSystem: boolean;
}

export interface Membership {
  id: string;
  role: string;
  customRoleId?: string;
  customRole?: CustomRole;
  organizationId: string;
  organization: {
    id: string;
    name: string;
    slug: string;
    logo?: string;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  phone?: string;
  unitPreference: 'METRIC' | 'IMPERIAL';
  preferredTheme?: 'LIGHT' | 'DARK' | 'SYSTEM';
  completedTutorials: string[];
  dashboardConfig?: any;
  memberships: Membership[];
  ownedOrganizations: any[];
  // Legacy fields for easier transition
  role?: string;
  organizationId?: string;
}

export const userService = {
  getMe: () => api.get<UserProfile>('/users/me'),
  getAll: (orgId: string) => api.get<UserProfile[]>('/users', { params: { organizationId: orgId } }),
  updateMe: (data: Partial<UserProfile> & { password?: string; oldPassword?: string }) => 
    api.patch<UserProfile>('/users/me', data),
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<{ avatar: string }>('/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  completeTutorial: (tutorialId: string) => api.post<UserProfile>(`/users/me/tutorials/${tutorialId}`),
  skipAllTutorials: () => api.post<UserProfile>('/users/me/tutorials/skip-all'),
  verifyInvitation: (token: string) => api.get(`/auth/invite/verify/${token}`),
  acceptInvitation: (token: string) => api.post('/auth/invite/accept', { token }),
  registerInvitation: (data: any) => api.post('/auth/invite/register', data),
};
