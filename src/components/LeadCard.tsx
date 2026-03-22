import { 
  Mail, 
  Phone, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  UserCheck,
  MapPin,
  DollarSign,
  TrendingUp,
  Tag
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Lead, LeadStatus } from '../api/leads';
import Button from './Button';

interface LeadCardProps {
  lead: Lead;
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => void;
  onView: (lead: Lead) => void;
  onConvert: (lead: Lead) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

const LeadCard: React.FC<LeadCardProps> = ({ lead, onEdit, onDelete, onView, onConvert, canEdit = true, canDelete = true }) => {
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
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card" 
      style={{ padding: '1.25rem', position: 'relative', cursor: 'pointer' }}
      onClick={(e) => {
        if (optionsRef.current && optionsRef.current.contains(e.target as Node)) return;
        onView(lead);
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ 
            width: '3.5rem', 
            height: '3.5rem', 
            borderRadius: '50%', 
            backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'var(--color-primary)',
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
                backgroundColor: 'var(--color-bg)',
                color: getStatusColor(lead.status),
                fontWeight: 700,
                textTransform: 'uppercase',
                border: `1px solid var(--color-border)`
              }}>
                {lead.status}
              </span>
              {lead.source && (
                <span style={{ 
                  fontSize: '0.7rem', 
                  padding: '0.15rem 0.5rem', 
                  borderRadius: '1rem', 
                  backgroundColor: 'rgba(var(--color-primary-rgb), 0.05)',
                  color: 'var(--color-text-muted)',
                  fontWeight: 600,
                }}>
                  {lead.source}
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={{ position: 'relative' }} ref={optionsRef}>
          <Button 
            variant="ghost"
            onClick={() => setShowOptions(!showOptions)}
            style={{ padding: '0.25rem' }}
            leftIcon={<MoreVertical size={20} />}
          />

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
                  backgroundColor: 'var(--color-surface)',
                  borderRadius: '0.5rem',
                  boxShadow: 'var(--shadow-lg)',
                  border: '1px solid var(--color-border)',
                  zIndex: 10,
                  padding: '0.25rem',
                  minWidth: '160px'
                }}
              >
                {!lead.convertedAt && (
                  <Button 
                    variant="ghost"
                    onClick={() => { setShowOptions(false); onConvert(lead); }}
                    style={{ ...optionButtonStyle, color: 'var(--color-success)' }}
                    leftIcon={<UserCheck size={16} />}
                  >
                    Convert to Contact
                  </Button>
                )}
                {canEdit && (
                  <Button 
                    variant="ghost"
                    onClick={() => { setShowOptions(false); onEdit(lead); }}
                    style={optionButtonStyle}
                    leftIcon={<Edit2 size={16} />}
                  >
                    Edit Lead
                  </Button>
                )}
                {canDelete && (
                  <>
                    <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '0.25rem 0' }} />
                    <Button 
                      variant="ghost"
                      onClick={() => { setShowOptions(false); onDelete(lead.id); }}
                      style={{ ...optionButtonStyle, color: 'var(--color-error)' }}
                      leftIcon={<Trash2 size={16} />}
                    >
                      Delete
                    </Button>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={infoRowStyle}>
          <Mail size={16} color="var(--color-text-muted)" />
          <span style={{ fontSize: '0.875rem', color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {lead.email || 'No email provided'}
          </span>
        </div>
        <div style={infoRowStyle}>
          <Phone size={16} color="var(--color-text-muted)" />
          <span style={{ fontSize: '0.875rem', color: 'var(--color-text)' }}>
            {lead.phone || 'No phone provided'}
          </span>
        </div>
      </div>

      {/* Quick Interests */}
      {(lead.budget || lead.propertyType || lead.preferredLocation) && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '0.75rem', 
          padding: '0.75rem', 
          backgroundColor: 'var(--color-bg)', 
          borderRadius: 'var(--radius)',
          marginBottom: '1.25rem'
        }}>
          {lead.budget && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem' }}>
              <DollarSign size={14} color="var(--color-primary)" />
              <span style={{ fontWeight: 600 }}>${Number(lead.budget).toLocaleString()}</span>
            </div>
          )}
          {lead.propertyType && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem' }}>
              <Tag size={14} color="var(--color-primary)" />
              <span style={{ textTransform: 'capitalize' }}>{lead.propertyType.toLowerCase()}</span>
            </div>
          )}
          {lead.preferredLocation && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', gridColumn: 'span 2' }}>
              <MapPin size={14} color="var(--color-primary)" />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.preferredLocation}</span>
            </div>
          )}
        </div>
      )}

      {!lead.convertedAt ? (
        <Button 
          variant="primary" 
          fullWidth
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onConvert(lead);
          }}
          leftIcon={<TrendingUp size={16} />}
        >
          Convert to Contact
        </Button>
      ) : (
        <div style={{ 
          textAlign: 'center', 
          padding: '0.625rem', 
          borderRadius: 'var(--radius)', 
          backgroundColor: 'rgba(5, 150, 105, 0.05)',
          color: 'var(--color-success)',
          fontSize: '0.8125rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem'
        }}>
          <UserCheck size={16} />
          Converted to Contact
        </div>
      )}
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
  color: 'var(--color-text)',
  cursor: 'pointer',
  textAlign: 'left',
  justifyContent: 'flex-start'
};

const infoRowStyle: React.CSSProperties = {
  display: 'flex', 
  alignItems: 'center', 
  gap: '0.75rem'
};

export default LeadCard;
