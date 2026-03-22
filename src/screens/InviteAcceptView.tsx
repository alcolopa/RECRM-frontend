import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  AlertCircle, 
  Loader2, 
  Mail, 
  User,
  Lock
} from 'lucide-react';
import { userService } from '../api/users';
import { Input } from '../components/Input';
import PhoneInput from '../components/PhoneInput';
import PasswordStrength from '../components/PasswordStrength';
import Button from '../components/Button';
import { getErrorMessage } from '../utils/errors';

interface InviteAcceptViewProps {
  token: string;
  onSuccess: (token: string, user?: any) => void;
  onBackToLogin: () => void;
}

const InviteAcceptView: React.FC<InviteAcceptViewProps> = ({ token, onSuccess, onBackToLogin }) => {
  const [step, setStep] = useState<'verifying' | 'accept' | 'register' | 'error'>('verifying');
  const [inviteData, setInviteData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Registration form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const verifyToken = async () => {
      try {
        setIsLoading(true);
        const response = await userService.verifyInvitation(token);
        const data = response.data as any;
        setInviteData(data);
        
        if (data.userExists) {
          setStep('accept');
        } else {
          setStep('register');
        }
      } catch (err: any) {
        console.error('Failed to verify invitation', err);
        setError(getErrorMessage(err, 'This invitation link is invalid or has expired.'));
        setStep('error');
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleAccept = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await userService.acceptInvitation(token);
      localStorage.setItem('token', response.data.access_token);
      onSuccess(response.data.access_token, response.data.user);
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to accept invitation.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const { password, firstName, lastName, phone } = formData;
      const response = await userService.registerInvitation({
        token,
        userData: { password, firstName, lastName, phone }
      });
      localStorage.setItem('token', response.data.access_token);
      onSuccess(response.data.access_token, response.data.user);
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to create account.'));
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'verifying') {
    return (
      <div className="card" style={{ width: '100%', maxWidth: '450px', padding: '3rem 2rem', textAlign: 'center' }}>
        <Loader2 size={48} className="animate-spin" color="var(--color-primary)" style={{ margin: '0 auto 1.5rem' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Verifying Invitation</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>Please wait while we validate your invitation link...</p>
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="card" style={{ width: '100%', maxWidth: '450px', padding: '3rem 2rem', textAlign: 'center' }}>
        <div style={{ 
          width: '64px', 
          height: '64px', 
          borderRadius: '50%', 
          backgroundColor: 'rgba(220, 38, 38, 0.1)', 
          color: 'var(--color-error)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem'
        }}>
          <AlertCircle size={32} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Invitation Error</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>{error}</p>
        <Button variant="outline" onClick={onBackToLogin} style={{ width: '100%' }}>
          Return to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem' }}>
      <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ 
          width: '64px', 
          height: '64px', 
          borderRadius: '1.25rem', 
          backgroundColor: 'rgba(5, 150, 105, 0.1)', 
          color: 'var(--color-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          boxShadow: '0 8px 16px -4px rgba(5, 150, 105, 0.15)'
        }}>
          <UserPlus size={32} />
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '0.5rem' }}>
          Join Team
        </h1>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Create your account to join <strong style={{ color: 'var(--color-text)' }}>{inviteData?.organizationName}</strong>
        </p>
      </header>

      {error && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem', 
          padding: '1rem', 
          backgroundColor: 'rgba(220, 38, 38, 0.05)', 
          color: 'var(--color-error)', 
          borderRadius: 'var(--radius)', 
          fontSize: '0.875rem', 
          marginBottom: '1.5rem',
          border: '1px solid rgba(220, 38, 38, 0.1)'
        }}>
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {step === 'accept' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ 
            padding: '1.25rem', 
            backgroundColor: 'var(--color-bg)', 
            borderRadius: 'var(--radius)', 
            border: '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: '50%', 
                backgroundColor: 'var(--color-primary)', 
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.875rem',
                fontWeight: 700
              }}>
                {(inviteData?.email || 'U')[0].toUpperCase()}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{inviteData?.email}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Logged in account</span>
              </div>
            </div>
            
            <div style={{ height: '1px', backgroundColor: 'var(--color-border)' }} />
            
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
              By accepting, you will become a member of <strong>{inviteData.organizationName}</strong>. 
              {inviteData.alreadyMemberOf && (
                <span style={{ color: 'var(--color-warning)', display: 'block', marginTop: '0.5rem', fontWeight: 600 }}>
                  Note: You are already a member of another organization. Accepting this will move you to {inviteData.organizationName}.
                </span>
              )}
            </p>
          </div>

          <Button 
            onClick={handleAccept} 
            disabled={isLoading} 
            style={{ width: '100%', height: '3.25rem' }}
          >
            {isLoading ? <Loader2 className="animate-spin" /> : 'Accept & Join Organization'}
          </Button>
          
          <Button variant="outline" onClick={onBackToLogin} style={{ width: '100%' }}>
            Log in with different account
          </Button>
        </div>
      ) : (
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="First Name"
              required
              value={formData.firstName}
              onChange={e => setFormData({ ...formData, firstName: e.target.value })}
              placeholder="John"
              icon={User}
            />
            <Input
              label="Last Name"
              required
              value={formData.lastName}
              onChange={e => setFormData({ ...formData, lastName: e.target.value })}
              placeholder="Doe"
              icon={User}
            />
          </div>

          <Input
            label="Email"
            type="email"
            value={inviteData?.email}
            disabled
            icon={Mail}
          />

          <PhoneInput
            id="phone"
            label="Phone Number"
            value={formData.phone}
            onChange={val => setFormData({ ...formData, phone: val })}
          />

          <Input
            label="Password"
            type="password"
            required
            value={formData.password}
            onChange={e => setFormData({ ...formData, password: e.target.value })}
            placeholder="Create a password"
            icon={Lock}
          />
          
          <PasswordStrength password={formData.password} />

          <Input
            label="Confirm Password"
            type="password"
            required
            value={formData.confirmPassword}
            onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
            placeholder="Confirm your password"
            icon={Lock}
          />

          <Button 
            type="submit" 
            disabled={isLoading} 
            style={{ width: '100%', height: '3.25rem', marginTop: '0.5rem' }}
          >
            {isLoading ? <Loader2 className="animate-spin" /> : 'Create Account & Join'}
          </Button>

          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            Already have an account?{' '}
            <button 
              type="button" 
              onClick={onBackToLogin}
              style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer' }}
            >
              Sign In
            </button>
          </p>
        </form>
      )}
    </div>
  );
};

export default InviteAcceptView;
