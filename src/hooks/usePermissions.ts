import { useMemo } from 'react';
import { useUser } from '../App';

/**
 * usePermissions hook
 * 
 * Extracts the current user's resolved permissions from their active membership's
 * custom role. Provides utility methods for permission checks throughout the UI.
 * 
 * Usage:
 *   const { hasPermission, canViewAll, isPrivileged } = usePermissions();
 *   if (hasPermission(Permission.PAYOUTS_VIEW_ALL)) { ... }
 *   if (canViewAll('DEALS')) { ... }
 */
export function usePermissions() {
  const { user } = useUser();

  return useMemo(() => {
    const activeMembership = user?.memberships?.find(
      (m) => m.organizationId === user.organizationId
    ) || user?.memberships?.[0];

    const permissions: string[] = (activeMembership?.customRole?.permissions as string[]) || [];
    const role = activeMembership?.role || user?.role || '';
    const isOrgOwner = role === 'OWNER';
    const isAdmin = role === 'ADMIN';
    const isPrivileged = isOrgOwner || isAdmin;

    /**
     * Check if the user has a specific permission.
     * Owner and Admin roles implicitly have all permissions.
     */
    const hasPermission = (perm: string): boolean => {
      return isPrivileged || permissions.includes(perm);
    };

    /**
     * Check if the user can view all records for a specific module.
     * Shorthand for checking the VIEW_ALL permission for a module.
     * 
     * @param module - Module name without suffix (e.g., 'DEALS', 'LEADS', 'CONTACTS')
     */
    const canViewAll = (module: string): boolean => {
      return hasPermission(`${module}_VIEW_ALL`);
    };

    return {
      permissions,
      role,
      isOrgOwner,
      isAdmin,
      isPrivileged,
      hasPermission,
      canViewAll,
    };
  }, [user]);
}
