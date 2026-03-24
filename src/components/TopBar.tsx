import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  Search, 
  Menu, 
  ChevronDown, 
  User, 
  Settings, 
  LogOut,
  HelpCircle,
  Globe,
  Maximize
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';
import ThemeSelector from './ThemeSelector';
import { type UserProfile } from '../api/users';
import { getImageUrl } from '../utils/url';
import { useNavigation } from '../contexts/NavigationContext';

interface TopBarProps {
  user: UserProfile;
  onLogout: () => void;
  onMenuClick: () => void;
  onUserUpdate: (updatedUser: any) => void;
}

const TopBar: React.FC<TopBarProps> = ({ user, onLogout, onMenuClick }) => {
  const { navigate } = useNavigation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notifications = [
    { id: 1, title: 'New lead assigned', description: 'Sarah Jenkins has been assigned to you.', time: '5m ago', read: false },
    { id: 2, title: 'Offer accepted', description: 'The offer for Sunset Villa has been accepted.', time: '1h ago', read: false },
    { id: 3, title: 'Task due soon', description: 'Follow up with Michael regarding the contract.', time: '3h ago', read: true },
  ];

  return (
    <header className="glass" style={{
      height: '4.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      borderBottom: '1px solid var(--color-border)',
      position: 'sticky',
      top: 0,
      zIndex: 90,
      backgroundColor: 'rgba(var(--color-surface-rgb), 0.8)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1 }}>
        <button 
          onClick={onMenuClick}
          className="visible-mobile"
          style={{ background: 'none', border: 'none', color: 'var(--color-text)', cursor: 'pointer', padding: '0.5rem' }}
        >
          <Menu size={24} />
        </button>

        <div className="hidden-mobile" style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search leads, properties, tasks..." 
            style={{
              width: '100%',
              height: '2.75rem',
              padding: '0 1rem 0 3rem',
              borderRadius: '2rem',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-bg)',
              color: 'var(--color-text)',
              fontSize: '0.875rem',
              outline: 'none',
              transition: 'all 0.2s ease'
            }}
            className="topbar-search"
          />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginRight: '0.5rem' }} className="hidden-mobile">
          <Button variant="ghost" style={{ padding: '0.5rem', borderRadius: '50%', width: '40px', height: '40px' }} title="Public Site">
            <Globe size={20} />
          </Button>
          <Button variant="ghost" style={{ padding: '0.5rem', borderRadius: '50%', width: '40px', height: '40px' }} title="Full Screen">
            <Maximize size={20} />
          </Button>
          <ThemeSelector />
        </div>

        {/* Notifications */}
        <div style={{ position: 'relative' }} ref={notificationsRef}>
          <Button 
            variant="ghost" 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            style={{ padding: '0.5rem', borderRadius: '50%', width: '40px', height: '40px', position: 'relative' }}
          >
            <Bell size={20} />
            <span style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              width: '10px',
              height: '10px',
              backgroundColor: 'var(--color-error)',
              border: '2px solid var(--color-surface)',
              borderRadius: '50%'
            }}></span>
          </Button>

          <AnimatePresence>
            {isNotificationsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '120%',
                  width: '320px',
                  backgroundColor: 'var(--color-surface)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-2xl)',
                  border: '1px solid var(--color-border)',
                  overflow: 'hidden',
                  zIndex: 100
                }}
              >
                <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Notifications</h3>
                  <button style={{ fontSize: '0.75rem', color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Mark all as read</button>
                </div>
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {notifications.map(notif => (
                    <div key={notif.id} style={{
                      padding: '1rem 1.25rem',
                      borderBottom: '1px solid var(--color-border)',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                      backgroundColor: notif.read ? 'transparent' : 'rgba(var(--color-primary-rgb), 0.02)'
                    }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-bg)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = notif.read ? 'transparent' : 'rgba(var(--color-primary-rgb), 0.02)'}>
                      <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>{notif.title}</p>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', lineHeight: 1.4, marginBottom: '0.5rem' }}>{notif.description}</p>
                      <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{notif.time}</p>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '1rem', textAlign: 'center', borderTop: '1px solid var(--color-border)' }}>
                  <button style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>View all notifications</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Dropdown */}
        <div style={{ position: 'relative' }} ref={profileRef}>
          <div 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              padding: '0.25rem 0.25rem 0.25rem 0.75rem',
              borderRadius: '2rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              backgroundColor: isProfileOpen ? 'rgba(var(--color-primary-rgb), 0.05)' : 'transparent',
              border: `1px solid ${isProfileOpen ? 'var(--color-primary)' : 'transparent'}`
            }}
            onMouseEnter={e => !isProfileOpen && (e.currentTarget.style.backgroundColor = 'var(--color-bg)')}
            onMouseLeave={e => !isProfileOpen && (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <div className="hidden-mobile" style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text)' }}>{user?.firstName} {user?.lastName}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>{user?.role?.toLowerCase()}</p>
            </div>
            <div style={{
              width: '36px',
              height: '36px',
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
              border: '2px solid var(--color-surface)'
            }}>
              {!user?.avatar && user?.firstName?.[0]?.toUpperCase()}
            </div>
            <ChevronDown size={16} color="var(--color-text-muted)" style={{ marginRight: '0.25rem', transform: isProfileOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </div>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '120%',
                  width: '240px',
                  backgroundColor: 'var(--color-surface)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-2xl)',
                  border: '1px solid var(--color-border)',
                  overflow: 'hidden',
                  zIndex: 100
                }}
              >
                <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--color-border)', backgroundColor: 'rgba(var(--color-primary-rgb), 0.02)' }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 700 }}>{user.firstName} {user.lastName}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</p>
                </div>
                <div style={{ padding: '0.5rem' }}>
                  <button 
                    onClick={() => { setIsProfileOpen(false); navigate('profile'); }}
                    style={dropdownButtonStyle}
                  >
                    <User size={16} /> Profile Settings
                  </button>
                  <button 
                    onClick={() => { setIsProfileOpen(false); navigate('organization'); }}
                    style={dropdownButtonStyle}
                  >
                    <Settings size={16} /> Organization
                  </button>
                  <button style={dropdownButtonStyle}>
                    <HelpCircle size={16} /> Help Center
                  </button>
                </div>
                <div style={{ padding: '0.5rem', borderTop: '1px solid var(--color-border)' }}>
                  <button 
                    onClick={onLogout}
                    style={{ ...dropdownButtonStyle, color: 'var(--color-error)' }}
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

const dropdownButtonStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  width: '100%',
  padding: '0.75rem 1rem',
  border: 'none',
  background: 'none',
  borderRadius: 'var(--radius)',
  fontSize: '0.875rem',
  color: 'var(--color-text)',
  cursor: 'pointer',
  textAlign: 'left',
  transition: 'background 0.2s'
};

export default TopBar;
