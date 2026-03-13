import { 
  Mail, 
  Phone, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  ExternalLink,
  Target,
  Briefcase,
  MapPin,
  DollarSign
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Contact, ContactType, ContactStatus } from '../api/contacts';

interface ContactCardProps {
  contact: Contact;
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => void;
  onView: (contact: Contact) => void;
}

const ContactCard: React.FC<ContactCardProps> = ({ contact, onEdit, onDelete, onView }) => {
  const [showOptions, setShowOptions] = useState(false);
  const optionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target as Node)) {
        setShowOptions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = `${contact.firstName?.[0] || ''}${contact.lastName?.[0] || ''}`;
  const fullName = `${contact.firstName} ${contact.lastName}`;

  const getStatusColor = (status: ContactStatus) => {
    switch (status) {
      case ContactStatus.NEW: return '#3b82f6';
      case ContactStatus.QUALIFIED: return '#10b981';
      case ContactStatus.ACTIVE: return '#8b5cf6';
      case ContactStatus.LOST: return '#ef4444';
      default: return 'var(--secondary)';
    }
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="card" 
      style={{ padding: '1.25rem', position: 'relative', cursor: 'pointer' }}
      onClick={(e) => {
        // Prevent clicking if the options menu was clicked
        if (optionsRef.current && optionsRef.current.contains(e.target as Node)) return;
        onView(contact);
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ 
            width: '3.5rem', 
            height: '3.5rem', 
            borderRadius: '50%', 
            backgroundColor: contact.type === ContactType.BUYER ? 'var(--primary-light)' : '#fef3c7', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: contact.type === ContactType.BUYER ? 'var(--primary)' : '#d97706',
            fontWeight: 700,
            fontSize: '1.25rem',
            border: '2px solid white',
            boxShadow: 'var(--shadow-sm)'
          }}>
            {initials}
          </div>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.25rem' }}>{fullName}</h3>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ 
                fontSize: '0.7rem', 
                padding: '0.15rem 0.5rem', 
                borderRadius: '1rem', 
                backgroundColor: contact.type === ContactType.BUYER ? 'var(--primary-light)' : '#fef3c7',
                color: contact.type === ContactType.BUYER ? 'var(--primary)' : '#d97706',
                fontWeight: 700,
                textTransform: 'uppercase'
              }}>
                {contact.type}
              </span>
              <span style={{ 
                fontSize: '0.7rem', 
                padding: '0.15rem 0.5rem', 
                borderRadius: '1rem', 
                backgroundColor: '#f3f4f6',
                color: getStatusColor(contact.status),
                fontWeight: 700,
                textTransform: 'uppercase',
                border: `1px solid ${getStatusColor(contact.status)}20`
              }}>
                {contact.status}
              </span>
            </div>
          </div>
        </div>

        <div style={{ position: 'relative' }} ref={optionsRef}>
          <button 
            onClick={() => setShowOptions(!showOptions)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary)', padding: '0.25rem' }}
          >
            <MoreVertical size={20} />
          </button>

          <AnimatePresence>
            {showOptions && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '100%',
                  backgroundColor: 'white',
                  borderRadius: '0.5rem',
                  boxShadow: 'var(--shadow-lg)',
                  border: '1px solid var(--border)',
                  zIndex: 10,
                  padding: '0.25rem',
                  minWidth: '140px'
                }}
              >
                <button 
                  onClick={() => { setShowOptions(false); onEdit(contact); }}
                  style={optionButtonStyle}
                >
                  <Edit2 size={16} /> Edit Contact
                </button>
                <button 
                  onClick={() => { setShowOptions(false); onDelete(contact.id); }}
                  style={{ ...optionButtonStyle, color: '#ef4444' }}
                >
                  <Trash2 size={16} /> Delete
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Profile Summary */}
      <div style={{ backgroundColor: 'var(--muted)', borderRadius: 'var(--radius)', padding: '0.75rem', marginBottom: '1rem' }}>
        {contact.type === ContactType.BUYER ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
              <DollarSign size={14} color="var(--secondary)" />
              <span style={{ fontWeight: 600 }}>Budget:</span>
              <span>{contact.buyerProfile?.maxBudget ? `$${Number(contact.buyerProfile.maxBudget).toLocaleString()}` : 'Not set'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
              <MapPin size={14} color="var(--secondary)" />
              <span style={{ fontWeight: 600 }}>Locations:</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {contact.buyerProfile?.preferredCities?.join(', ') || 'Anywhere'}
              </span>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
              <Target size={14} color="var(--secondary)" />
              <span style={{ fontWeight: 600 }}>Ready to List:</span>
              <span>{contact.sellerProfile?.readyToList ? 'Yes' : 'No'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
              <Briefcase size={14} color="var(--secondary)" />
              <span style={{ fontWeight: 600 }}>Timeline:</span>
              <span style={{ textTransform: 'capitalize' }}>
                {contact.sellerProfile?.sellingTimeline ? contact.sellerProfile.sellingTimeline.replace(/_/g, ' ').toLowerCase() : 'Not set'}
              </span>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
        <div style={infoRowStyle}>
          <Mail size={16} color="var(--secondary)" />
          <span style={{ fontSize: '0.875rem', color: 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {contact.email || 'No email provided'}
          </span>
        </div>
        <div style={infoRowStyle}>
          <Phone size={16} color="var(--secondary)" />
          <span style={{ fontSize: '0.875rem', color: 'var(--foreground)' }}>
            {contact.phone}
          </span>
        </div>
      </div>

      <button 
        className="btn btn-outline" 
        onClick={(e) => {
          e.stopPropagation();
          onView(contact);
        }}
        style={{ width: '100%', marginTop: '1.25rem', padding: '0.5rem', fontSize: '0.875rem', gap: '0.5rem' }}
      >
        <ExternalLink size={16} /> View Full Profile
      </button>
    </motion.div>
  );
};

const optionButtonStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  width: '100%',
  padding: '0.625rem 0.75rem',
  border: 'none',
  background: 'none',
  borderRadius: '0.375rem',
  fontSize: '0.875rem',
  color: 'var(--foreground)',
  cursor: 'pointer',
  textAlign: 'left'
};

const infoRowStyle: React.CSSProperties = {
  display: 'flex', 
  alignItems: 'center', 
  gap: '0.75rem'
};

export default ContactCard;
