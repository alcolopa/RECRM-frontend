import { useState, useEffect } from 'react';
import { 
  Building, 
  Mail, 
  Globe, 
  MapPin, 
  Save, 
  Loader2, 
  CheckCircle2,
  AlertCircle,
  Camera,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { organizationService, type Organization } from '../api/organization';
import { type UserProfile } from '../api/users';
import { Input } from '../components/Input';
import PhoneInput from '../components/PhoneInput';
import UserSelector from '../components/UserSelector';

interface OrganizationSettingsProps {
  user: UserProfile;
}

const OrganizationSettings: React.FC<OrganizationSettingsProps> = ({ user }) => {
  const [org, setOrg] = useState<Organization | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    logo: '',
    ownerId: ''
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const isOwner = user.role === 'OWNER';

  useEffect(() => {
    fetchOrganization();
  }, []);

  const fetchOrganization = async () => {
    try {
      setIsLoading(true);
      const response = await organizationService.get();
      setOrg(response.data);
      setFormData({
        name: response.data.name || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
        website: response.data.website || '',
        address: response.data.address || '',
        logo: response.data.logo || '',
        ownerId: response.data.ownerId || ''
      });
    } catch (err: any) {
      console.error('Failed to fetch organization', err);
      setError('Failed to load organization settings.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!isOwner) return;
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
    setHasChanges(true);
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isOwner) return;
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const response = await organizationService.uploadLogo(file);
      setFormData(prev => ({ ...prev, logo: response.data.logo }));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Logo upload failed', err);
      setError(err.response?.data?.message || 'Failed to upload logo.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner || !hasChanges) return;

    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const { logo: _logo, ...updateData } = formData;
      const response = await organizationService.update(updateData);
      setOrg(response.data);
      setSuccess(true);
      setHasChanges(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Update failed', err);
      setError(err.response?.data?.message || 'Failed to update organization. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Loader2 size={40} className="animate-spin" color="var(--color-primary)" />
      </div>
    );
  }

  const isMobileOrTablet = typeof window !== 'undefined' ? window.innerWidth <= 1024 : false;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '5rem' }}>
      <header>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.25rem' }}>Organization Settings</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>Manage your organization's public profile and contact information.</p>
      </header>

      {!isOwner && (
        <div style={warningBannerStyle}>
          <ShieldAlert size={20} />
          <span>Viewing only. Only the organization owner can modify these settings.</span>
        </div>
      )}

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobileOrTablet ? '1fr' : '320px 1fr', 
        gap: '2rem', 
        alignItems: 'flex-start' 
      }}>
        {/* Left Side: Logo Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
            <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 1.5rem' }}>
              <div style={{
                width: '100%',
                height: '100%',
                borderRadius: '1rem',
                backgroundColor: 'rgba(5, 150, 105, 0.05)',
                backgroundImage: formData.logo ? `url(${formData.logo})` : 'none',
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-primary)',
                fontSize: '2.5rem',
                fontWeight: 700,
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-sm)',
                overflow: 'hidden'
              }}>
                {!formData.logo && !isUploading && <Building size={48} />}
                {isUploading && <Loader2 size={32} className="animate-spin" />}
              </div>
              {isOwner && (
                <label htmlFor="logo-upload" style={{
                  position: 'absolute',
                  bottom: '-10px',
                  right: '-10px',
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-text)',
                  padding: '0.5rem',
                  borderRadius: '50%',
                  boxShadow: 'var(--shadow)',
                  cursor: isUploading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: isUploading ? 0.7 : 1,
                  border: '3px solid var(--color-surface)'
                }}>
                  <Camera size={18} />
                  <input 
                    id="logo-upload" 
                    name="logo-upload"
                    type="file" 
                    accept="image/*" 
                    onChange={handleLogoChange} 
                    disabled={isUploading}
                    style={{ display: 'none' }} 
                  />
                </label>
              )}
            </div>
            
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>{org?.name}</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>@{org?.slug}</p>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={18} color="var(--color-primary)" />
              Ownership
            </h3>
            {org && (
              <div style={{ marginBottom: '1.5rem' }}>
                <UserSelector 
                  label="Current Owner"
                  organizationId={org.id}
                  selectedUserId={formData.ownerId}
                  onSelect={(ownerId) => {
                    if (!isOwner) return;
                    setFormData(prev => ({ ...prev, ownerId }));
                    setHasChanges(true);
                  }}
                />
              </div>
            )}
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
              The organization slug is unique and cannot be changed. Only the current owner can transfer ownership to another member.
            </p>
          </div>
        </div>

        {/* Right Side: Update Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: isMobileOrTablet ? '1.5rem' : '2rem' }}>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.25rem' }}>General Information</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>Public information about your company.</p>
            </div>

            <AnimatePresence>
              {success && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={successAlertStyle}>
                  <CheckCircle2 size={18} /> Settings updated successfully!
                </motion.div>
              )}
              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={errorAlertStyle}>
                  <AlertCircle size={18} /> {error}
                </motion.div>
              )}
            </AnimatePresence>

            <Input
              label="Organization Name"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Company Name"
              icon={Building}
              disabled={!isOwner}
            />

            <div className="grid grid-2" style={{ gap: '1rem' }}>
              <Input
                label="Public Email"
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="contact@company.com"
                icon={Mail}
                disabled={!isOwner}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)' }}>Phone Number</label>
                <PhoneInput
                  id="phone"
                  value={formData.phone}
                  onChange={(val) => {
                    if (!isOwner) return;
                    setFormData(prev => ({ ...prev, phone: val }));
                    setHasChanges(true);
                  }}
                />
              </div>
            </div>

            <Input
              label="Website"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://www.company.com"
              icon={Globe}
              disabled={!isOwner}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="address" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)' }}>Office Address</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '0.75rem', top: '0.75rem', color: 'var(--muted-foreground)' }}>
                  <MapPin size={18} />
                </div>
                <textarea
                  id="address"
                  rows={3}
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Street, City, State, Country"
                  disabled={!isOwner}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.5rem',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text)',
                    fontSize: '1rem',
                    fontFamily: 'inherit',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>

            {isOwner && (
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={isSaving || !hasChanges}
                style={{ 
                  width: isMobileOrTablet ? '100%' : 'fit-content', 
                  minWidth: '180px', 
                  alignSelf: isMobileOrTablet ? 'stretch' : 'flex-end',
                  gap: '0.5rem', 
                  marginTop: '1rem' 
                }}
              >
                {isSaving ? <Loader2 size={20} className="animate-spin" /> : <><Save size={18} /> Save Changes</>}
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

const warningBannerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '1rem',
  backgroundColor: 'rgba(217, 119, 6, 0.1)',
  color: 'var(--color-warning)',
  borderRadius: 'var(--radius)',
  fontSize: '0.875rem',
  fontWeight: 600,
  border: '1px solid rgba(217, 119, 6, 0.2)',
  marginBottom: '1rem'
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

export default OrganizationSettings;
