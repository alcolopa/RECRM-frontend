import { 
  Mail, 
  Phone, 
  Edit2, 
  Trash2, 
  UserCheck, 
  TrendingUp,
  MapPin,
  Tag,
  ChevronLeft,
  ExternalLink,
  Clock,
  User as UserIcon
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { type Lead, LeadStatus } from '../api/leads';
import Button from './Button';
import { usePermissions } from '../utils/permissions';
import { type UserProfile, Permission } from '../api/users';

interface LeadDetailsProps {
  lead: Lead;
  user: UserProfile;
  onBack: () => void;
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => void;
  onConvert: (lead: Lead) => void;
}

const LeadDetails: React.FC<LeadDetailsProps> = ({ lead, user, onBack, onEdit, onDelete, onConvert }) => {
  const permissions = usePermissions(user);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const initials = `${lead.firstName?.[0] || ''}${lead.lastName?.[0] || ''}`;
  const fullName = `${lead.firstName} ${lead.lastName}`;

  const getStatusColor = (status: LeadStatus) => {
    switch (status) {
      case LeadStatus.NEW: return 'var(--color-primary)';
      case LeadStatus.CONTACTED: return 'var(--color-warning)';
      case LeadStatus.QUALIFIED: return 'var(--color-success)';
      case LeadStatus.LOST: return 'var(--color-error)';
      default: return 'var(--color-text-muted)';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            type="button" 
            onClick={onBack}
            style={{ 
              padding: '0.5rem', 
              borderRadius: '50%', 
              width: '40px', 
              height: '40px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              cursor: 'pointer',
              color: 'var(--color-text)'
            }}
          >
            <ChevronLeft size={24} />
          </button>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Lead Details</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {permissions.can(Permission.LEADS_EDIT) && (
            <Button variant="outline" onClick={() => onEdit(lead)} leftIcon={<Edit2 size={18} />}>
              Edit
            </Button>
          )}
          {!lead.convertedAt && permissions.can(Permission.LEADS_EDIT) && (
            <Button variant="primary" onClick={() => onConvert(lead)} leftIcon={<TrendingUp size={18} />}>
              Convert to Contact
            </Button>
          )}
          {permissions.can(Permission.LEADS_DELETE) && (
            <Button variant="outline" onClick={() => onDelete(lead.id)} style={{ color: 'var(--color-error)' }} leftIcon={<Trash2 size={18} />}>
              Delete
            </Button>
          )}
        </div>
      </header>

      <div className="grid grid-3" style={{ gap: isMobile ? '1.5rem' : '2rem', alignItems: 'start' }}>
        {/* Main Info Card */}
        <div className="card" style={{ gridColumn: isMobile ? 'span 1' : 'span 2', padding: isMobile ? '1.25rem' : '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <div style={{ 
              width: '5rem', 
              height: '5rem', 
              borderRadius: '50%', 
              backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'var(--color-primary)',
              fontWeight: 700,
              fontSize: '2rem',
              border: '3px solid white',
              boxShadow: 'var(--shadow-md)'
            }}>
              {initials}
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>{fullName}</h2>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <span style={{ 
                  fontSize: '0.8125rem', 
                  padding: '0.25rem 0.75rem', 
                  borderRadius: '1rem', 
                  backgroundColor: 'var(--color-bg)',
                  color: getStatusColor(lead.status),
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  border: `1px solid var(--color-border)`
                }}>
                  {lead.status}
                </span>
                {lead.source && (
                  <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Tag size={14} /> From {lead.source}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div style={{ height: '1px', backgroundColor: 'var(--color-border)' }} />

          <section>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} color="var(--color-primary)" /> Interests & Preferences
            </h3>
            <div className="grid grid-3" style={{ gap: '1.5rem' }}>
              <div style={detailItemStyle}>
                <span style={detailLabelStyle}>Property Type</span>
                <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{lead.propertyType?.toLowerCase() || 'Any'}</span>
              </div>
              <div style={detailItemStyle}>
                <span style={detailLabelStyle}>Budget</span>
                <span style={{ fontWeight: 600 }}>{lead.budget ? `$${Number(lead.budget).toLocaleString()}` : 'Not Specified'}</span>
              </div>
              <div style={detailItemStyle}>
                <span style={detailLabelStyle}>Location</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
                  <MapPin size={14} /> {lead.preferredLocation || 'Anywhere'}
                </div>
              </div>
            </div>
          </section>

          {lead.notes && (
            <section>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem' }}>Internal Notes</h3>
              <div className="card" style={{ padding: '1.25rem', backgroundColor: 'var(--color-bg)', border: 'none' }}>
                <p style={{ whiteSpace: 'pre-wrap', color: 'var(--color-text)', lineHeight: 1.6 }}>{lead.notes}</p>
              </div>
            </section>
          )}

          {lead.convertedAt && (
            <div style={{ 
              padding: '1.5rem', 
              borderRadius: 'var(--radius)', 
              backgroundColor: 'rgba(5, 150, 105, 0.05)',
              border: '1px solid var(--color-success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ color: 'var(--color-success)', backgroundColor: 'white', padding: '0.5rem', borderRadius: '50%' }}>
                  <UserCheck size={24} />
                </div>
                <div>
                  <h4 style={{ fontWeight: 700, color: 'var(--color-success)' }}>Successfully Converted</h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                    Converted on {new Date(lead.convertedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {lead.convertedContact && permissions.can(Permission.CONTACTS_VIEW) && (
                <Button variant="outline" size="sm" leftIcon={<ExternalLink size={14} />}>
                  View Contact
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Sidebar Info Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: isMobile ? '1.25rem' : '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Communication</h3>
            <div style={sidebarItemStyle}>
              <Mail size={18} color="var(--color-text-muted)" />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={detailLabelStyle}>Email</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{lead.email || 'N/A'}</span>
              </div>
            </div>
            <div style={sidebarItemStyle}>
              <Phone size={18} color="var(--color-text-muted)" />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={detailLabelStyle}>Phone</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{lead.phone || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: isMobile ? '1.25rem' : '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Management</h3>
            <div style={sidebarItemStyle}>
              <UserIcon size={18} color="var(--color-text-muted)" />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={detailLabelStyle}>Assigned Agent</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                  {lead.assignedUser ? `${lead.assignedUser.firstName} ${lead.assignedUser.lastName}` : 'Unassigned'}
                </span>
              </div>
            </div>
            <div style={sidebarItemStyle}>
              <Clock size={18} color="var(--color-text-muted)" />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={detailLabelStyle}>Created</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                  {new Date(lead.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const detailItemStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem'
};

const detailLabelStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  color: 'var(--color-text-muted)',
  textTransform: 'uppercase',
  fontWeight: 600,
  letterSpacing: '0.025em'
};

const sidebarItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '1rem'
};

export default LeadDetails;
