import React, { useState, useEffect } from 'react';
import { LogOut, LayoutDashboard, Component, Globe, Package } from 'lucide-react';
import { type UserProfile } from '../../api/users';
import ThemeSelector from '../ThemeSelector';
import AdminDashboard from './AdminDashboard';
import AdminOrganizationsList from './AdminOrganizationsList';
import AdminSubscriptionPlans from './AdminSubscriptionPlans';
import AdminAddons from './AdminAddons';

interface AdminLayoutProps {
  onLogout: () => void;
  user: UserProfile;
  onUserUpdate: (user: UserProfile) => void;
}

type AdminTab = 'dashboard' | 'organizations' | 'subscriptions' | 'addons';

const AdminLayout: React.FC<AdminLayoutProps> = ({ onLogout, user }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/admin/organizations')) {
      setActiveTab('organizations');
    } else if (path.startsWith('/admin/subscriptions')) {
      setActiveTab('subscriptions');
    } else if (path.startsWith('/admin/addons')) {
      setActiveTab('addons');
    } else {
      setActiveTab('dashboard');
    }
  }, []);

  const navigateTo = (tab: AdminTab, path: string) => {
    setActiveTab(tab);
    window.history.pushState({}, '', path);
  };

  const navItems = [
    { id: 'dashboard' as AdminTab, label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { id: 'organizations' as AdminTab, label: 'Organizations', icon: Globe, path: '/admin/organizations' },
    { id: 'subscriptions' as AdminTab, label: 'Subscription Plans', icon: Component, path: '/admin/subscriptions' },
    { id: 'addons' as AdminTab, label: 'Add-ons', icon: Package, path: '/admin/addons' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
      {/* Admin Sidebar */}
      <aside style={{
        width: '260px',
        backgroundColor: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 40
      }}>
        {/* Brand */}
        <div style={{ height: '4rem', display: 'flex', alignItems: 'center', padding: '0 1.5rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Globe color="var(--primary)" size={24} />
            <span style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--foreground)' }}>
              Estate<span style={{ color: 'var(--primary)' }}>Admin</span>
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', paddingLeft: '0.5rem' }}>
            System Management
          </div>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigateTo(item.id, item.path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                background: activeTab === item.id ? 'var(--primary-light)' : 'transparent',
                color: activeTab === item.id ? 'var(--primary)' : 'var(--color-text-muted)',
                fontWeight: activeTab === item.id ? 600 : 500,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
              }}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>

        {/* User Info & Actions */}
        <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {user.firstName?.[0] || user.email[0].toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--foreground)' }} className="truncate">
                {user.firstName} {user.lastName}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }} className="truncate">
                Super Admin
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <ThemeSelector />
            <button
              onClick={() => {
                window.history.pushState({}, '', '/');
                window.location.reload();
              }}
              style={{ padding: '0.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '0.375rem', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.75rem' }}
            >
              Exit Admin
            </button>
            <button
              onClick={onLogout}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, marginLeft: '260px', padding: '2rem 3rem', maxWidth: '100%' }}>
        {activeTab === 'dashboard' && <AdminDashboard />}
        {activeTab === 'organizations' && <AdminOrganizationsList />}
        {activeTab === 'subscriptions' && <AdminSubscriptionPlans />}
        {activeTab === 'addons' && <AdminAddons />}
      </main>
    </div>
  );
};

export default AdminLayout;
