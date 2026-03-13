import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserSquare2, 
  Building2, 
  Briefcase, 
  ChevronLeft, 
  ChevronRight,
  Home,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, isOpen, onClose, isMobile }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (isMobile) {
      setIsCollapsed(false);
    }
  }, [isMobile]);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'leads', label: 'Leads', icon: UserSquare2 },
    { id: 'contacts', label: 'Contacts', icon: Users },
    { id: 'properties', label: 'Properties', icon: Building2 },
    { id: 'deals', label: 'Deals', icon: Briefcase },
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
      {/* Sidebar Header */}
      <div style={{ 
        padding: '1.5rem', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: (isCollapsed && !isMobile) ? 'center' : 'space-between',
        height: '4.5rem',
        borderBottom: '1px solid var(--color-border)'
      }}>
        {(!isCollapsed || isMobile) && (
          <div 
            onClick={() => onTabChange('dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)', cursor: 'pointer' }}
          >
            <Home color="var(--color-primary)" size={24} />
            <span style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.025em', color: 'var(--color-text)' }}>
              Estate<span style={{ color: 'var(--color-primary)' }}>Hub</span>
            </span>
          </div>
        )}
        {(isCollapsed && !isMobile) && (
          <div 
            onClick={() => onTabChange('dashboard')}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Home color="var(--color-primary)" size={24} />
          </div>
        )}
        
        {isMobile ? (
          <button onClick={onClose} style={iconButtonStyle}>
            <X size={20} color="var(--color-text-muted)" />
          </button>
        ) : (
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{
              ...iconButtonStyle,
              display: isCollapsed ? 'none' : 'flex',
            }}
          >
            <ChevronLeft size={16} color="var(--color-text-muted)" />
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
              onClick={() => onTabChange(item.id)}
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

      {/* Collapse Toggle for collapsed state */}
      {isCollapsed && !isMobile && (
        <div style={{ padding: '1rem', display: 'flex', justifyContent: 'center' }}>
          <button onClick={() => setIsCollapsed(false)} style={iconButtonStyle}>
            <ChevronRight size={16} color="var(--color-text-muted)" />
          </button>
        </div>
      )}

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
