import { useState, lazy, Suspense } from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Target, 
  HandCoins,
  Calendar,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User as UserIcon,
  Settings,
  X,
  Banknote,
  CreditCard
} from 'lucide-react';
import TopBar from './TopBar';
import TutorialGuide, { type TutorialStep } from './TutorialGuide';
import { useNavigation } from '../contexts/NavigationContext';
import { type UserProfile } from '../api/users';
import { getImageUrl } from '../utils/url';

// Lazy load screens
const Dashboard = lazy(() => import('../screens/Dashboard'));
const PropertiesView = lazy(() => import('../screens/PropertiesView'));
const ContactsView = lazy(() => import('../screens/ContactsView'));
const LeadsView = lazy(() => import('../screens/LeadsView'));
const ProfileView = lazy(() => import('../screens/ProfileView'));
const OrganizationSettings = lazy(() => import('../screens/OrganizationSettings'));
const SubscriptionPage = lazy(() => import('../screens/SubscriptionPage'));
const OffersView = lazy(() => import('../screens/OffersView'));
const OfferDetailsView = lazy(() => import('../screens/OfferDetailsView'));
const TasksView = lazy(() => import('../screens/TasksView'));
const CalendarView = lazy(() => import('../screens/CalendarView'));
const PaymentsView = lazy(() => import('../screens/PaymentsView'));

interface LayoutProps {
  onLogout: () => void;
  user: UserProfile;
  onUserUpdate: (user: any) => void;
}

