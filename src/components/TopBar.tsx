import { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  LogOut, 
  User as UserIcon, 
  ChevronDown,
  Menu,
  Building
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getImageUrl } from '../utils/url';
import ThemeSelector from './ThemeSelector';

interface TopBarProps {
  onLogout: () => void;
  onToggleSidebar: () => void;
  isMobile: boolean;
  user: any;
  onUserUpdate: (updatedUser: any) => void;
  onProfileClick: () => void;
  onOrganizationClick: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onLogout, onToggleSidebar, isMobile, user, onUserUpdate, onProfileClick, onOrganizationClick }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Derive active organization and role from memberships
  const activeMembership = user?.memberships?.[0];
  const activeOrg = activeMembership?.organization || user?.organization;
  const activeRole = activeMembership?.role || user?.role || 'Agent';
  
  const displayName = user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user?.firstName || user?.lastName || user?.email || 'User';
    
  const displayEmail = user?.email || '';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProfileClick = () => {
    setIsDropdownOpen(false);
    onProfileClick();
  };

  const handleOrganizationClick = () => {
    setIsDropdownOpen(false);
    onOrganizationClick();
  };

  return (
    <header style={{
      height: '4.5rem',
      backgroundColor: 'var(--color-surface)',
      borderBottom: '1px solid var(--color-border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: isMobile ? '0 1rem' : '0 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {isMobile && (
          <button 
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center',
              color: 'var(--color-text)'
            }}
          >
            <Menu size={24} />
          </button>
        )}
      </div>

      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: isMobile ? '0.5rem' : '1.5rem',
        flexShrink: 0
      }}>
        <ThemeSelector onUserUpdate={onUserUpdate} />
        
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }} aria-label="Notifications">
          <Bell size={20} />
        </button>

        {!isMobile && <div style={{ width: '1px', height: '1.5rem', backgroundColor: 'var(--color-border)' }}></div>}

        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            aria-label="User menu"
            aria-expanded={isDropdownOpen}
            aria-haspopup="true"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              background: 'none',
              border: `1px solid ${isDropdownOpen ? 'var(--color-primary)' : 'var(--color-border)'}`,
              cursor: 'pointer',
              padding: '0.375rem 0.75rem',
              borderRadius: '2rem',
              transition: 'all 0.2s ease',
              backgroundColor: isDropdownOpen ? 'rgba(var(--color-primary-rgb), 0.05)' : 'transparent'
            }}
          >
            <div style={{
              width: '2rem',
              height: '2rem',
              borderRadius: '50%',
              backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)',
              backgroundImage: user?.avatar ? `url("${getImageUrl(user.avatar)}")` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary)',
              fontWeight: 700,
              fontSize: '0.75rem'
            }}>
              {!user?.avatar && displayName.split(' ').map((n: string) => n[0]).join('')}
            </div>
            {!isMobile && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text)', lineHeight: 1.2 }}>{displayName}</span>
                <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--color-primary)', textTransform: 'uppercase' }}>{activeRole}</span>
              </div>
            )}
            <ChevronDown size={16} color="var(--color-text-muted)" style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '110%',
                  width: '300px',
                  backgroundColor: 'var(--color-surface)',
                  borderRadius: 'var(--radius)',
                  boxShadow: 'var(--shadow-xl)',
                  border: '1px solid var(--color-border)',
                  overflow: 'hidden',
                  padding: '0.5rem'
                }}
              >
                <div style={{ padding: '0.75rem', borderBottom: '1px solid var(--color-border)', marginBottom: '0.5rem' }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>{displayName}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayEmail}</p>
                  {activeOrg?.name && (
                    <p style={{ 
                      fontSize: '0.7rem', 
                      color: 'var(--color-primary)', 
                      marginTop: '0.25rem',
                      fontWeight: 600,
                      textTransform: 'uppercase'
                    }}>
                      {activeOrg.name}
                    </p>
                  )}
                </div>

                <button onClick={handleProfileClick} style={dropdownItemStyle}>
                  <UserIcon size={16} />
                  <span>My Profile</span>
                </button>
                <button onClick={handleOrganizationClick} style={dropdownItemStyle}>
                  <Building size={16} />
                  <span>Organization Settings</span>
                </button>
                
                <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '0.5rem 0' }}></div>
                
                <button 
                  onClick={onLogout}
                  style={{ ...dropdownItemStyle, color: 'var(--color-error)' }}
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

const dropdownItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  width: '100%',
  padding: '0.625rem 0.75rem',
  border: 'none',
  background: 'none',
  borderRadius: '0.375rem',
  fontSize: '0.875rem',
  color: 'var(--color-text)',
  cursor: 'pointer',
  textAlign: 'left'
};

export default TopBar;
