import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserSquare2, 
  Building2, 
  ChevronLeft, 
  ChevronRight,
  X,
  HandCoins
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigation, type NavigationTab } from '../contexts/NavigationContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
  isTablet?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isMobile, isTablet }) => {
  const { activeTab, setActiveTab } = useNavigation();
  const [isCollapsed, setIsCollapsed] = useState(isTablet || false);

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
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'leads', label: 'Leads', icon: UserSquare2 },
    { id: 'contacts', label: 'Contacts', icon: Users },
    { id: 'properties', label: 'Properties', icon: Building2 },
    { id: 'offers', label: 'Offers', icon: HandCoins },
    { id: 'profile', label: 'Profile', icon: UserSquare2 },
  ];

  const sidebarVariants: any = {
    open: { 
      x: 0, 
      width: isCollapsed ? '5rem' : '16rem',
      transition: { type: 'spring', stiffness: 300, damping: 30 }
    },
    closed: { 
      x: isMobile ? '-100%' : 0, 
      width: isMobile ? '16rem' : (isCollapsed ? '5rem' : '16rem'),
      transition: { type: 'spring', stiffness: 300, damping: 30 }
    }
  };

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
        zIndex: 50,
        flexShrink: 0
      }}
    >
      {/* Sidebar Header - Minimalist */}
      <div style={{ 
        padding: '0 1.5rem', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: (isCollapsed && !isMobile) ? 'center' : 'space-between',
        height: '4.5rem',
        borderBottom: '1px solid var(--color-border)',
      }}>
        {(!isCollapsed || isMobile) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-primary)' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Menu
            </span>
          </div>
        )}
        
        {!isMobile && (
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            style={{
              ...iconButtonStyle,
              background: 'rgba(var(--color-primary-rgb), 0.05)',
              color: 'var(--color-primary)',
              borderRadius: '0.5rem',
              width: '2rem',
              height: '2rem'
            }}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
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
        {menuItems.map((item) => {
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
