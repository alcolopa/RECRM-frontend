import { useState, useEffect, useRef } from 'react';
import {
  Building,
  Mail,
  MapPin,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Camera,
  ShieldAlert,
  UserPlus,
  Clock,
  Shield,
  Settings,
  Users,
  HandCoins,
  Plus,
  Trash2,
  Check,
  ChevronLeft,
  Sun,
  Moon,
  CreditCard,
  Target
} from 'lucide-react';
import SubscriptionPage from './SubscriptionPage';
import { motion, AnimatePresence } from 'framer-motion';
import { useSubscription } from '../hooks/useSubscription';
import { organizationService, type Organization } from '../api/organization';
import { type UserProfile } from '../api/users';
import { Input, Select } from '../components/Input';
import CommissionInput from '../components/CommissionInput';
import PhoneInput from '../components/PhoneInput';
import UserSelector from '../components/UserSelector';
import Button from '../components/Button';
import CustomSelect from '../components/CustomSelect';
import ColorPicker from '../components/ColorPicker';
import Tabs from '../components/Tabs';
import AgentCommissionModal from '../components/AgentCommissionModal';
import { useTheme } from '../contexts/ThemeContext';
import { getImageUrl } from '../utils/url';
import { mapBackendErrors, getErrorMessage } from '../utils/errors';

interface OrganizationSettingsProps {
  user: UserProfile;
  onUserUpdate?: (updatedUser: any) => void;
  initialTab?: 'general' | 'team' | 'roles' | 'commission' | 'subscription';
}

