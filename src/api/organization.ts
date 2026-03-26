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
  organizationId: string;
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  accentColor?: string;
  defaultTheme?: 'LIGHT' | 'DARK';
  ownerId?: string;
  owner?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  customRoles?: CustomRole[];
  memberships?: {
    id: string;
    role: string;
    customRoleId?: string;
    customRole?: CustomRole;
    user: {
      id: string;
      email: string;
      firstName?: string;
      lastName?: string;
      avatar?: string;
    };
  }[];
  createdAt: string;
  updatedAt: string;
}

export type CommissionType = 'PERCENTAGE' | 'FIXED' | 'MULTIPLIER';

export interface CommissionConfig {
  id: string;
  organizationId: string;
  rentBuyerValue?: number;
  rentBuyerType?: CommissionType;
  rentSellerValue?: number;
  rentSellerType?: CommissionType;
  rentAgentValue?: number;
  rentAgentType?: CommissionType;
  saleBuyerValue?: number;
  saleBuyerType?: CommissionType;
  saleSellerValue?: number;
  saleSellerType?: CommissionType;
  saleAgentValue?: number;
  saleAgentType?: CommissionType;
  paymentTiming?: string;
  paymentMethod?: string;
}

export const organizationService = {
  get: (organizationId?: string) => 
    api.get<Organization>('/organization', { params: { organizationId } }),
  
  update: (data: Partial<Organization>) => 
    api.patch<Organization>('/organization', data),
  
  uploadLogo: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<{ logo: string }>('/organization/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Invitations
  invite: (orgId: string, email: string, role: string = 'AGENT', customRoleId?: string) => 
    api.post(`/organization/${orgId}/invite`, { email, role, customRoleId }),
  
  getInvitations: (orgId: string) => 
    api.get(`/organization/${orgId}/invitations`),
  
  cancelInvitation: (orgId: string, invitationId: string) => 
    api.delete(`/organization/${orgId}/invitations/${invitationId}`),
  
  resendInvitation: (orgId: string, invitationId: string) => 
    api.post(`/organization/${orgId}/invitations/${invitationId}/resend`),

  // Roles
  getRoles: (orgId: string) => 
    api.get<CustomRole[]>(`/organization/${orgId}/roles`),
  
  createRole: (orgId: string, data: { name: string, description?: string, permissions: Permission[] }) => 
    api.post<CustomRole>(`/organization/${orgId}/roles`, data),
  
  updateRole: (orgId: string, roleId: string, data: { name?: string, description?: string, permissions?: Permission[] }) => 
    api.patch<CustomRole>(`/organization/${orgId}/roles/${roleId}`, data),
  
  deleteRole: (orgId: string, roleId: string) => 
    api.delete(`/organization/${orgId}/roles/${roleId}`),
  
  updateMemberRole: (orgId: string, membershipId: string, customRoleId: string) => 
    api.patch(`/organization/${orgId}/members/${membershipId}/role`, { customRoleId }),

  // Commission
  getCommissionConfig: (orgId: string) => 
    api.get<CommissionConfig>(`/commission/org`, { params: { organizationId: orgId } }),
  
  updateCommissionConfig: (orgId: string, data: Partial<CommissionConfig>) => 
    api.post<CommissionConfig>(`/commission/org`, data, { params: { organizationId: orgId } }),
};
