import type { UserProfile } from '../api/users';

export const hasPermission = (user: UserProfile | null, permission: string): boolean => {
  if (!user) return false;
  
  // Find the active membership
  // Fallback to the first membership if organizationId is not explicitly set
  const membership = user.memberships?.find(m => m.organizationId === user.organizationId) || user.memberships?.[0];
  if (!membership) return false;

  // Owner role always has all permissions
  if (membership.role === 'OWNER') return true;

  // Check custom role permissions
  if (membership.customRole?.permissions) {
    return membership.customRole.permissions.includes(permission as any);
  }

  // Fallback for legacy members without custom roles
  // We can map default permissions for UserRole enum here if needed
  const defaultPermissions: Record<string, string[]> = {
    'ADMIN': ['LEADS_VIEW', 'LEADS_CREATE', 'LEADS_EDIT', 'CONTACTS_VIEW', 'CONTACTS_CREATE', 'CONTACTS_EDIT', 'PROPERTIES_VIEW', 'PROPERTIES_CREATE', 'PROPERTIES_EDIT', 'DEALS_VIEW', 'DEALS_CREATE', 'DEALS_EDIT', 'DASHBOARD_VIEW', 'TEAM_VIEW'],
    'AGENT': ['LEADS_VIEW', 'LEADS_CREATE', 'LEADS_EDIT', 'CONTACTS_VIEW', 'CONTACTS_CREATE', 'CONTACTS_EDIT', 'PROPERTIES_VIEW', 'PROPERTIES_CREATE', 'PROPERTIES_EDIT', 'DEALS_VIEW', 'DEALS_CREATE', 'DEALS_EDIT', 'DASHBOARD_VIEW', 'TEAM_VIEW'],
    'SUPPORT': ['LEADS_VIEW', 'CONTACTS_VIEW', 'PROPERTIES_VIEW', 'DEALS_VIEW', 'DASHBOARD_VIEW', 'TEAM_VIEW']
  };

  const perms = defaultPermissions[membership.role] || [];
  return perms.includes(permission);
};

export const usePermissions = (user: UserProfile | null) => {
  return {
    can: (permission: string) => hasPermission(user, permission),
    isOwner: user?.role === 'OWNER' || user?.memberships?.some(m => m.organizationId === user.organizationId && m.role === 'OWNER'),
    isAdmin: user?.role === 'ADMIN' || user?.memberships?.some(m => m.organizationId === user.organizationId && m.role === 'ADMIN'),
  };
};
