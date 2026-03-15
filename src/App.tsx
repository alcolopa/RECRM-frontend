import { useState, useEffect, lazy, Suspense } from 'react';
import { Home, LogIn, Moon, Sun, Loader2 } from 'lucide-react';
import api from './api/client';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { NavigationProvider } from './contexts/NavigationContext';
import { UnitProvider } from './contexts/UnitContext';

// Lazy load components
const Hero = lazy(() => import('./components/Hero'));
const Features = lazy(() => import('./components/Features'));
const Pricing = lazy(() => import('./components/Pricing'));
const LoginForm = lazy(() => import('./components/LoginForm'));
const SignupForm = lazy(() => import('./components/SignupForm'));
const Layout = lazy(() => import('./components/Layout'));

const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
    <Loader2 size={40} className="animate-spin" color="var(--color-primary)" />
  </div>
);

const AppContent = () => {
  const { theme, toggleTheme } = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [view, setView] = useState<'landing' | 'login' | 'signup' | 'dashboard'>('landing');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const path = window.location.pathname;

    if (token) {
      fetchProfile();
    } else if (path === '/login') {
      setView('login');
    } else if (path === '/signup') {
      setView('signup');
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/auth/profile');
      setUser(response.data);
      setIsAuthenticated(true);
      setView('dashboard');
    } catch (err) {
      console.error('Failed to fetch profile', err);
      localStorage.removeItem('token');
      setView('landing');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
    setView('landing');
  };

  const handleUserUpdate = (updatedUser: any) => {
    setUser(updatedUser);
  };

  const handleSignupSuccess = (token: string) => {
    localStorage.setItem('token', token);
    fetchProfile();
  };

  // If authenticated, show the dashboard layout
  if (isAuthenticated && view === 'dashboard') {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <UnitProvider user={user}>
          <Layout onLogout={handleLogout} user={user} onUserUpdate={handleUserUpdate} />
        </UnitProvider>
      </Suspense>
    );
  }

  // Auth pages (Login/Signup)
  if (view === 'login' || view === 'signup') {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        backgroundColor: 'var(--color-bg)',
        background: 'radial-gradient(circle at 50% 50%, rgba(5, 150, 105, 0.05) 0%, transparent 100%)'
      }}>
        <nav className="glass" style={{
          height: '4rem',
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid var(--border)',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100
        }}>
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <div 
              onClick={() => setView('landing')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', cursor: 'pointer' }}
            >
              <Home color="var(--primary)" size={24} />
              <span style={{ fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-0.025em', color: 'var(--foreground)' }}>
                Estate<span style={{ color: 'var(--primary)' }}>Hub</span>
              </span>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button 
                onClick={toggleTheme}
                style={{ background: 'none', border: 'none', color: 'var(--foreground)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem' }}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button 
                onClick={() => setView('landing')}
                style={{ background: 'none', border: 'none', color: 'var(--secondary)', fontWeight: 500, cursor: 'pointer' }}
              >
                Back to Home
              </button>
            </div>
          </div>
        </nav>

        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6rem 1.5rem 2rem' }}>
          <Suspense fallback={<LoadingFallback />}>
            {view === 'login' ? (
              <LoginForm onSwitchToSignup={() => setView('signup')} />
            ) : (
              <SignupForm 
                onSwitchToLogin={() => setView('login')} 
                onSignupSuccess={handleSignupSuccess}
              />
            )}
          </Suspense>
        </main>
      </div>
    );
  }

  // Landing Page
  return (
    <div className="app">
      {/* Navigation */}
      <nav className="glass" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: '4rem',
        display: 'flex',
        alignItems: 'center',
        borderBottom: '1px solid var(--border)'
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div 
            onClick={() => setView('landing')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', cursor: 'pointer' }}
          >
            <Home color="var(--primary)" size={24} />
            <span style={{ fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-0.025em', color: 'var(--foreground)' }}>
              Estate<span style={{ color: 'var(--primary)' }}>Hub</span>
            </span>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div className="hidden-mobile" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginRight: '1rem' }}>
              <a href="#features" style={{ textDecoration: 'none', color: 'var(--secondary)', fontWeight: 500, fontSize: '0.875rem' }}>Features</a>
              <a href="#pricing" style={{ textDecoration: 'none', color: 'var(--secondary)', fontWeight: 500, fontSize: '0.875rem' }}>Pricing</a>
            </div>
            <button 
              onClick={toggleTheme}
              style={{ background: 'none', border: 'none', color: 'var(--foreground)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem' }}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button 
              onClick={() => setView('login')}
              style={{ background: 'none', border: 'none', color: 'var(--foreground)', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <LogIn size={18} /> <span className="hidden-mobile">Sign In</span>
            </button>
            <button 
              onClick={() => setView('signup')}
              className="btn btn-primary" 
              style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            >
              Join Now
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ paddingTop: '4rem' }}>
        <Suspense fallback={<LoadingFallback />}>
          <Hero />
          <Features />
          <Pricing />
        </Suspense>
      </main>

      {/* Footer */}
      <footer style={{ padding: '4rem 0', backgroundColor: 'var(--footer-bg)', color: 'var(--footer-text)' }}>
        <div className="container">
          <div className="grid grid-3">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <Home color="var(--primary)" size={24} />
                <span style={{ fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-0.025em', color: 'var(--footer-text)' }}>EstateHub</span>
              </div>
              <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', maxWidth: '300px' }}>
                The ultimate solution for modern real estate professionals. Elevate your business today.
              </p>
            </div>
            <div>
              <h4 style={{ marginBottom: '1.5rem' }}>Product</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                <li>Features</li>
                <li>Pricing</li>
                <li>Integrations</li>
                <li>Case Studies</li>
              </ul>
            </div>
            <div>
              <h4 style={{ marginBottom: '1.5rem' }}>Support</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                <li>Documentation</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>
          <div style={{
            marginTop: '4rem',
            paddingTop: '2rem',
            borderTop: '1px solid var(--color-border)',
            textAlign: 'center',
            color: 'var(--color-text-muted)',
            fontSize: '0.75rem'
          }}>
            © {new Date().getFullYear()} EstateHub CRM. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

const App = () => (
  <ThemeProvider>
    <NavigationProvider>
      <AppContent />
    </NavigationProvider>
  </ThemeProvider>
);

export default App;
