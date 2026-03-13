import { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  Search, 
  Settings, 
  LogOut, 
  User as UserIcon, 
  ChevronDown,
  Menu,
  Building
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TopBarProps {
  onLogout: () => void;
  onToggleSidebar: () => void;
  isMobile: boolean;
  user: any;
  onProfileClick: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onLogout, onToggleSidebar, isMobile, user, onProfileClick }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
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

  return (
    <header style={{
      height: '4.5rem',
      backgroundColor: 'white',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: isMobile ? '0 1rem' : '0 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 40,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {isMobile && (
          <button 
            onClick={onToggleSidebar}
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center',
              color: 'var(--foreground)'
            }}
          >
            <Menu size={24} />
          </button>
        )}

        {!isMobile && (
          <div style={{ position: 'relative', width: '300px' }}>
            <Search 
              size={18} 
              color="var(--secondary)" 
              style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} 
            />
            <input 
              id="globalSearch"
              name="globalSearch"
              type="text" 
              placeholder="Search..." 
              style={{
                width: '100%',
                padding: '0.625rem 1rem 0.625rem 2.5rem',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                background: 'var(--muted)',
                fontSize: '0.875rem',
                outline: 'none',
              }}
            />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '0.75rem' : '1.5rem' }}>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary)' }}>
          <Bell size={20} />
        </button>

        {!isMobile && <div style={{ width: '1px', height: '1.5rem', backgroundColor: 'var(--border)' }}></div>}

        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.25rem 0.5rem',
              borderRadius: 'var(--radius)',
            }}
          >
            <div style={{
              width: '2.25rem',
              height: '2.25rem',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-light)',
              backgroundImage: user?.avatar ? `url(${user.avatar})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
              fontWeight: 600,
              fontSize: '0.75rem'
            }}>
              {!user?.avatar && displayName.split(' ').map((n: string) => n[0]).join('')}
            </div>
            {!isMobile && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--foreground)' }}>{displayName}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>{user?.role || 'Agent'}</span>
                </div>
                <ChevronDown size={16} color="var(--secondary)" />
              </>
            )}
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
                  width: '200px',
                  backgroundColor: 'white',
                  borderRadius: 'var(--radius)',
                  boxShadow: 'var(--shadow-xl)',
                  border: '1px solid var(--border)',
                  overflow: 'hidden',
                  padding: '0.5rem'
                }}
              >
                <div style={{ padding: '0.75rem', borderBottom: '1px solid var(--border)', marginBottom: '0.5rem' }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>{displayName}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--secondary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayEmail}</p>
                  {user?.organization?.name && (
                    <p style={{ 
                      fontSize: '0.7rem', 
                      color: 'var(--primary)', 
                      marginTop: '0.25rem',
                      fontWeight: 600,
                      textTransform: 'uppercase'
                    }}>
                      {user.organization.name}
                    </p>
                  )}
                </div>

                <button onClick={handleProfileClick} style={dropdownItemStyle}>
                  <UserIcon size={16} />
                  <span>My Profile</span>
                </button>
                <button style={dropdownItemStyle}>
                  <Building size={16} />
                  <span>Organization Settings</span>
                </button>
                <button style={dropdownItemStyle}>
                  <Settings size={16} />
                  <span>System Settings</span>
                </button>
                
                <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '0.5rem 0' }}></div>
                
                <button 
                  onClick={onLogout}
                  style={{ ...dropdownItemStyle, color: '#ef4444' }}
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
  color: 'var(--foreground)',
  cursor: 'pointer',
  textAlign: 'left'
};

export default TopBar;
