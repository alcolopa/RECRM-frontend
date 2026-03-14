import React from 'react';
import { 
  ArrowLeft, 
  Edit2, 
  Trash2, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  DollarSign, 
  Target, 
  Calendar, 
  Tag,
  Home,
  FileText
} from 'lucide-react';
import { type Contact, ContactType, ContactStatus } from '../api/contacts';
import Button from './Button';

interface ContactDetailsProps {
  contact: Contact;
  onBack: () => void;
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => void;
}

const ContactDetails: React.FC<ContactDetailsProps> = ({ contact, onBack, onEdit, onDelete }) => {
  const initials = `${contact.firstName?.[0] || ''}${contact.lastName?.[0] || ''}`;
  const fullName = `${contact.firstName} ${contact.lastName}`;

  const getStatusColor = (status: ContactStatus) => {
    switch (status) {
      case ContactStatus.NEW: return 'var(--color-primary)';
      case ContactStatus.QUALIFIED: return 'var(--color-success)';
      case ContactStatus.ACTIVE: return 'var(--color-primary-hover)';
      case ContactStatus.LOST: return 'var(--color-error)';
      default: return 'var(--color-text-muted)';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatEnum = (value?: string) => {
    if (!value) return 'N/A';
    return value.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      {/* Header Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button 
          variant="outline"
          size="sm"
          onClick={onBack}
          leftIcon={<ArrowLeft size={16} />}
        >
          Back to Contacts
        </Button>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button 
            variant="primary"
            size="sm"
            onClick={() => onEdit(contact)}
            leftIcon={<Edit2 size={16} />}
          >
            Edit
          </Button>
          <Button 
            variant="outline"
            size="sm"
            onClick={() => onDelete(contact.id)}
            leftIcon={<Trash2 size={16} />}
            style={{ color: 'var(--color-error)', borderColor: 'rgba(220, 38, 38, 0.1)' }}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Profile Header Card */}
      <div className="card" style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem' }}>
        <div style={{ 
          width: '6rem', 
          height: '6rem', 
          borderRadius: '50%', 
          backgroundColor: contact.type === ContactType.BUYER ? 'rgba(5, 150, 105, 0.1)' : 'rgba(217, 119, 6, 0.1)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: contact.type === ContactType.BUYER ? 'var(--color-primary)' : 'var(--color-warning)',
          fontWeight: 700,
          fontSize: '2rem',
          border: '4px solid var(--color-surface)',
          boxShadow: 'var(--shadow-md)'
        }}>
          {initials}
        </div>
        
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>{fullName}</h1>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <span style={{ 
              fontSize: '0.75rem', 
              padding: '0.25rem 0.75rem', 
              borderRadius: '1rem', 
              backgroundColor: contact.type === ContactType.BUYER ? 'rgba(5, 150, 105, 0.1)' : 'rgba(217, 119, 6, 0.1)',
              color: contact.type === ContactType.BUYER ? 'var(--color-primary)' : 'var(--color-warning)',
              fontWeight: 700,
              textTransform: 'uppercase'
            }}>
              {contact.type}
            </span>
            <span style={{ 
              fontSize: '0.75rem', 
              padding: '0.25rem 0.75rem', 
              borderRadius: '1rem', 
              backgroundColor: 'var(--color-bg)',
              color: getStatusColor(contact.status),
              fontWeight: 700,
              textTransform: 'uppercase',
              border: `1px solid var(--color-border)`
            }}>
              {contact.status}
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Grid for Main Content */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '1.5rem', '@media (min-width: 768px)': { gridTemplateColumns: '1fr 1fr' } } as React.CSSProperties}>
        
        {/* Contact Information */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem', marginBottom: '0.5rem' }}>
            Contact Information
          </h3>
          
          <div style={infoRowStyle}>
            <div style={iconBoxStyle}><Mail size={18} color="var(--color-primary)" /></div>
            <div>
              <div style={labelStyle}>Email</div>
              <div style={valueStyle}>{contact.email || 'Not provided'}</div>
            </div>
          </div>
          
          <div style={infoRowStyle}>
            <div style={iconBoxStyle}><Phone size={18} color="var(--color-primary)" /></div>
            <div>
              <div style={labelStyle}>Phone Number</div>
              <div style={valueStyle}>{contact.phone}</div>
            </div>
          </div>
          
          {contact.secondaryPhone && (
            <div style={infoRowStyle}>
              <div style={iconBoxStyle}><Phone size={18} color="var(--color-primary)" /></div>
              <div>
                <div style={labelStyle}>Secondary Phone</div>
                <div style={valueStyle}>{contact.secondaryPhone}</div>
              </div>
            </div>
          )}

          {contact.leadSource && (
            <div style={infoRowStyle}>
              <div style={iconBoxStyle}><Target size={18} color="var(--color-primary)" /></div>
              <div>
                <div style={labelStyle}>Lead Source</div>
                <div style={valueStyle}>{contact.leadSource}</div>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Profile Information (Buyer/Seller) */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem', marginBottom: '0.5rem' }}>
            {contact.type === ContactType.BUYER ? 'Buyer Profile' : 'Seller Profile'}
          </h3>
          
          {contact.type === ContactType.BUYER && contact.buyerProfile ? (
            <>
              <div style={infoRowStyle}>
                <div style={iconBoxStyle}><DollarSign size={18} color="var(--color-primary)" /></div>
                <div>
                  <div style={labelStyle}>Budget Range</div>
                  <div style={valueStyle}>
                    {contact.buyerProfile.minBudget || contact.buyerProfile.maxBudget ? 
                      `${formatCurrency(contact.buyerProfile.minBudget)} - ${formatCurrency(contact.buyerProfile.maxBudget)}` : 
                      'Not specified'}
                  </div>
                </div>
              </div>
              
              <div style={infoRowStyle}>
                <div style={iconBoxStyle}><Briefcase size={18} color="var(--color-primary)" /></div>
                <div>
                  <div style={labelStyle}>Financing Details</div>
                  <div style={valueStyle}>
                    {contact.buyerProfile.preApproved ? 'Pre-approved' : 'Not pre-approved'}
                    {contact.buyerProfile.financingType && ` • ${formatEnum(contact.buyerProfile.financingType)}`}
                  </div>
                </div>
              </div>

              <div style={infoRowStyle}>
                <div style={iconBoxStyle}><Home size={18} color="var(--color-primary)" /></div>
                <div>
                  <div style={labelStyle}>Property Preferences</div>
                  <div style={valueStyle}>
                    {contact.buyerProfile.propertyTypes?.length > 0 ? 
                      contact.buyerProfile.propertyTypes.map(formatEnum).join(', ') : 'Any'}
                    {contact.buyerProfile.minBedrooms && ` • ${contact.buyerProfile.minBedrooms}+ beds`}
                  </div>
                </div>
              </div>

              <div style={infoRowStyle}>
                <div style={iconBoxStyle}><MapPin size={18} color="var(--color-primary)" /></div>
                <div>
                  <div style={labelStyle}>Preferred Locations</div>
                  <div style={valueStyle}>
                    {contact.buyerProfile.preferredCities?.length > 0 ? 
                      contact.buyerProfile.preferredCities.join(', ') : 'Not specified'}
                  </div>
                </div>
              </div>
            </>
          ) : contact.type === ContactType.SELLER && contact.sellerProfile ? (
            <>
              <div style={infoRowStyle}>
                <div style={iconBoxStyle}><DollarSign size={18} color="var(--color-primary)" /></div>
                <div>
                  <div style={labelStyle}>Minimum Price Expected</div>
                  <div style={valueStyle}>{formatCurrency(contact.sellerProfile.minimumPrice)}</div>
                </div>
              </div>
              
              <div style={infoRowStyle}>
                <div style={iconBoxStyle}><Target size={18} color="var(--color-primary)" /></div>
                <div>
                  <div style={labelStyle}>Ready to List?</div>
                  <div style={valueStyle}>{contact.sellerProfile.readyToList ? 'Yes' : 'No'}</div>
                </div>
              </div>
              
              <div style={infoRowStyle}>
                <div style={iconBoxStyle}><Calendar size={18} color="var(--color-primary)" /></div>
                <div>
                  <div style={labelStyle}>Selling Timeline</div>
                  <div style={valueStyle}>{formatEnum(contact.sellerProfile.sellingTimeline)}</div>
                </div>
              </div>
              
              <div style={infoRowStyle}>
                <div style={iconBoxStyle}><FileText size={18} color="var(--color-primary)" /></div>
                <div>
                  <div style={labelStyle}>Reason For Selling</div>
                  <div style={valueStyle}>{formatEnum(contact.sellerProfile.reasonForSelling)}</div>
                </div>
              </div>
            </>
          ) : (
            <div style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '1rem' }}>
              No detailed profile information recorded yet.
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: Notes & Meta */}
      <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem', marginBottom: '0.5rem' }}>
          Additional Details
        </h3>
        
        {contact.tags && contact.tags.length > 0 && (
          <div style={infoRowStyle}>
            <div style={iconBoxStyle}><Tag size={18} color="var(--color-primary)" /></div>
            <div>
              <div style={labelStyle}>Tags</div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                {contact.tags.map((tag, idx) => (
                  <span key={idx} style={{ 
                    fontSize: '0.75rem', 
                    padding: '0.15rem 0.5rem', 
                    borderRadius: 'var(--radius)', 
                    backgroundColor: 'var(--color-bg)',
                    color: 'var(--color-text-muted)',
                    border: '1px solid var(--color-border)'
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        <div style={infoRowStyle}>
          <div style={iconBoxStyle}><FileText size={18} color="var(--color-primary)" /></div>
          <div style={{ width: '100%' }}>
            <div style={labelStyle}>Notes</div>
            <div style={{ 
              ...valueStyle, 
              backgroundColor: 'var(--color-bg)', 
              padding: '1rem', 
              borderRadius: 'var(--radius)',
              marginTop: '0.5rem',
              minHeight: '4rem',
              whiteSpace: 'pre-wrap'
            }}>
              {contact.notes || 'No notes added yet.'}
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed var(--color-border)', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
          <div><span style={{ fontWeight: 600 }}>Created:</span> {formatDate(contact.createdAt)}</div>
          <div><span style={{ fontWeight: 600 }}>Last Updated:</span> {formatDate(contact.updatedAt)}</div>
          {contact.lastContactedAt && (
             <div><span style={{ fontWeight: 600 }}>Last Contacted:</span> {formatDate(contact.lastContactedAt)}</div>
          )}
        </div>

      </div>
      
    </div>
  );
};

const infoRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '1rem'
};

const iconBoxStyle: React.CSSProperties = {
  width: '2.5rem',
  height: '2.5rem',
  borderRadius: '0.5rem',
  backgroundColor: 'rgba(5, 150, 105, 0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  fontWeight: 600,
  color: 'var(--color-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.025em',
  marginBottom: '0.125rem'
};

const valueStyle: React.CSSProperties = {
  fontSize: '0.9375rem',
  color: 'var(--color-text)',
  fontWeight: 500,
  wordBreak: 'break-word'
};

export default ContactDetails;