const OrganizationSettings: React.FC<OrganizationSettingsProps> = ({ user, onUserUpdate, initialTab }) => {
  const [org, setOrg] = useState<Organization | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    logo: '',
    accentColor: 'EMERALD',
    defaultTheme: 'LIGHT',
    ownerId: ''
  } as {
    name: string;
    email: string;
    phone: string;
    website: string;
    address: string;
    logo: string;
    accentColor: string;
    defaultTheme: 'LIGHT' | 'DARK';
    ownerId: string;
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const { setAccentColor } = useTheme();

  const initialColorRef = useRef<string | null>(null);

  useEffect(() => {
    if (org?.accentColor) {
      initialColorRef.current = org.accentColor;
    }
  }, [org?.accentColor]);

  // Revert previewed accent color if navigating away without saving
  useEffect(() => {
    return () => {
      if (initialColorRef.current) {
        setAccentColor(initialColorRef.current);
      }
    };
  }, [setAccentColor]);

  const [activeTab, setActiveTab] = useState<'general' | 'team' | 'roles' | 'commission' | 'subscription'>(initialTab || 'general');
  const { subscription, fetchSubscription } = useSubscription(user.organizationId || null);
  const [roles, setRoles] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteCustomRoleId, setInviteCustomRoleId] = useState<string>('');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState(false);

  const [commissionConfig, setCommissionConfig] = useState<any>(null);
  const [isCommissionLoading, setIsCommissionLoading] = useState(false);
  const [isCommissionSaving, setIsCommissionSaving] = useState(false);

  const [selectedAgentForCommission, setSelectedAgentForCommission] = useState<{ id: string, name: string } | null>(null);
  const [isAgentCommissionModalOpen, setIsAgentCommissionModalOpen] = useState(false);

  const isOwner = user.role === 'OWNER';

  useEffect(() => {
    fetchOrganization();
    if (isOwner) {
      fetchInvitations();
      fetchRoles();
      fetchCommissionConfig();
    }
  }, []);

  const fetchCommissionConfig = async () => {
    if (!user.organizationId) return;
    try {
      setIsCommissionLoading(true);
      const response = await organizationService.getCommissionConfig(user.organizationId);
      setCommissionConfig(response.data || {
        rentBuyerValue: 0,
        rentBuyerType: 'MULTIPLIER',
        rentSellerValue: 0,
        rentSellerType: 'MULTIPLIER',
        rentAgentValue: 0,
        rentAgentType: 'PERCENTAGE',
        saleBuyerValue: 0,
        saleBuyerType: 'PERCENTAGE',
        saleSellerValue: 0,
        saleSellerType: 'PERCENTAGE',
        saleAgentValue: 0,
        saleAgentType: 'PERCENTAGE',
        paymentTiming: '',
        paymentMethod: ''
      });
    } catch (err) {
      console.error('Failed to fetch commission config', err);
    } finally {
      setIsCommissionLoading(false);
    }
  };

  const handleSaveCommission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user.organizationId) return;
    setIsCommissionSaving(true);
    try {
      await organizationService.updateCommissionConfig(user.organizationId, commissionConfig);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to save commission settings.'));
    } finally {
      setIsCommissionSaving(false);
    }
  };

  const fetchRoles = async () => {
    if (!user.organizationId) return;
    try {
      const response = await organizationService.getRoles(user.organizationId);
      const data = response.data;
      let rolesData = [];
      if (Array.isArray(data)) {
        rolesData = data;
      } else if (data && typeof data === 'object' && Array.isArray((data as any).items)) {
        rolesData = (data as any).items;
      }
      setRoles(rolesData);
      if (rolesData.length > 0 && !inviteCustomRoleId) {
        const agentRole = rolesData.find((r: any) => r.name === 'Agent');
        if (agentRole) setInviteCustomRoleId(agentRole.id);
        else setInviteCustomRoleId(rolesData[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch roles', err);
    }
  };

  const handleUpdateMemberRole = async (membershipId: string, customRoleId: string) => {
    if (!user.organizationId) return;
    try {
      await organizationService.updateMemberRole(user.organizationId, membershipId, customRoleId);
      fetchOrganization(false); // Refresh to see changes without full loader
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to update member role.'));
    }
  };

  const fetchInvitations = async () => {
    if (!user.organizationId) return;
    try {
      const response = await organizationService.getInvitations(user.organizationId);
      const data = response.data;
      if (Array.isArray(data)) {
        setInvitations(data);
      } else if (data && typeof data === 'object' && Array.isArray((data as any).items)) {
        setInvitations((data as any).items);
      } else {
        setInvitations([]);
      }
    } catch (err) {
      console.error('Failed to fetch invitations', err);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !user.organizationId || !inviteCustomRoleId) return;

    setIsInviting(true);
    setInviteError(null);
    setInviteSuccess(false);

    try {
      await organizationService.invite(user.organizationId, inviteEmail, 'AGENT', inviteCustomRoleId);
      setInviteEmail('');
      setInviteSuccess(true);
      fetchInvitations();
      fetchSubscription(); // Refresh seat usage
      setTimeout(() => setInviteSuccess(false), 3000);
    } catch (err: any) {
      setInviteError(getErrorMessage(err, 'Failed to send invitation.'));
    } finally {
      setIsInviting(false);
    }
  };

  const handleCancelInvite = async (id: string) => {
    if (!user.organizationId) return;
    try {
      await organizationService.cancelInvitation(user.organizationId, id);
      setInvitations(prev => (Array.isArray(prev) ? prev : []).filter(inv => inv.id !== id));
    } catch (err) {
      console.error('Failed to cancel invitation', err);
    }
  };

  const [resendingId, setResendingId] = useState<string | null>(null);

  const handleResendInvite = async (id: string) => {
    if (!user.organizationId) return;
    setResendingId(id);
    setInviteError(null);
    setInviteSuccess(false);

    try {
      await organizationService.resendInvitation(user.organizationId, id);
      setInviteSuccess(true);
      fetchInvitations();
      setTimeout(() => setInviteSuccess(false), 3000);
    } catch (err: any) {
      setInviteError(getErrorMessage(err, 'Failed to resend invitation.'));
    } finally {
      setResendingId(null);
    }
  };

  const fetchOrganization = async (showLoader = true) => {
    try {
      if (showLoader) setIsLoading(true);
      const response = await organizationService.get();
      const orgData = response.data;
      setOrg(orgData);

      // Update global user state if current user's membership changed
      if (onUserUpdate && orgData.memberships) {
        const myMembership = orgData.memberships.find((m: any) => m.userId === user.id);
        if (myMembership) {
          const updatedUser = {
            ...user,
            memberships: user.memberships?.map((m: any) =>
              m.organizationId === orgData.id ? { ...m, ...myMembership } : m
            ) || [myMembership]
          };
          onUserUpdate(updatedUser);
        }
      }

      setFormData({
        name: orgData.name || '',
        email: orgData.email || '',
        phone: orgData.phone || '',
        website: orgData.website || '',
        address: orgData.address || '',
        logo: orgData.logo || '',
        accentColor: orgData.accentColor || 'EMERALD',
        defaultTheme: orgData.defaultTheme || 'LIGHT',
        ownerId: orgData.ownerId || ''
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
      const newLogoUrl = response.data.logo;
      setFormData(prev => ({ ...prev, logo: newLogoUrl }));

      // Update global user state if possible
      if (onUserUpdate) {
        const updatedUser = { ...user };
        if (Array.isArray(updatedUser.memberships) && updatedUser.memberships?.[0]?.organization) {
          updatedUser.memberships[0].organization.logo = newLogoUrl;
          onUserUpdate(updatedUser);
        }
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Logo upload failed', err);
      setError(err.response?.data?.message || 'Failed to upload logo.');
    } finally {
      setIsUploading(false);
    }
  };

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Organization name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Website must start with http:// or https://';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner || !hasChanges) return;

    if (!validate()) return;
    setIsSaving(true);
    setError(null);

    try {
      const { logo: _unusedLogo, ...updateData } = formData;
      const response = await organizationService.update(updateData);
      const updatedOrg = response.data;
      setOrg(updatedOrg);

      // Sync local theme if accent color changed
      if (updateData.accentColor && updateData.accentColor !== org?.accentColor) {
        setAccentColor(updateData.accentColor);
      }

      // Update global user state
      if (onUserUpdate) {
        const updatedUser = { ...user };
        if (Array.isArray(updatedUser.memberships) && updatedUser.memberships?.[0]) {
          updatedUser.memberships[0].organization = {
            ...updatedUser.memberships[0].organization,
            ...updatedOrg
          };
          onUserUpdate(updatedUser);
        }
      }

      setOrg(updatedOrg);
      setSuccess(true);
      setHasChanges(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Update failed', err);
      setError(getErrorMessage(err, 'Failed to update organization. Please try again.'));
      const backendErrors = mapBackendErrors(err);
      if (Object.keys(backendErrors).length > 0) {
        setErrors(backendErrors);
      }
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
    <>
      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '5rem' }}>
        <header>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.25rem' }}>Organization Settings</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Manage your organization's profile, team, and permissions.</p>
        </header>

        {!isOwner && (
          <div style={warningBannerStyle}>
            <ShieldAlert size={20} />
            <span>Viewing only. Only the organization owner can modify these settings.</span>
          </div>
        )}

        {/* Tabs Navigation */}
        <Tabs
          variant="underline"
          activeTab={activeTab}
          onTabChange={(id) => setActiveTab(id as any)}
          fullWidth={isMobileOrTablet}
          options={[
            { id: 'general', label: 'General', icon: Settings },
            { id: 'team', label: 'Team', icon: Users },
            ...(isOwner ? [
              { id: 'roles', label: 'Roles & Permissions', icon: Shield },
              { id: 'commission', label: 'Commission', icon: HandCoins },
              { id: 'subscription', label: 'Subscription', icon: CreditCard }
            ] : [])
          ]}
        />

        {activeTab === 'general' && (
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
                    backgroundImage: formData.logo ? `url("${getImageUrl(formData.logo)}")` : 'none',
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
                      <Camera size={18} color='white' />
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.25rem' }}>Theme & Appearance</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>Customize how your organization and shared listings look.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <ColorPicker
                    label="Primary Accent Color"
                    value={formData.accentColor}
                    onChange={(hex) => {
                      if (!isOwner) return;
                      setFormData(prev => ({ ...prev, accentColor: hex }));
                      setAccentColor(hex); // Real-time preview
                      setHasChanges(true);
                    }}
                    disabled={!isOwner}
                  />

                  <div style={{ height: '1px', backgroundColor: 'var(--color-border)', opacity: 0.5 }} />

                  <div>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.75rem' }}>
                      Default Sharing Theme
                    </label>
                    <div style={{ display: 'flex', gap: '1rem', flexDirection: isMobileOrTablet ? 'column' : 'row' }}>
                      <Button
                        type="button"
                        variant={formData.defaultTheme === 'LIGHT' ? 'primary' : 'outline'}
                        onClick={() => {
                          if (!isOwner) return;
                          setFormData(prev => ({ ...prev, defaultTheme: 'LIGHT' }));
                          setHasChanges(true);
                        }}
                        disabled={!isOwner}
                        leftIcon={<Sun size={18} />}
                        style={{ flex: 1 }}
                      >
                        Light Mode
                      </Button>
                      <Button
                        type="button"
                        variant={formData.defaultTheme === 'DARK' ? 'primary' : 'outline'}
                        onClick={() => {
                          if (!isOwner) return;
                          setFormData(prev => ({ ...prev, defaultTheme: 'DARK' }));
                          setHasChanges(true);
                        }}
                        disabled={!isOwner}
                        leftIcon={<Moon size={18} />}
                        style={{ flex: 1 }}
                      >
                        Dark Mode
                      </Button>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.75rem', fontStyle: 'italic' }}>
                      This theme will be applied by default when anyone views your shared properties publicly.
                    </p>
                  </div>
                </div>
              </div>

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
                  onChange={(e) => {
                    handleChange(e);
                    if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                  }}
                  placeholder="Company Name"
                  icon={Building}
                  disabled={!isOwner}
                  error={errors.name}
                />

                <div className="grid grid-2" style={{ gap: '1.25rem', alignItems: 'flex-start' }}>
                  <Input
                    label="Public Email"
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      handleChange(e);
                      if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                    }}
                    placeholder="contact@company.com"
                    icon={Mail}
                    disabled={!isOwner}
                    error={errors.email}
                  />
                  <PhoneInput
                    id="phone"
                    label="Phone Number"
                    value={formData.phone}
                    onChange={(val) => {
                      if (!isOwner) return;
                      setFormData(prev => ({ ...prev, phone: val }));
                      setHasChanges(true);
                    }}
                  />
                </div>

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
                  <Button
                    type="submit"
                    disabled={isSaving || !hasChanges}
                    isLoading={isSaving}
                    leftIcon={<Save size={18} />}
                    style={{
                      width: isMobileOrTablet ? '100%' : 'fit-content',
                      minWidth: '180px',
                      alignSelf: isMobileOrTablet ? 'stretch' : 'flex-end',
                      marginTop: '1rem'
                    }}
                  >
                    Save Changes
                  </Button>
                )}
              </form>
            </div>
          </div>
        )}

        {activeTab === 'team' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Team Members Section */}
            <div className="card" style={{ padding: isMobileOrTablet ? '1.5rem' : '2rem' }}>
              <div style={{
                marginBottom: '2rem',
                display: 'flex',
                flexDirection: isMobileOrTablet ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobileOrTablet ? 'flex-start' : 'flex-end',
                gap: '1.5rem'
              }}>
                <div style={{ width: '100%' }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Organization Team</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', maxWidth: '500px', lineHeight: '1.5' }}>
                    Manage your organization's members, roles, and performance-based commission structures.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: isMobileOrTablet ? '100%' : 'auto', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--color-text-muted)',
                    backgroundColor: 'rgba(var(--color-primary-rgb), 0.05)',
                    padding: '0.5rem 0.8rem',
                    borderRadius: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    flexShrink: 0
                  }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-primary)' }} />
                    {(Array.isArray(org?.memberships) ? org.memberships : []).length} Active Members
                  </span>
                  {subscription && (
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: ((Array.isArray(org?.memberships) ? org.memberships.length : 0) + (Array.isArray(invitations) ? invitations.length : 0)) >= (subscription.seats || 0) ? '#EF4444' : 'var(--color-text-muted)',
                      backgroundColor: ((Array.isArray(org?.memberships) ? org.memberships.length : 0) + (Array.isArray(invitations) ? invitations.length : 0)) >= (subscription.seats || 0) ? 'rgba(239, 68, 68, 0.1)' : 'var(--color-bg-hover)',
                      padding: '0.5rem 0.8rem',
                      borderRadius: '2rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      flexShrink: 0,
                      border: ((Array.isArray(org?.memberships) ? org.memberships.length : 0) + (Array.isArray(invitations) ? invitations.length : 0)) >= (subscription.seats || 0) ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid var(--color-border)'
                    }}>
                      <Target size={14} />
                      { (Array.isArray(org?.memberships) ? org.memberships.length : 0) + (Array.isArray(invitations) ? invitations.length : 0) } / { subscription.seats } Seats Occupied
                    </span>
                  )}
                  {isOwner && (
                    <Button
                      onClick={() => {
                        const inviteSection = document.getElementById('invite-section');
                        if (inviteSection) inviteSection.scrollIntoView({ behavior: 'smooth' });
                      }}
                      disabled={subscription ? ((Array.isArray(org?.memberships) ? org.memberships.length : 0) + (Array.isArray(invitations) ? invitations.length : 0)) >= (subscription.seats || 0) : false}
                      leftIcon={<UserPlus size={18} />}
                      style={{ flex: isMobileOrTablet ? 1 : 'none' }}
                    >
                      Invite
                    </Button>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>
                  <Users size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Find team members..."
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem 0.875rem 3rem',
                    borderRadius: '0.75rem',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text)',
                    fontSize: '0.875rem',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                  }}
                  disabled
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {(Array.isArray(org?.memberships) ? org.memberships : []).map((membership: any) => (
                  <div key={membership.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '1.25rem 1.5rem',
                    borderRadius: '1rem',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                    flexWrap: isMobileOrTablet ? 'wrap' : 'nowrap',
                    gap: '1.5rem',
                    transition: 'all 0.2s ease',
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    {/* Avatar & User Info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: isMobileOrTablet ? '1 1 100%' : '1' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)',
                        backgroundImage: membership.user.avatar ? `url("${getImageUrl(membership.user.avatar)}")` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--color-primary)',
                        fontWeight: 700,
                        border: '1px solid var(--color-border)',
                        flexShrink: 0
                      }}>
                        {!membership.user.avatar && (membership.user.firstName?.[0] || membership.user.email[0]).toUpperCase()}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                        <span style={{ fontSize: '1rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {membership.user.firstName} {membership.user.lastName}
                          {membership.user.id === user.id && <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-primary)', backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)', padding: '0.15rem 0.5rem', borderRadius: '2rem', textTransform: 'uppercase' }}>You</span>}
                        </span>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{membership.user.email}</span>
                      </div>
                    </div>

                    {/* Role Dropdown */}
                    <div style={{ width: isMobileOrTablet ? '100%' : '200px', flexShrink: 0 }}>
                      {isOwner && membership.user.id !== user.id ? (
                        <CustomSelect
                          value={membership.customRoleId || ''}
                          onChange={(val) => handleUpdateMemberRole(membership.id, val as string)}
                          options={(Array.isArray(roles) ? roles : []).map(r => ({ value: r.id, label: r.name }))}
                          style={{ minHeight: '2.75rem', borderRadius: '0.75rem' }}
                        // Label is removed here
                        />
                      ) : (
                        <div style={{ height: '2.75rem', display: 'flex', alignItems: 'center', padding: '0 1rem', borderRadius: '0.75rem', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                          {membership.customRole?.name || membership.role}
                        </div>
                      )}
                    </div>

                    {/* Actions: Badge & Commission */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: 'auto', flexShrink: 0 }}>
                      {/* Role Badge */}
                      <span style={{
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        color: membership.role === 'OWNER' ? '#D97706' : '#6B7280',
                        padding: '0.25rem 0.625rem',
                        backgroundColor: membership.role === 'OWNER' ? 'rgba(217, 119, 6, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                        borderRadius: '0.375rem',
                        letterSpacing: '0.05em',
                        border: membership.role === 'OWNER' ? '1px solid rgba(217, 119, 6, 0.2)' : '1px solid rgba(107, 114, 128, 0.2)'
                      }}>
                        {membership.role}
                      </span>

                      {/* Commission Button (Only for Agents) */}
                      {(membership.role === 'AGENT' || membership.role === 'OWNER') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedAgentForCommission({
                              id: membership.user.id,
                              name: `${membership.user.firstName} ${membership.user.lastName}`
                            });
                            setIsAgentCommissionModalOpen(true);
                          }}
                          leftIcon={<HandCoins size={16} />}
                          style={{ height: '2.75rem', padding: '0 1rem', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '0.75rem', fontSize: '0.8125rem', fontWeight: 700 }}
                        >
                          Commission
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Team & Invitations Section */}
            {isOwner && (
              <div className="card" style={{ padding: isMobileOrTablet ? '1.5rem' : '2rem' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.25rem' }}>Invite Members</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Send an email invitation to join your organization.</p>
                </div>

                {subscription && ((Array.isArray(org?.memberships) ? org.memberships.length : 0) + (Array.isArray(invitations) ? invitations.length : 0)) >= (subscription.seats || 0) && (
                  <div style={{ 
                    padding: '1rem 1.25rem', 
                    backgroundColor: 'rgba(239, 68, 68, 0.05)', 
                    borderRadius: '0.75rem', 
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    flexWrap: 'wrap'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#B91C1C', fontSize: '0.875rem', fontWeight: 600 }}>
                      <AlertCircle size={20} />
                      <span>All purchased seats are currently occupied.</span>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setActiveTab('subscription')}
                      style={{ borderColor: 'rgba(239, 68, 68, 0.3)', color: '#B91C1C' }}
                    >
                      Purchase More Seats
                    </Button>
                  </div>
                )}

                <form onSubmit={handleInvite} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexDirection: isMobileOrTablet ? 'column' : 'row', alignItems: isMobileOrTablet ? 'stretch' : 'flex-end' }}>
                  <div style={{ flex: 1 }}>
                    <Input
                      id="inviteEmail"
                      placeholder="colleague@example.com"
                      type="email"
                      label="Email Address"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      icon={Mail}
                      style={{ marginBottom: 0 }}
                    />
                  </div>
                  <div style={{ width: isMobileOrTablet ? '100%' : '240px' }}>
                    <CustomSelect
                      label="Initial Role"
                      value={inviteCustomRoleId}
                      onChange={(val) => setInviteCustomRoleId(val as string)}
                      options={(Array.isArray(roles) ? roles : []).map(r => ({ value: r.id, label: r.name }))}
                      placeholder="Select a role"
                    />
                  </div>
                    <Button
                    type="submit"
                    disabled={isInviting || !inviteEmail.trim() || !inviteCustomRoleId || (subscription ? ((Array.isArray(org?.memberships) ? org.memberships.length : 0) + (Array.isArray(invitations) ? invitations.length : 0)) >= (subscription.seats || 0) : false)}
                    isLoading={isInviting}
                    leftIcon={<UserPlus size={18} />}
                    style={{ height: '2.75rem', padding: '0 1.5rem' }}
                  >
                    Send Invite
                  </Button>
                </form>

                <AnimatePresence>
                  {inviteSuccess && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ ...successAlertStyle, marginBottom: '1.5rem' }}>
                      <CheckCircle2 size={18} /> Invitation sent successfully!
                    </motion.div>
                  )}
                  {inviteError && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ ...errorAlertStyle, marginBottom: '1.5rem' }}>
                      <AlertCircle size={18} /> {inviteError}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={16} className="text-primary" /> Pending Invitations ({(Array.isArray(invitations) ? invitations : []).length})
                  </h4>

                  {(Array.isArray(invitations) ? invitations : []).length === 0 ? (
                    <div style={{
                      padding: '3rem 2rem',
                      textAlign: 'center',
                      backgroundColor: 'rgba(var(--color-primary-rgb), 0.02)',
                      borderRadius: '1rem',
                      border: '1px dashed var(--color-border)'
                    }}>
                      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>No pending invitations at the moment.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {(Array.isArray(invitations) ? invitations : []).map((inv) => (
                        <div key={inv.id} style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '1.25rem 1.5rem',
                          backgroundColor: 'var(--color-surface)',
                          borderRadius: '1rem',
                          border: '1px solid var(--color-border)',
                          gap: '1.5rem',
                          boxShadow: 'var(--shadow-sm)'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 1 }}>
                            <div style={{
                              width: '48px',
                              height: '48px',
                              borderRadius: '12px',
                              backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)',
                              color: 'var(--color-primary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: '1px solid var(--color-border)',
                              flexShrink: 0
                            }}>
                              <Mail size={20} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                              <span style={{ fontSize: '1rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{inv.email}</span>
                              <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                                Sent {new Date(inv.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          {/* Role Indicator - Styled like the active list */}
                          <div style={{ width: isMobileOrTablet ? '100%' : '200px', flexShrink: 0 }}>
                            <div style={{ height: '2.75rem', display: 'flex', alignItems: 'center', padding: '0 1rem', borderRadius: '0.75rem', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                              {inv.customRole?.name || inv.role}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: 'auto', flexShrink: 0 }}>
                            <span style={{
                              fontSize: '0.65rem',
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              color: '#6B7280',
                              padding: '0.25rem 0.625rem',
                              backgroundColor: 'rgba(107, 114, 128, 0.1)',
                              borderRadius: '0.375rem',
                              letterSpacing: '0.05em',
                              border: '1px solid rgba(107, 114, 128, 0.2)'
                            }}>
                              INVITED
                            </span>

                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <Button
                                variant="ghost"
                                onClick={() => handleResendInvite(inv.id)}
                                disabled={resendingId === inv.id}
                                isLoading={resendingId === inv.id}
                                size="sm"
                                style={{
                                  color: 'var(--color-primary)',
                                  fontSize: '0.75rem',
                                  fontWeight: 800,
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.025em'
                                }}
                              >
                                Resend
                              </Button>
                              <Button
                                variant="ghost"
                                onClick={() => handleCancelInvite(inv.id)}
                                size="sm"
                                style={{
                                  color: '#EF4444', // Red-500
                                  fontSize: '0.75rem',
                                  fontWeight: 800,
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.025em'
                                }}
                              >
                                Revoke
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'roles' && (
          <RolesManagement
            roles={Array.isArray(roles) ? roles : []}
            organizationId={org?.id || ''}
            onUpdate={() => {
              fetchRoles();
              fetchOrganization(false);
            }}
            isMobileOrTablet={isMobileOrTablet}
          />
        )}

        {activeTab === 'commission' && (
          isCommissionLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
              <Loader2 size={32} className="animate-spin" color="var(--color-primary)" />
            </div>
          ) : (
            <form onSubmit={handleSaveCommission} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div className="card" style={{ padding: '2rem' }}>
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ padding: '0.5rem', borderRadius: '0.5rem', backgroundColor: 'rgba(5, 150, 105, 0.1)', color: 'var(--color-primary)' }}>
                      <HandCoins size={20} />
                    </div>
                    Sale Commission Defaults
                  </h3>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Set the default commission percentages for all sales deals in the organization.</p>
                </div>

                <div className="grid grid-2" style={{ gap: '1.5rem', marginBottom: '2rem' }}>
                  <CommissionInput
                    label="Buyer Side"
                    value={commissionConfig?.saleBuyerValue}
                    type={commissionConfig?.saleBuyerType ?? 'PERCENTAGE'}
                    onChange={(val, type) => setCommissionConfig({ ...commissionConfig, saleBuyerValue: val, saleBuyerType: type })}
                    placeholder="2.00"
                    helperText="Default commission from the buyer's side for Sale deals."
                  />
                  <CommissionInput
                    label="Seller Side"
                    value={commissionConfig?.saleSellerValue}
                    type={commissionConfig?.saleSellerType ?? 'PERCENTAGE'}
                    onChange={(val, type) => setCommissionConfig({ ...commissionConfig, saleSellerValue: val, saleSellerType: type })}
                    placeholder="2.00"
                    helperText="Default commission from the seller's side for Sale deals."
                  />
                </div>

                <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '2rem 0', opacity: 0.5 }} />

                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>Agent Split Range</h4>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>The default share range for agents on sale deals.</p>
                </div>

                <div style={{ maxWidth: '400px' }}>
                  <CommissionInput
                    label="Agent Baseline Split"
                    value={commissionConfig?.saleAgentValue}
                    type={commissionConfig?.saleAgentType ?? 'PERCENTAGE'}
                    onChange={(val, type) => setCommissionConfig({ ...commissionConfig, saleAgentValue: val, saleAgentType: type })}
                    placeholder="1.00"
                    helperText="Default portion of the deal commission given to the agent."
                  />
                </div>
              </div>

              <div className="card" style={{ padding: '2rem' }}>
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ padding: '0.5rem', borderRadius: '0.5rem', backgroundColor: 'rgba(5, 150, 105, 0.1)', color: 'var(--color-primary)' }}>
                      <Clock size={20} />
                    </div>
                    Rent Commission Defaults
                  </h3>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Set default commission rules for rental deals based on month count.</p>
                </div>

                <div className="grid grid-2" style={{ gap: '1.5rem', marginBottom: '2rem' }}>
                  <CommissionInput
                    label="Buyer Side"
                    value={commissionConfig?.rentBuyerValue}
                    type={commissionConfig?.rentBuyerType ?? 'MULTIPLIER'}
                    onChange={(val, type) => setCommissionConfig({ ...commissionConfig, rentBuyerValue: val, rentBuyerType: type })}
                    placeholder="1.00"
                    helperText="Default commission from the buyer's side for Rent deals (e.g. 1 month)."
                  />
                  <CommissionInput
                    label="Seller Side"
                    value={commissionConfig?.rentSellerValue}
                    type={commissionConfig?.rentSellerType ?? 'MULTIPLIER'}
                    onChange={(val, type) => setCommissionConfig({ ...commissionConfig, rentSellerValue: val, rentSellerType: type })}
                    placeholder="1.00"
                    helperText="Default commission from the seller's side for Rent deals."
                  />
                </div>

                <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '2rem 0', opacity: 0.5 }} />

                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>Agent Split Share</h4>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>Percentage of the total commission months that goes to the agent.</p>
                </div>

                <div style={{ maxWidth: '400px' }}>
                  <CommissionInput
                    label="Agent Baseline Split"
                    value={commissionConfig?.rentAgentValue}
                    type={commissionConfig?.rentAgentType ?? 'PERCENTAGE'}
                    onChange={(val, type) => setCommissionConfig({ ...commissionConfig, rentAgentValue: val, rentAgentType: type })}
                    placeholder="0.50"
                    helperText="Default portion of the deal commission given to the agent."
                  />
                </div>
              </div>

              <div className="card" style={{ padding: '2rem' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.25rem' }}>Payment & Payout</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Configure payout terms and methods.</p>
                </div>

                <div className="grid grid-2" style={{ gap: '1.5rem' }}>
                  <Select
                    label="Payment Timing"
                    id="paymentTiming"
                    value={commissionConfig?.paymentTiming || ''}
                    onChange={(e) => setCommissionConfig({ ...commissionConfig, paymentTiming: e.target.value })}
                    options={[
                      { value: '', label: 'Select timing...' },
                      { value: 'UPFRONT', label: 'Upfront on Deal Signing' },
                      { value: 'CLOSING', label: 'On Deal Closing' },
                      { value: 'MILESTONE', label: 'Vesting/Milestone Based' }
                    ]}
                  />
                  <Select
                    label="Preferred Payout Method"
                    id="paymentMethod"
                    value={commissionConfig?.paymentMethod || ''}
                    onChange={(e) => setCommissionConfig({ ...commissionConfig, paymentMethod: e.target.value })}
                    options={[
                      { value: '', label: 'Select method...' },
                      { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
                      { value: 'CHECK', label: 'Check' },
                      { value: 'INTERNAL_CREDIT', label: 'Internal Credit' }
                    ]}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <Button
                  type="submit"
                  isLoading={isCommissionSaving}
                  disabled={isCommissionSaving}
                  leftIcon={<Save size={18} />}
                  fullWidth={isMobileOrTablet}
                  style={{ minWidth: isMobileOrTablet ? '100% ' : '180px' }}
                >
                  Save Commission Settings
                </Button>
              </div>
            </form>
          )
        )}

        {activeTab === 'subscription' && isOwner && (
          <SubscriptionPage user={user} hideHeader={true} />
        )}
      </div>

      <AgentCommissionModal
        isOpen={isAgentCommissionModalOpen}
        onClose={() => setIsAgentCommissionModalOpen(false)}
        agentId={selectedAgentForCommission?.id || ''}
        agentName={selectedAgentForCommission?.name || ''}
      />
    </>
  );
};

