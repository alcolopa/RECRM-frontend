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
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { userService, type UserProfile } from '../api/users';

interface ProfileViewProps {
  user: UserProfile;
  onUserUpdate: (updatedUser: UserProfile) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, onUserUpdate }) => {
  const [formData, setFormData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    oldPassword: '',
    password: '',
    confirmPassword: '',
    avatar: user.avatar || ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      oldPassword: '',
      password: '',
      confirmPassword: '',
      avatar: user.avatar || ''
    });
    setHasChanges(false);
  }, [user]);

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
      onUserUpdate({ ...user, avatar: newAvatarUrl });
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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!hasChanges && !formData.password) return;

    if (formData.password) {
      if (!formData.oldPassword) {
        setError('Current password is required to set a new one.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('New passwords do not match.');
        return;
      }
      if (formData.password.length < 6) {
        setError('New password must be at least 6 characters.');
        return;
      }
    }

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

      const response = await userService.updateMe(updatePayload);
      onUserUpdate(response.data);
      setSuccess(true);
      setHasChanges(false);
      setFormData(prev => ({ ...prev, password: '', oldPassword: '', confirmPassword: '' }));
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Update failed', err);
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isMobile = typeof window !== 'undefined' ? window.innerWidth <= 768 : false;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '5rem' }}>
      <header>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.25rem' }}>Account Settings</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>Manage your personal information, avatar, and security settings.</p>
      </header>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : '320px 1fr', 
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
                <Camera size={18} />
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
                <span>Role: {user.role}</span>
              </div>
              <div style={badgeStyle}>
                <Building size={16} />
                <span>Org: {user.organization?.name || 'Loading...'}</span>
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
          <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: isMobile ? '1.5rem' : '2rem' }}>
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
              <div style={inputGroupStyle}>
                <label htmlFor="firstName" style={labelStyle}>First Name</label>
                <div style={{ position: 'relative' }}>
                  <UserIcon size={16} color="var(--color-text-muted)" style={inputIconStyle} />
                  <input id="firstName" name="firstName" type="text" value={formData.firstName} onChange={handleChange} style={inputStyle} placeholder="First name" />
                </div>
              </div>
              <div style={inputGroupStyle}>
                <label htmlFor="lastName" style={labelStyle}>Last Name</label>
                <div style={{ position: 'relative' }}>
                  <UserIcon size={16} color="var(--color-text-muted)" style={inputIconStyle} />
                  <input id="lastName" name="lastName" type="text" value={formData.lastName} onChange={handleChange} style={inputStyle} placeholder="Last name" />
                </div>
              </div>
            </div>

            <div style={inputGroupStyle}>
              <label htmlFor="email" style={labelStyle}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="var(--color-text-muted)" style={inputIconStyle} />
                <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} style={inputStyle} placeholder="email@example.com" />
              </div>
            </div>

            <div style={{ borderBottom: '1px solid var(--color-border)', margin: '1rem 0' }}></div>

            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.25rem' }}>Security & Password</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>Update your password to stay secure.</p>
            </div>

            <div style={inputGroupStyle}>
              <label htmlFor="oldPassword" style={labelStyle}>Current Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--color-text-muted)" style={inputIconStyle} />
                <input id="oldPassword" name="oldPassword" type="password" value={formData.oldPassword} onChange={handleChange} style={inputStyle} placeholder="Enter current password" />
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>
                Required only if you are changing your password.
              </p>
            </div>

            <div className="grid grid-2" style={{ gap: '1rem' }}>
              <div style={inputGroupStyle}>
                <label htmlFor="password" style={labelStyle}>New Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="var(--color-text-muted)" style={inputIconStyle} />
                  <input id="password" name="password" type="password" value={formData.password} onChange={handleChange} style={inputStyle} placeholder="New password" />
                </div>
              </div>
              <div style={inputGroupStyle}>
                <label htmlFor="confirmPassword" style={labelStyle}>Confirm New Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="var(--color-text-muted)" style={inputIconStyle} />
                  <input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} style={inputStyle} placeholder="Confirm new password" />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={isLoading || (!hasChanges && !formData.password)}
              style={{ 
                width: isMobile ? '100%' : 'fit-content', 
                minWidth: '180px', 
                alignSelf: isMobile ? 'stretch' : 'flex-end',
                gap: '0.5rem', 
                marginTop: '1rem' 
              }}
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : <><Save size={18} /> Save All Changes</>}
            </button>
          </form>
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

const inputGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.4rem'
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  fontWeight: 600,
  color: 'var(--color-text-muted)',
  textTransform: 'uppercase'
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.625rem 0.875rem 0.625rem 2.25rem',
  borderRadius: '0.5rem',
  border: '1px solid var(--color-border)',
  fontSize: '0.9375rem',
  outline: 'none',
  background: 'var(--color-surface)',
  color: 'var(--color-text)'
};

const inputIconStyle: React.CSSProperties = {
  position: 'absolute',
  left: '0.75rem',
  top: '50%',
  transform: 'translateY(-50%)'
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
