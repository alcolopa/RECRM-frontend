import { useState, useEffect } from 'react';
import { 
  User as UserIcon, 
  Mail, 
  Lock, 
  Camera, 
  Save, 
  Loader2, 
  CheckCircle2,
  ShieldCheck,
  Building,
  AlertCircle,
  Eye,
  EyeOff,
  HandCoins
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { userService, type UserProfile } from '../api/users';
import { Input } from '../components/Input';
import Button from '../components/Button';
import CommissionInput from '../components/CommissionInput';
import PhoneInput from '../components/PhoneInput';
import PasswordStrength from '../components/PasswordStrength';
import { isPasswordStrong } from '../utils/validation';
import { mapBackendErrors, getErrorMessage } from '../utils/errors';
import { useUser } from '../App';

interface ProfileViewProps {
  user: UserProfile;
  onUserUpdate: (updatedUser: UserProfile) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user }) => {
  const { refreshProfile } = useUser();
  const activeMembership = (Array.isArray(user?.memberships) ? user.memberships : []).find((m: any) => m.organizationId === user.organizationId) || (Array.isArray(user?.memberships) ? user.memberships : [])[0];
  const activeRoleName = activeMembership?.customRole?.name || activeMembership?.role || user.role;
  const activeOrgName = activeMembership?.organization?.name || 'No Organization';

  const [formData, setFormData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    phone: user.phone || '',
    oldPassword: '',
    password: '',
    confirmPassword: '',
    avatar: user.avatar || '',
    unitPreference: user.unitPreference || 'METRIC',
    preferredTheme: user.preferredTheme || 'SYSTEM'
  } as {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    oldPassword?: string;
    password?: string;
    confirmPassword?: string;
    avatar: string;
    unitPreference: 'METRIC' | 'IMPERIAL';
    preferredTheme: 'LIGHT' | 'DARK' | 'SYSTEM';
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  // Commission Override State
  const [agentCommission, setAgentCommission] = useState<any>(null);
  const [isCommissionLoading, setIsCommissionLoading] = useState(false);
  const [isCommissionSaving, setIsCommissionSaving] = useState(false);
  const [commissionSuccess, setCommissionSuccess] = useState(false);

  useEffect(() => {
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      oldPassword: '',
      password: '',
      confirmPassword: '',
      avatar: user.avatar || '',
      unitPreference: user.unitPreference || 'METRIC',
      preferredTheme: user.preferredTheme || 'SYSTEM'
    });
    setHasChanges(false);
    fetchAgentCommission();
  }, [user]);

  const fetchAgentCommission = async () => {
    if (!user?.id) return;
    setIsCommissionLoading(true);
    try {
      const response = await userService.getMyCommissionConfig();
      setAgentCommission(response.data);
    } catch (err) {
      console.error('Failed to fetch agent commission config', err);
    } finally {
      setIsCommissionLoading(false);
    }
  };

  const handleSaveCommission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    
    setIsCommissionSaving(true);
    setCommissionSuccess(false);
    try {
      await userService.updateMyCommissionConfig(agentCommission);
      setCommissionSuccess(true);
      setTimeout(() => setCommissionSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update agent commission config', err);
      setError('Failed to update commission overrides.');
    } finally {
      setIsCommissionSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('File size must be less than 2MB.');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const response = await userService.uploadAvatar(file);
      const newAvatarUrl = response.data.avatar;
      
      setFormData(prev => ({ ...prev, avatar: newAvatarUrl }));
      await refreshProfile();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Avatar upload failed', err);
      setError(err.response?.data?.message || 'Failed to upload avatar.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
    setHasChanges(true);
  };

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.password) {
      if (!formData.oldPassword) {
        newErrors.oldPassword = 'Current password is required to set a new one';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'New passwords do not match';
      }
      if (!isPasswordStrong(formData.password)) {
        newErrors.password = 'Password must meet all requirements';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!hasChanges && !formData.password) return;

    if (!validate()) return;

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const updatePayload: any = { ...formData };
      if (!updatePayload.password) {
        delete updatePayload.password;
        delete updatePayload.oldPassword;
      }
      delete updatePayload.confirmPassword;
      delete updatePayload.avatar;

      await userService.updateMe(updatePayload);
      await refreshProfile();
      setSuccess(true);
      setHasChanges(false);
      setFormData(prev => ({ ...prev, password: '', oldPassword: '', confirmPassword: '' }));
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Update failed', err);
      setError(getErrorMessage(err, 'Failed to update profile. Please try again.'));
      const backendErrors = mapBackendErrors(err);
      if (Object.keys(backendErrors).length > 0) {
        setErrors(backendErrors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isMobileOrTablet = typeof window !== 'undefined' ? window.innerWidth <= 1024 : false;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem', padding: isMobileOrTablet ? '0 1rem 5rem' : '0 0 5rem' }}>
      <header>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.25rem' }}>Account Settings</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>Manage your personal information, avatar, and security settings.</p>
      </header>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobileOrTablet ? '1fr' : '320px 1fr', 
        gap: '2rem', 
        alignItems: 'flex-start' 
      }}>
        {/* Left Side: Profile Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
            <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 1.5rem' }}>
              <div style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                backgroundColor: 'rgba(5, 150, 105, 0.1)',
                backgroundImage: formData.avatar ? `url(${formData.avatar})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-primary)',
                fontSize: '2.5rem',
                fontWeight: 700,
                border: '4px solid var(--color-surface)',
                boxShadow: 'var(--shadow-lg)',
                overflow: 'hidden'
              }}>
                {!formData.avatar && !isUploading && `${formData.firstName?.[0] || ''}${formData.lastName?.[0] || ''}`}
                {isUploading && <Loader2 size={32} className="animate-spin" />}
              </div>
              <label htmlFor="avatar-upload" style={{
                position: 'absolute',
                bottom: '0',
                right: '0',
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-text)',
                padding: '0.5rem',
                borderRadius: '50%',
                boxShadow: 'var(--shadow)',
                cursor: isUploading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: isUploading ? 0.7 : 1
              }}>
                <Camera size={18} color='white' />
                <input 
                  id="avatar-upload" 
                  name="avatar-upload"
                  type="file" 
                  accept="image/*" 
                  onChange={handleAvatarChange} 
                  disabled={isUploading}
                  style={{ display: 'none' }} 
                />
              </label>
            </div>
            
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              {formData.firstName} {formData.lastName}
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>{formData.email}</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={badgeStyle}>
                <ShieldCheck size={16} />
                <span>Role: {activeRoleName}</span>
              </div>
              <div style={badgeStyle}>
                <Building size={16} />
                <span>Org: {activeOrgName}</span>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={18} color="var(--color-primary)" />
              Security Tips
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
              Keep your account secure by using a strong password. You'll need your current password to make changes to your security settings.
            </p>
          </div>
        </div>

        {/* Right Side: Update Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: isMobileOrTablet ? '1.5rem' : '2rem' }}>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.25rem' }}>Personal Information</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>Update your name and contact details.</p>
            </div>

            <AnimatePresence>
              {success && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={successAlertStyle}>
                  <CheckCircle2 size={18} /> Profile updated successfully!
                </motion.div>
              )}
              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={errorAlertStyle}>
                  <AlertCircle size={18} /> {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-2" style={{ gap: '1rem' }}>
              <Input
                label="First Name"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={(e) => {
                  handleChange(e);
                  if (errors.firstName) setErrors(prev => ({ ...prev, firstName: '' }));
                }}
                placeholder="First name"
                icon={UserIcon}
                error={errors.firstName}
              />
              <Input
                label="Last Name"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={(e) => {
                  handleChange(e);
                  if (errors.lastName) setErrors(prev => ({ ...prev, lastName: '' }));
                }}
                placeholder="Last name"
                icon={UserIcon}
                error={errors.lastName}
              />
            </div>

            <Input
              label="Email Address"
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={(e) => {
                handleChange(e);
                if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
              }}
              placeholder="email@example.com"
              icon={Mail}
              error={errors.email}
            />

            <PhoneInput
              id="phone"
              label="Phone Number"
              value={formData.phone}
              onChange={(val) => {
                setFormData(prev => ({ ...prev, phone: val }));
                setHasChanges(true);
              }}
            />

            <div style={{ display: 'grid', gridTemplateColumns: isMobileOrTablet ? '1fr' : '1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)' }}>Unit Preference</label>
                <select
                  id="unitPreference"
                  value={formData.unitPreference}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, unitPreference: e.target.value as 'METRIC' | 'IMPERIAL' }));
                    setHasChanges(true);
                  }}
                  className="input"
                  style={{ width: '100%', height: '2.5rem', padding: '0 0.75rem', borderRadius: '0.375rem', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}
                >
                  <option value="METRIC">Metric (sqm)</option>
                  <option value="IMPERIAL">Imperial (sqft)</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)' }}>Preferred Theme</label>
                <select
                  id="preferredTheme"
                  value={formData.preferredTheme}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, preferredTheme: e.target.value as 'LIGHT' | 'DARK' | 'SYSTEM' }));
                    setHasChanges(true);
                  }}
                  className="input"
                  style={{ width: '100%', height: '2.5rem', padding: '0 0.75rem', borderRadius: '0.375rem', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}
                >
                  <option value="SYSTEM">System Default</option>
                  <option value="LIGHT">Light Mode</option>
                  <option value="DARK">Dark Mode</option>
                </select>
              </div>
            </div>

            <div style={{ borderBottom: '1px solid var(--color-border)', margin: '1rem 0' }}></div>

            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.25rem' }}>Security & Password</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>Update your password to stay secure.</p>
            </div>

            <Input
              label="Current Password"
              id="oldPassword"
              name="oldPassword"
              type={showOldPassword ? "text" : "password"}
              value={formData.oldPassword}
              onChange={(e) => {
                handleChange(e);
                if (errors.oldPassword) setErrors(prev => ({ ...prev, oldPassword: '' }));
              }}
              placeholder="Enter current password"
              icon={Lock}
              helperText="Required only if you are changing your password."
              error={errors.oldPassword}
              rightElement={
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  disabled={isLoading}
                  style={{
                    padding: '0.5rem',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px'
                  }}
                  leftIcon={showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                />
              }
            />

            <div className="grid grid-2" style={{ gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <Input
                  label="New Password"
                  id="password"
                  name="password"
                  type={showNewPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => {
                    handleChange(e);
                    if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                  }}
                  placeholder="New password"
                  icon={Lock}
                  error={errors.password}
                  rightElement={
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      disabled={isLoading}
                      style={{
                        padding: '0.5rem',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px'
                      }}
                      leftIcon={showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    />
                  }
                />
                <PasswordStrength password={formData.password || ''} />
              </div>
              <Input
                label="Confirm New Password"
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => {
                  handleChange(e);
                  if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' }));
                }}
                placeholder="Confirm new password"
                icon={Lock}
                error={errors.confirmPassword}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={isLoading || (!hasChanges && !formData.password)}
              style={{ 
                width: isMobileOrTablet ? '100%' : 'fit-content', 
                minWidth: '180px', 
                alignSelf: isMobileOrTablet ? 'stretch' : 'flex-end',
                gap: '0.5rem', 
                marginTop: '1rem' 
              }}
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : <><Save size={18} /> Save All Changes</>}
            </button>
          </form>

          {/* Commission Overrides Section */}
          <div className="card" style={{ padding: isMobileOrTablet ? '1.5rem' : '2rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ padding: '0.4rem', borderRadius: '0.5rem', backgroundColor: 'rgba(5, 150, 105, 0.1)', color: 'var(--color-primary)' }}>
                  <HandCoins size={18} />
                </div>
                Commission & Revenue Overrides
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                Set custom splits that override the organization's default settings for your deals.
              </p>
            </div>

            <AnimatePresence>
              {commissionSuccess && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ ...successAlertStyle, marginBottom: '1.5rem' }}>
                  <CheckCircle2 size={18} /> Commission overrides updated!
                </motion.div>
              )}
            </AnimatePresence>

            {isCommissionLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                <Loader2 size={24} className="animate-spin" color="var(--color-primary)" />
              </div>
            ) : (
              <form onSubmit={handleSaveCommission} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <CommissionInput
                    label="Rental Fee Override"
                    value={agentCommission?.rentAgentValue ?? ''}
                    type={agentCommission?.rentAgentType || 'PERCENTAGE'}
                    onChange={(val, type) => setAgentCommission({ ...agentCommission, rentAgentValue: val, rentAgentType: type })}
                    placeholder="Organization Default"
                    helperText="Your fee from the agency for rental deals"
                  />
                  <CommissionInput
                    label="Sales Fee Override"
                    value={agentCommission?.saleAgentValue ?? ''}
                    type={agentCommission?.saleAgentType || 'PERCENTAGE'}
                    onChange={(val, type) => setAgentCommission({ ...agentCommission, saleAgentValue: val, saleAgentType: type })}
                    placeholder="Organization Default"
                    helperText="Your fee from the agency for sales deals"
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <Button
                    type="submit"
                    isLoading={isCommissionSaving}
                    disabled={isCommissionSaving}
                    leftIcon={<Save size={18} />}
                    fullWidth={isMobileOrTablet}
                    style={{ minWidth: isMobileOrTablet ? '100% ' : '160px' }}
                  >
                    Save Overrides
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const badgeStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  padding: '0.5rem',
  backgroundColor: 'var(--color-bg)',
  borderRadius: '0.5rem',
  fontSize: '0.875rem',
  color: 'var(--color-text-muted)',
  fontWeight: 500
};

const successAlertStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.75rem 1rem',
  backgroundColor: 'rgba(22, 163, 74, 0.1)',
  color: 'var(--color-success)',
  borderRadius: 'var(--radius)',
  fontSize: '0.875rem',
  fontWeight: 600,
  border: '1px solid rgba(22, 163, 74, 0.2)'
};

const errorAlertStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.75rem 1rem',
  backgroundColor: 'rgba(220, 38, 38, 0.1)',
  color: 'var(--color-error)',
  borderRadius: 'var(--radius)',
  fontSize: '0.875rem',
  fontWeight: 600,
  border: '1px solid rgba(220, 38, 38, 0.2)'
};

export default ProfileView;
