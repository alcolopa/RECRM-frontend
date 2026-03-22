import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserSquare2, 
  Building2, 
  ChevronLeft, 
  ChevronRight,
  X,
  HandCoins,
  Building
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigation, type NavigationTab } from '../contexts/NavigationContext';
import { getImageUrl } from '../utils/url';
import { usePermissions } from '../utils/permissions';
import { Permission } from '../api/users';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
  isTablet?: boolean;
  user: any;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isMobile, isTablet, user }) => {
  const { activeTab, setActiveTab } = useNavigation();
  const [isCollapsed, setIsCollapsed] = useState(isTablet || false);
  const { can } = usePermissions(user);

  // Derive active organization from memberships
  const activeMembership = user?.memberships?.find((m: any) => m.organizationId === user.organizationId) || user?.memberships?.[0];
  const activeOrg = activeMembership?.organization || user?.organization;

  useEffect(() => {
    if (isMobile) {
      setIsCollapsed(false);
    } else if (isTablet) {
      setIsCollapsed(true);
    } else {
      setIsCollapsed(false);
    }
  }, [isMobile, isTablet]);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: Permission.DASHBOARD_VIEW },
    { id: 'leads', label: 'Leads', icon: UserSquare2, permission: Permission.LEADS_VIEW },
    { id: 'contacts', label: 'Contacts', icon: Users, permission: Permission.CONTACTS_VIEW },
    { id: 'properties', label: 'Properties', icon: Building2, permission: Permission.PROPERTIES_VIEW },
    { id: 'offers', label: 'Offers', icon: HandCoins, permission: Permission.DEALS_VIEW },
    { id: 'profile', label: 'Profile', icon: UserSquare2 },
  ];

  const filteredMenuItems = menuItems.filter(item => !item.permission || can(item.permission));

  const sidebarVariants: any = {
    open: { 
      x: 0, 
      width: isCollapsed ? '6rem' : '16rem',
      transition: { type: 'spring', stiffness: 300, damping: 30 }
    },
    closed: { 
      x: isMobile ? '-100%' : 0, 
      width: isMobile ? '16rem' : (isCollapsed ? '6rem' : '16rem'),
      transition: { type: 'spring', stiffness: 300, damping: 30 }
    }
  };

  const showFullBranding = !isCollapsed || isMobile;

  return (
    <motion.aside
      initial={isMobile ? "closed" : "open"}
      animate={isOpen ? "open" : "closed"}
      variants={sidebarVariants}
      style={{
        height: '100vh',
        backgroundColor: 'var(--color-surface)',
        borderRight: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        position: isMobile ? 'fixed' : 'sticky',
        left: 0,
        top: 0,
        zIndex: 1100, // Higher than TopBar (1000)
        flexShrink: 0,
        overflow: 'visible' // Ensure button isn't clipped
      }}
    >
      {/* Sidebar Header - Organization Branding */}
      <div style={{ 
        padding: isCollapsed && !isMobile ? '0 0.75rem' : '0 1rem', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: (isCollapsed && !isMobile) ? 'center' : 'space-between',
        height: '4.5rem',
        borderBottom: '1px solid var(--color-border)',
        position: 'relative',
        overflow: 'visible' // Ensure button isn't clipped
      }}>
        {/* ... (branding content) */}
        <div 
          onClick={() => {
            setActiveTab('organization');
            if (isMobile) onClose();
          }}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem',
            cursor: 'pointer',
            flex: 1,
            minWidth: 0,
            justifyContent: (isCollapsed && !isMobile) ? 'center' : 'flex-start'
          }}
        >
          <div style={{
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: 'var(--radius)',
            backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)',
            backgroundImage: activeOrg?.logo ? `url("${getImageUrl(activeOrg.logo)}")` : 'none',
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-primary)',
            fontWeight: 700,
            fontSize: '1rem',
            border: activeOrg?.logo ? '1px solid var(--color-border)' : 'none',
            flexShrink: 0
          }}>
            {!activeOrg?.logo && <Building size={20} />}
          </div>
          {showFullBranding && (
            <span style={{ 
              fontSize: '1rem', 
              fontWeight: 800, 
              color: 'var(--color-text)', 
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {activeOrg?.name || 'EstateHub'}
            </span>
          )}
        </div>
        
        {!isMobile && (
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            style={{
              ...iconButtonStyle,
              background: 'var(--color-surface)', // Solid background
              color: 'var(--color-primary)',
              borderRadius: '50%', // Circle looks better for floating
              width: '1.75rem',
              height: '1.75rem',
              position: 'absolute',
              right: '-0.875rem', // Center on border
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 1200, // Higher than Sidebar (1100)
              boxShadow: 'var(--shadow-md)',
              border: '1px solid var(--color-border)',
              display: 'flex'
            }}
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        )}

        {isMobile && (
          <button onClick={onClose} style={iconButtonStyle} aria-label="Close sidebar">
            <X size={20} color="var(--color-text-muted)" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const showLabel = !isCollapsed || isMobile;
          
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as NavigationTab);
                if (isMobile) onClose();
              }}
              aria-label={showLabel ? undefined : item.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: showLabel ? '0.75rem' : '0',
                justifyContent: showLabel ? 'flex-start' : 'center',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                border: 'none',
                background: isActive ? 'rgba(5, 150, 105, 0.1)' : 'transparent',
                color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                width: '100%',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.875rem'
              }}
            >
              <Icon size={20} />
              {showLabel && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Version Info */}
      {(!isCollapsed || isMobile) && (
        <div style={{ padding: '1.5rem', fontSize: '0.75rem', color: 'var(--muted-foreground)', borderTop: '1px solid var(--color-border)' }}>
          v1.0.0 Stable
        </div>
      )}
    </motion.aside>
  );
};

const iconButtonStyle: React.CSSProperties = {
  background: 'var(--color-bg)',
  border: 'none',
  borderRadius: '0.5rem',
  padding: '0.25rem',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

export default Sidebar;
