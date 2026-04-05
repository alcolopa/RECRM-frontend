import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  Search, 
  ChevronDown, 
  User, 
  Settings, 
  LogOut,
  HelpCircle,
  Loader2,
  Target,
  Building2,
  Users,
  CheckSquare,
  Menu,
  ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';
import ThemeSelector from './ThemeSelector';
import { type UserProfile } from '../api/users';
import { getImageUrl } from '../utils/url';
import { useNavigation, type NavigationTab } from '../contexts/NavigationContext';
import { searchService, type SearchResult } from '../api/search';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Debounced search logic
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        try {
          const response = await searchService.search(searchQuery, user.organizationId || '');
          setSearchResults(response.data);
          setShowSearchResults(true);
        } catch (err) {
          console.error('Search failed', err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, user.organizationId]);

  const handleResultClick = (result: SearchResult) => {
    setShowSearchResults(false);
    setSearchQuery('');
    navigate(result.link.replace('/', '') as NavigationTab, {
      prefillData: { [`${result.type.toLowerCase()}Id`]: result.id }
    });
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'LEAD': return <Target size={16} color="var(--color-primary)" />;
      case 'CONTACT': return <Users size={16} color="#3b82f6" />;
      case 'PROPERTY': return <Building2 size={16} color="#f59e0b" />;
      case 'TASK': return <CheckSquare size={16} color="#10b981" />;
      default: return <Search size={16} />;
    }
  };

  const notifications = [
    { id: 1, title: 'New lead assigned', description: 'Sarah Jenkins has been assigned to you.', time: '5m ago', read: false },
    { id: 2, title: 'Offer accepted', description: 'The offer for Sunset Villa has been accepted.', time: '1h ago', read: false },
    { id: 3, title: 'Task due soon', description: 'Follow up with Michael regarding the contract.', time: '3h ago', read: true },
  ];

  return (
    <header style={{
      height: '4.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: isMobile ? '0 1rem' : '0 2rem',
      borderBottom: '1px solid var(--color-border)',
      position: 'sticky',
      top: 0,
      zIndex: 90,
      backgroundColor: 'var(--color-surface)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
        {isMobile && (
          <button 
            onClick={onMenuClick}
            style={{ background: 'none', border: 'none', color: 'var(--color-text)', cursor: 'pointer', padding: '0.5rem' }}
          >
            <Menu size={24} />
          </button>
        )}

        {/* Search Container */}
        <div ref={searchRef} style={{ position: 'relative', width: '100%', maxWidth: isMobile ? '200px' : '450px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input 
              type="text" 
              placeholder={isMobile ? "Search..." : "Search leads, properties, tasks..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
              style={{
                width: '100%',
                height: '2.5rem',
                padding: '0 1rem 0 2.75rem',
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
            {isSearching && (
              <Loader2 size={14} className="animate-spin" style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-primary)' }} />
            )}
          </div>

          {/* Search Results Dropdown */}
          <AnimatePresence>
            {showSearchResults && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                style={{
                  position: 'absolute',
                  top: '110%',
                  left: isMobile ? '-50px' : 0,
                  right: isMobile ? '-100px' : 0,
                  backgroundColor: 'var(--color-surface)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-2xl)',
                  border: '1px solid var(--color-border)',
                  overflow: 'hidden',
                  zIndex: 1000,
                  minWidth: isMobile ? '280px' : 'auto'
                }}
              >
                <div style={{ padding: '0.75rem', borderBottom: '1px solid var(--color-border)', backgroundColor: 'rgba(var(--color-primary-rgb), 0.02)' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {searchResults.length} Results
                  </span>
                </div>
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {searchResults.map((result) => (
                    <div 
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleResultClick(result)}
                      style={{
                        padding: '0.875rem 1.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                        borderBottom: '1px solid var(--color-border)'
                      }}
                    >
                      <div style={{
                        width: '2rem', height: '2rem', borderRadius: '0.5rem', backgroundColor: 'var(--color-bg)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        {getResultIcon(result.type)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{result.title}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{result.subtitle}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} className="hidden-mobile">
          <ThemeSelector />
        </div>

        {/* Notifications */}
        <div style={{ position: isMobile ? 'static' : 'relative' }} ref={notificationsRef}>
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
                initial={isMobile ? { x: '100%' } : { opacity: 0, y: 10, scale: 0.95 }}
                animate={isMobile ? { x: 0 } : { opacity: 1, y: 0, scale: 1 }}
                exit={isMobile ? { x: '100%' } : { opacity: 0, y: 10, scale: 0.95 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'var(--color-surface)',
                  zIndex: 2000,
                  display: 'flex',
                  flexDirection: 'column',
                  ...( !isMobile && {
                    position: 'absolute',
                    top: '120%',
                    left: 'auto',
                    right: 0,
                    bottom: 'auto',
                    width: '320px',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-2xl)',
                    border: '1px solid var(--color-border)',
                    height: 'auto'
                  })
                }}
              >
                {/* Mobile Header */}
                {isMobile ? (
                  <div style={{ padding: '1.25rem 1rem', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button 
                      onClick={() => setIsNotificationsOpen(false)}
                      style={{ background: 'none', border: 'none', color: 'var(--color-text)', cursor: 'pointer' }}
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, flex: 1 }}>Notifications</h2>
                    <button style={{ fontSize: '0.875rem', color: 'var(--color-primary)', background: 'none', border: 'none', fontWeight: 600 }}>Clear all</button>
                  </div>
                ) : (
                  <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Notifications</h3>
                    <button style={{ fontSize: '0.75rem', color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Mark all as read</button>
                  </div>
                )}

                <div style={{ flex: 1, overflowY: 'auto' }}>
                  {notifications.map(notif => (
                    <div key={notif.id} style={{
                      padding: '1.25rem 1rem',
                      borderBottom: '1px solid var(--color-border)',
                      backgroundColor: notif.read ? 'transparent' : 'rgba(var(--color-primary-rgb), 0.02)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                        <p style={{ fontSize: '0.9375rem', fontWeight: 700 }}>{notif.title}</p>
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{notif.time}</span>
                      </div>
                      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{notif.description}</p>
                    </div>
                  ))}
                </div>
                
                {!isMobile && (
                  <div style={{ padding: '1rem', textAlign: 'center', borderTop: '1px solid var(--color-border)' }}>
                    <button style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>View all notifications</button>
                  </div>
                )}
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
              gap: '0.5rem', 
              padding: '0.25rem',
              borderRadius: '2rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div className="hidden-mobile" style={{ textAlign: 'right', marginRight: '0.25rem' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text)' }}>{user?.firstName}</p>
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
            <ChevronDown size={14} color="var(--color-text-muted)" style={{ transform: isProfileOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
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
                  <p style={{ fontSize: '0.875rem', fontWeight: 700 }}>{user?.firstName} {user?.lastName}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</p>
                </div>
                <div style={{ padding: '0.5rem' }}>
                  <button onClick={() => { setIsProfileOpen(false); navigate('profile'); }} style={dropdownButtonStyle}><User size={16} /> Profile Settings</button>
                  <button onClick={() => { setIsProfileOpen(false); navigate('organization'); }} style={dropdownButtonStyle}><Settings size={16} /> Organization</button>
                  <button style={dropdownButtonStyle}><HelpCircle size={16} /> Help Center</button>
                </div>
                <div style={{ padding: '0.5rem', borderTop: '1px solid var(--color-border)' }}>
                  <button onClick={onLogout} style={{ ...dropdownButtonStyle, color: 'var(--color-error)' }}><LogOut size={16} /> Sign Out</button>
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
  display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.75rem 1rem', border: 'none', background: 'none', borderRadius: 'var(--radius)', fontSize: '0.875rem', color: 'var(--color-text)', cursor: 'pointer', textAlign: 'left', transition: 'background 0.2s'
};

export default TopBar;