const Layout: React.FC<LayoutProps> = ({ onLogout, user, onUserUpdate }) => {
  const { activeTab, navigate } = useNavigation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'properties', label: 'Properties', icon: Building2 },
    { id: 'contacts', label: 'Contacts', icon: Users },
    { id: 'leads', label: 'Leads', icon: Target },
    { id: 'deals', label: 'Deals', icon: HandCoins },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'offers', label: 'Offers', icon: HandCoins },
    { id: 'payments', label: 'Payments & Payouts', icon: Banknote },
  ];

  const bottomItems = [
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'organization', label: 'Organization Settings', icon: Settings },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
  ].filter(item => {
    if (item.id === 'subscription') return user.role === 'OWNER';
    return true;
  });

  const activeMembership = user.memberships?.find((m: any) => m.organizationId === user.organizationId) || user.memberships?.[0];
  const activeOrg = activeMembership?.organization;

  const renderContent = () => {
    const activeOrgId = activeMembership?.organizationId || user.organizationId || '';
    const activeRole = activeMembership?.role || user.role;
    
    const userWithContext = {
      ...user,
      organizationId: activeOrgId,
      role: activeRole,
      customRole: activeMembership?.customRole
    };

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard organizationId={activeOrgId} user={user} />;
      case 'properties':
        return <PropertiesView organizationId={activeOrgId} user={userWithContext as any} />;
      case 'contacts':
        return <ContactsView organizationId={activeOrgId} user={userWithContext as any} />;
      case 'leads':
        return <LeadsView organizationId={activeOrgId} user={userWithContext as any} />;
      case 'deals':
        return <OffersView organizationId={activeOrgId} user={userWithContext as any} />;
      case 'offers':
        return <OffersView organizationId={activeOrgId} user={userWithContext as any} />;
      case 'offer-details':
        return <OfferDetailsView organizationId={activeOrgId} />;
      case 'profile':
        return <ProfileView user={userWithContext as any} onUserUpdate={onUserUpdate} />;
      case 'organization':
        return <OrganizationSettings user={userWithContext as any} onUserUpdate={onUserUpdate} />;
      case 'subscription':
        return <SubscriptionPage user={userWithContext as any} />;
      case 'tasks':
        return <TasksView organizationId={activeOrgId} user={userWithContext as any} />;
      case 'calendar':
        return <CalendarView organizationId={activeOrgId} user={userWithContext as any} />;
      case 'payments':
        return <PaymentsView organizationId={activeOrgId} user={userWithContext as any} />;
      default:
        return <Dashboard organizationId={activeOrgId} user={user} />;
    }
  };

  const SidebarItem = ({ item }: { item: any }) => (
    <button
      onClick={() => {
        navigate(item.id);
        setIsMobileMenuOpen(false);
      }}
      className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: isSidebarCollapsed ? '0' : '1rem',
        padding: '0.875rem 1rem',
        width: '100%',
        border: 'none',
        background: 'none',
        borderRadius: 'var(--radius)',
        color: activeTab === item.id ? 'var(--color-primary)' : 'var(--color-text-muted)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
        position: 'relative'
      }}
    >
      <item.icon size={20} strokeWidth={activeTab === item.id ? 2.5 : 2} />
      {!isSidebarCollapsed && (
        <span style={{ fontWeight: activeTab === item.id ? 700 : 500, fontSize: '0.9375rem', textAlign: 'left' }}>{item.label}</span>
      )}
      {activeTab === item.id && (
        <div style={{
          position: 'absolute',
          left: 0,
          top: '20%',
          bottom: '20%',
          width: '3px',
          backgroundColor: 'var(--color-primary)',
          borderRadius: '0 4px 4px 0'
        }} />
      )}
    </button>
  );

  return (
    <div className="layout-container" style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
      {/* Sidebar - Tablet & Desktop */}
      <aside className={`sidebar hidden-mobile ${isSidebarCollapsed ? 'collapsed' : ''}`} style={{
        width: isSidebarCollapsed ? '80px' : '260px',
        backgroundColor: 'var(--color-surface)',
        borderRight: '1px solid var(--color-border)',
        padding: '1.5rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 100
      }}>
        <div 
          onClick={() => navigate('dashboard')}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem', 
            padding: '0 0.5rem', 
            marginBottom: '2.5rem', 
            overflow: 'hidden',
            cursor: 'pointer'
          }}
        >
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '10px', 
            backgroundColor: activeOrg?.logo ? 'transparent' : 'var(--color-primary)', 
            backgroundImage: activeOrg?.logo ? `url("${getImageUrl(activeOrg.logo)}")` : 'none',
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'white',
            flexShrink: 0,
            border: activeOrg?.logo ? '1px solid var(--color-border)' : 'none'
          }}>
            {!activeOrg?.logo && <Building2 size={24} />}
          </div>
          {!isSidebarCollapsed && (
            <span style={{ fontWeight: 800, fontSize: '1.125rem', letterSpacing: '-0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {activeOrg?.name || 'EstateHub'}
            </span>
          )}
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
          {sidebarItems.map(item => <SidebarItem key={item.id} item={item} />)}
        </nav>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.25rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
          {bottomItems.map(item => <SidebarItem key={item.id} item={item} />)}
          <button
            onClick={onLogout}
            className="sidebar-item"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: isSidebarCollapsed ? '0' : '1rem',
              padding: '0.875rem 1rem',
              width: '100%',
              border: 'none',
              background: 'none',
              borderRadius: 'var(--radius)',
              color: 'var(--color-error)',
              cursor: 'pointer',
              justifyContent: isSidebarCollapsed ? 'center' : 'flex-start'
            }}
          >
            <LogOut size={20} />
            {!isSidebarCollapsed && <span style={{ fontWeight: 500, fontSize: '0.9375rem' }}>Logout</span>}
          </button>
        </div>

        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="collapse-btn"
          style={{
            position: 'absolute',
            right: '-12px',
            top: '2.25rem',
            transform: 'translateY(-50%)',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
            color: 'var(--color-text-muted)',
            zIndex: 10
          }}
        >
          {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar 
          user={user} 
          onLogout={onLogout} 
          onMenuClick={() => setIsMobileMenuOpen(true)}
          onUserUpdate={onUserUpdate}
        />
        
        <main style={{ 
          flex: 1, 
          padding: '2rem',
          maxWidth: '1600px',
          width: '100%',
          margin: '0 auto'
        }}>
          <Suspense fallback={
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <div className="loader"></div>
            </div>
          }>
            {renderContent()}
          </Suspense>
        </main>

        <TutorialGuide 
          key={activeTab}
          user={user} 
          tutorialId={activeTab as string} 
          steps={TUTORIAL_STEPS[activeTab as string] || []}
        />
      </div>

      {/* Mobile Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <div 
              onClick={() => setIsMobileMenuOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(4px)',
                zIndex: 1000
              }}
            />
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              bottom: 0,
              width: '280px',
              backgroundColor: 'var(--color-surface)',
              zIndex: 1001,
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '8px', 
                    backgroundColor: activeOrg?.logo ? 'transparent' : 'var(--color-primary)', 
                    backgroundImage: activeOrg?.logo ? `url("${getImageUrl(activeOrg.logo)}")` : 'none',
                    backgroundSize: 'contain',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    color: 'white' 
                  }}>
                    {!activeOrg?.logo && <Building2 size={20} />}
                  </div>
                  <span style={{ fontWeight: 800, fontSize: '1.125rem' }}>{activeOrg?.name || 'EstateHub'}</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)' }}>
                  <X size={24} />
                </button>
              </div>

              <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                {sidebarItems.map(item => <SidebarItem key={item.id} item={item} />)}
                <div style={{ margin: '1rem 0', height: '1px', backgroundColor: 'var(--color-border)' }} />
                {bottomItems.map(item => <SidebarItem key={item.id} item={item} />)}
              </nav>

              <button
                onClick={onLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  width: '100%',
                  border: 'none',
                  background: 'rgba(220, 38, 38, 0.05)',
                  borderRadius: 'var(--radius)',
                  color: 'var(--color-error)',
                  fontWeight: 600,
                  marginTop: 'auto'
                }}
              >
                <LogOut size={20} />
                Logout
              </button>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const AnimatePresence = ({ children }: { children: React.ReactNode }) => <>{children}</>;

const TUTORIAL_STEPS: Record<string, TutorialStep[]> = {
  dashboard: [
    { title: 'Welcome to your Dashboard', description: 'This is your mission control. See high-level stats, upcoming tasks, and recent leads at a glance.' },
    { title: 'Stats Overview', description: 'Track your revenue, active properties, and lead conversion rates in real-time.' },
    { title: 'Customizable Layout', description: 'Click "Customize" to rearrange your dashboard widgets however you like.' }
  ],
  properties: [
    { title: 'Manage Your Listings', description: 'Add, edit, and organize all your real estate properties here.' },
    { title: 'Public Sharing', description: 'Generate professional public links for any property to share with potential buyers.' }
  ],
  leads: [
    { title: 'Pipeline Management', description: 'Track potential clients from initial contact to qualified leads.' },
    { title: 'Lead Conversion', description: 'Once a lead is ready, convert them into a permanent Contact with a single click.' }
  ]
};

export default Layout;
