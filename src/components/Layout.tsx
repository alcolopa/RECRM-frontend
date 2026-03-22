import { useState, useEffect, lazy, Suspense } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useNavigation } from '../contexts/NavigationContext';
import { Loader2, ShieldAlert } from 'lucide-react';
import TutorialGuide from './TutorialGuide';
import { tutorials } from '../data/tutorials';
import { usePermissions } from '../utils/permissions';
import { Permission } from '../api/users';

// Lazy load views for code splitting
const Dashboard = lazy(() => import('../screens/Dashboard'));
const ContactsView = lazy(() => import('../screens/ContactsView'));
const PropertiesView = lazy(() => import('../screens/PropertiesView'));
const OffersView = lazy(() => import('../screens/OffersView'));
const OfferDetailsView = lazy(() => import('../screens/OfferDetailsView'));
const LeadsView = lazy(() => import('../screens/LeadsView'));
const ProfileView = lazy(() => import('../screens/ProfileView'));
const OrganizationSettings = lazy(() => import('../screens/OrganizationSettings'));

interface LayoutProps {
  children?: React.ReactNode;
  onLogout: () => void;
  user: any;
  onUserUpdate: (updatedUser: any) => void;
}

const LoadingView = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', padding: '4rem', backgroundColor: 'var(--color-bg)' }}>
    <Loader2 size={40} className="animate-spin" color="var(--color-primary)" />
  </div>
);

const Layout: React.FC<LayoutProps> = ({ onLogout, user, onUserUpdate }) => {
  const { activeTab, setActiveTab } = useNavigation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth <= 1024);
  const { can } = usePermissions(user);

  // Derive active organization and role from memberships
  const activeMembership = user?.memberships?.find((m: any) => m.organizationId === user.organizationId) || user?.memberships?.[0];
  const activeOrgId = activeMembership?.organizationId || user?.organizationId;
  const activeRole = activeMembership?.role || user?.role;

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const mobile = width < 768;
      const tablet = width >= 768 && width <= 1024;
      
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

  const tabPermissions: Record<string, string> = {
    'dashboard': Permission.DASHBOARD_VIEW,
    'leads': Permission.LEADS_VIEW,
    'contacts': Permission.CONTACTS_VIEW,
    'properties': Permission.PROPERTIES_VIEW,
    'offers': Permission.DEALS_VIEW,
    'organization': Permission.ORG_SETTINGS_EDIT,
  };

  const renderContent = () => {
    const requiredPermission = tabPermissions[activeTab];
    if (requiredPermission && !can(requiredPermission)) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', textAlign: 'center', gap: '1rem' }}>
          <div style={{ width: '4rem', height: '4rem', borderRadius: '50%', backgroundColor: 'rgba(220, 38, 38, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-error)' }}>
            <ShieldAlert size={32} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Access Denied</h2>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: '400px' }}>You do not have the required permissions to view this module. Please contact your organization owner.</p>
        </div>
      );
    }

    return (
      <Suspense fallback={<LoadingView />}>
        {(() => {
          switch (activeTab) {
            case 'dashboard':
              return <Dashboard organizationId={activeOrgId} user={user} onUserUpdate={onUserUpdate} />;
            case 'contacts':
              return <ContactsView organizationId={activeOrgId} user={{ ...user, role: activeRole, organizationId: activeOrgId }} />;
            case 'properties':
              return <PropertiesView organizationId={activeOrgId} user={{ ...user, role: activeRole, organizationId: activeOrgId }} />;
            case 'offers':
              return <OffersView organizationId={activeOrgId} user={{ ...user, role: activeRole, organizationId: activeOrgId }} />;
            case 'offer-details':
              return <OfferDetailsView organizationId={activeOrgId} user={{ ...user, role: activeRole, organizationId: activeOrgId }} />;
            case 'leads':
              return <LeadsView organizationId={activeOrgId} user={{ ...user, role: activeRole, organizationId: activeOrgId }} />;
            case 'profile':
              return <ProfileView user={{ ...user, role: activeRole, organizationId: activeOrgId }} onUserUpdate={onUserUpdate} />;
            case 'organization':
              return <OrganizationSettings user={{ ...user, role: activeRole, organizationId: activeOrgId }} onUserUpdate={onUserUpdate} />;
            default:
              return (
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                  <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Feature</h2>
                  <p>This module is coming soon.</p>
                </div>
              );
          }
        })()}
      </Suspense>
    );
  };

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      width: '100%', 
      backgroundColor: 'var(--color-bg)', 
      position: 'relative', 
      overflow: 'visible' // Allow sidebar toggle button to show
    }}>
      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isMobile={isMobile}
        isTablet={isTablet}
        user={user}
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
        overflow: 'visible' // Allow sidebar toggle button to show
      }}>
        <TopBar 
          onLogout={onLogout} 
          onToggleSidebar={toggleSidebar} 
          isMobile={isMobile} 
          user={user} 
          onUserUpdate={onUserUpdate}
          onProfileClick={() => setActiveTab('profile')}
          onOrganizationClick={() => setActiveTab('organization')}
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

      {/* Tutorial Overlay */}
      {tutorials[activeTab] && (
        <TutorialGuide
          key={`${activeTab}-${user.id}`}
          user={user}
          tutorialId={activeTab}
          steps={tutorials[activeTab]}
          onUserUpdate={onUserUpdate}
        />
      )}
    </div>
  );
};

export default Layout;