// Sub-component for Role Management
const RolesManagement: React.FC<{ roles: any[], organizationId: string, onUpdate: () => void, isMobileOrTablet: boolean }> = ({ roles, organizationId, onUpdate, isMobileOrTablet }) => {
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    level: 1,
    permissions: [] as string[]
  });

  const permissionGroups = [
    { name: 'Leads', permissions: ['LEADS_VIEW', 'LEADS_VIEW_ALL', 'LEADS_CREATE', 'LEADS_EDIT', 'LEADS_DELETE', 'LEADS_EXPORT'] },
    { name: 'Contacts', permissions: ['CONTACTS_VIEW', 'CONTACTS_VIEW_ALL', 'CONTACTS_CREATE', 'CONTACTS_EDIT', 'CONTACTS_DELETE', 'CONTACTS_EXPORT'] },
    { name: 'Properties', permissions: ['PROPERTIES_VIEW', 'PROPERTIES_VIEW_ALL', 'PROPERTIES_CREATE', 'PROPERTIES_EDIT', 'PROPERTIES_DELETE'] },
    { name: 'Deals', permissions: ['DEALS_VIEW', 'DEALS_VIEW_ALL', 'DEALS_CREATE', 'DEALS_EDIT', 'DEALS_DELETE'] },
    { name: 'Offers', permissions: ['OFFERS_VIEW_ALL'] },
    { name: 'Tasks', permissions: ['TASKS_VIEW', 'TASKS_VIEW_ALL', 'TASKS_CREATE', 'TASKS_ASSIGN_ANY', 'TASKS_EDIT', 'TASKS_DELETE'] },
    { name: 'Calendar', permissions: ['CALENDAR_VIEW', 'CALENDAR_VIEW_ALL', 'CALENDAR_EDIT'] },
    { name: 'Team', permissions: ['TEAM_VIEW', 'TEAM_INVITE', 'TEAM_EDIT_ROLES', 'TEAM_REMOVE_MEMBER'] },
    { name: 'Organization', permissions: ['ORG_SETTINGS_EDIT', 'ORG_BILLING_VIEW'] },
    { name: 'Dashboard', permissions: ['DASHBOARD_VIEW', 'DASHBOARD_VIEW_ALL'] },
    { name: 'Payouts', permissions: ['PAYOUTS_VIEW', 'PAYOUTS_VIEW_ALL', 'PAYOUTS_MANAGE'] }
  ];

  const handleEditRole = (role: any) => {
    setSelectedRole(role);
    setRoleForm({
      name: role.name,
      description: role.description || '',
      level: role.level || 1,
      permissions: Array.isArray(role.permissions) ? role.permissions : []
    });
    setIsEditing(true);
  };

  const handleCreateNew = () => {
    setSelectedRole(null);
    setRoleForm({
      name: '',
      description: '',
      level: 1,
      permissions: [
        'LEADS_VIEW', 'CONTACTS_VIEW', 'PROPERTIES_VIEW', 'DEALS_VIEW', 'DASHBOARD_VIEW'
      ]
    });
    setIsEditing(true);
  };

  const togglePermission = (perm: string) => {
    setRoleForm(prev => ({
      ...prev,
      permissions: (Array.isArray(prev.permissions) ? prev.permissions : []).includes(perm)
        ? prev.permissions.filter(p => p !== perm)
        : [...(Array.isArray(prev.permissions) ? prev.permissions : []), perm]
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleForm.name.trim()) return;

    setIsSaving(true);
    setError(null);

    try {
      if (selectedRole) {
        await organizationService.updateRole(organizationId, selectedRole.id, roleForm as any);
      } else {
        await organizationService.createRole(organizationId, roleForm as any);
      }
      onUpdate();
      setIsEditing(false);
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to save role.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!window.confirm('Are you sure you want to delete this role? This cannot be undone.')) return;
    try {
      await organizationService.deleteRole(organizationId, roleId);
      onUpdate();
    } catch (err: any) {
      alert(getErrorMessage(err, 'Failed to delete role.'));
    }
  };

  const formatPermLabel = (perm: string, groupName: string) => {
    const label = perm.replace(`${groupName.toUpperCase()}_`, '').replace(/_/g, ' ').toLowerCase();
    return label.charAt(0).toUpperCase() + label.slice(1);
  };

  if (isEditing) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
      >
        <header style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            style={{
              padding: '0.5rem', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--color-surface)', border: '1px solid var(--color-border)', cursor: 'pointer', color: 'var(--color-text)', flexShrink: 0
            }}
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.025em' }}>
              {selectedRole?.isSystem ? 'Role Details' : selectedRole ? 'Edit Role' : 'Create New Role'}
            </h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
              {selectedRole?.isSystem ? 'System roles have fixed permissions.' : 'Configure name and granular permissions for this role.'}
            </p>
          </div>
        </header>

        {error && (
          <div style={{ ...errorAlertStyle }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleSave} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: isMobileOrTablet ? '1.5rem' : '2.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            <Input
              label="Role Name"
              required
              disabled={selectedRole?.isSystem}
              value={roleForm.name}
              onChange={e => setRoleForm({ ...roleForm, name: e.target.value })}
              placeholder="e.g. Sales Manager"
            />
            <Select
              label="Hierarchy Level"
              id="level"
              name="level"
              disabled={selectedRole?.isSystem}
              value={roleForm.level}
              onChange={e => setRoleForm({ ...roleForm, level: parseInt(e.target.value) })}
              options={[
                { value: 1, label: 'Level 1 - Support / Junior' },
                { value: 2, label: 'Level 2 - Standard Agent' },
                { value: 3, label: 'Level 3 - Manager / Admin' },
              ]}
            />
          </div>
          <Input
            label="Description"
            disabled={selectedRole?.isSystem}
            value={roleForm.description}
            onChange={e => setRoleForm({ ...roleForm, description: e.target.value })}
            placeholder="What can people with this role do?"
          />

          <div style={{ backgroundColor: 'var(--color-bg)', padding: isMobileOrTablet ? '1rem' : '1.5rem', borderRadius: '1rem', border: '1px solid var(--color-border)' }}>
            <label style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-text)', display: 'block', marginBottom: '1.5rem' }}>Role Permissions</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {permissionGroups.map(group => (
                <div key={group.name}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <h5 style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-primary)', letterSpacing: '0.05em' }}>{group.name}</h5>
                    <div style={{ height: '1px', flex: 1, backgroundColor: 'var(--color-border)', opacity: 0.5 }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
                    {group.permissions.map(perm => (
                      <div
                        key={perm}
                        onClick={() => !selectedRole?.isSystem && togglePermission(perm)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8125rem', cursor: selectedRole?.isSystem ? 'default' : 'pointer',
                          color: (Array.isArray(roleForm.permissions) ? roleForm.permissions : []).includes(perm) ? 'var(--color-text)' : 'var(--color-text-muted)',
                          padding: '0.5rem', borderRadius: '0.5rem', backgroundColor: (Array.isArray(roleForm.permissions) ? roleForm.permissions : []).includes(perm) ? 'rgba(var(--color-primary-rgb), 0.03)' : 'transparent',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div
                          style={{
                            width: '20px', height: '20px', borderRadius: '6px', border: `2px solid ${(Array.isArray(roleForm.permissions) ? roleForm.permissions : []).includes(perm) ? 'var(--color-primary)' : 'var(--color-border)'}`,
                            backgroundColor: (Array.isArray(roleForm.permissions) ? roleForm.permissions : []).includes(perm) ? 'var(--color-primary)' : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease', flexShrink: 0
                          }}
                        >
                          {(Array.isArray(roleForm.permissions) ? roleForm.permissions : []).includes(perm) && <Check size={14} color="white" strokeWidth={3} />}
                        </div>
                        <span style={{ fontWeight: (Array.isArray(roleForm.permissions) ? roleForm.permissions : []).includes(perm) ? 600 : 400 }}>
                          {formatPermLabel(perm, group.name)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {!selectedRole?.isSystem && (
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexDirection: isMobileOrTablet ? 'column' : 'row' }}>
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)} fullWidth>Cancel</Button>
              <Button type="submit" disabled={isSaving} fullWidth isLoading={isSaving} leftIcon={<Save size={18} />}>
                Save Role Configuration
              </Button>
            </div>
          )}
        </form>
      </motion.div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.25rem' }}>Custom Roles</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Define granular permissions for your team members.</p>
        </div>
        <Button onClick={handleCreateNew} leftIcon={<Plus size={18} />}>
          Create Role
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {(Array.isArray(roles) ? roles : []).map(role => (
          <div key={role.id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <h4 style={{ fontSize: '1.0625rem', fontWeight: 700 }}>{role.name}</h4>
                  <span style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--color-primary)', backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)', padding: '0.125rem 0.5rem', borderRadius: '2rem', textTransform: 'uppercase', letterSpacing: '0.025em' }}>
                    Lvl {role.level || 1}
                  </span>
                  {role.isSystem && (
                    <span style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--color-warning)', backgroundColor: 'rgba(217, 119, 6, 0.1)', padding: '0.125rem 0.5rem', borderRadius: '2rem', textTransform: 'uppercase', letterSpacing: '0.025em' }}>
                      System
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{role.description || 'No description provided.'}</p>
              </div>
              {!role.isSystem && (
                <Button
                  variant="ghost"
                  onClick={() => handleDeleteRole(role.id)}
                  style={{ color: 'var(--color-text-muted)', padding: '0.25rem', minWidth: 'auto', height: 'auto' }}
                >
                  <Trash2 size={18} />
                </Button>
              )}
            </div>

            <div style={{ flex: 1, marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Shield size={14} className="text-primary" />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text)', textTransform: 'uppercase', letterSpacing: '0.025em' }}>
                  {(Array.isArray(role.permissions) ? role.permissions : []).length} Permissions
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                {(Array.isArray(role.permissions) ? role.permissions : []).slice(0, 6).map((p: string) => {
                  const label = p.split('_').join(' ').toLowerCase();
                  return (
                    <span key={p} style={{ fontSize: '0.6875rem', fontWeight: 500, backgroundColor: 'var(--color-bg)', padding: '0.25rem 0.625rem', borderRadius: '0.375rem', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}>
                      {label.charAt(0).toUpperCase() + label.slice(1)}
                    </span>
                  );
                })}
                {(Array.isArray(role.permissions) ? role.permissions : []).length > 6 && (
                  <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-primary)', backgroundColor: 'rgba(var(--color-primary-rgb), 0.05)', padding: '0.25rem 0.625rem', borderRadius: '0.375rem' }}>
                    {(Array.isArray(role.permissions) ? role.permissions : []).length - 6} More
                  </span>
                )}
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => handleEditRole(role)}
              fullWidth
            >
              {role.isSystem ? 'View Permissions' : 'Edit Role & Permissions'}
            </Button>
          </div>
        ))}
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
