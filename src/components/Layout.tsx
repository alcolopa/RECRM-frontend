import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import PropertiesView from './PropertiesView';
import Dashboard from './Dashboard';
import ProfileView from './ProfileView';
import ContactsView from './ContactsView';
import { useNavigation } from '../contexts/NavigationContext';

interface LayoutProps {
  children?: React.ReactNode;
  onLogout: () => void;
  user: any;
  onUserUpdate: (updatedUser: any) => void;
}

const Layout: React.FC<LayoutProps> = ({ onLogout, user, onUserUpdate }) => {
  const { activeTab, setActiveTab } = useNavigation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth > 768 && window.innerWidth <= 1024);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const mobile = width <= 768;
      const tablet = width > 768 && width <= 1024;
      
      setIsMobile(mobile);
      setIsTablet(tablet);
      
      if (mobile) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'contacts':
        return <ContactsView organizationId={user?.organizationId} />;
      case 'properties':
        return <PropertiesView organizationId={user?.organizationId} />;
      case 'profile':
        return <ProfileView user={user} onUserUpdate={onUserUpdate} />;
      default:
        return (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Feature</h2>
            <p>This module is coming soon.</p>
          </div>
        );
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      width: '100%', 
      backgroundColor: 'var(--color-bg)', 
      position: 'relative', 
      overflow: 'hidden' 
    }}>
      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isMobile={isMobile}
        isTablet={isTablet}
      />
      
      {isMobile && isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 45,
            backdropFilter: 'blur(4px)'
          }}
        />
      )}
      
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        height: '100vh',
        width: '100%',
        minWidth: 0,
        overflow: 'hidden'
      }}>
        <TopBar 
          onLogout={onLogout} 
          onToggleSidebar={toggleSidebar} 
          isMobile={isMobile} 
          user={user} 
          onProfileClick={() => setActiveTab('profile')}
        />
        
        <main style={{ 
          padding: isMobile ? '1rem' : '2rem', 
          flex: 1,
          width: '100%',
          overflowY: 'auto'
        }}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Layout;
