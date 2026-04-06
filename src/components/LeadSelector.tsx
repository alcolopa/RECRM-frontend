import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, User, X, Loader2, ChevronDown } from 'lucide-react';
import { type Lead, leadService } from '../api/leads';
import Button from './Button';
import { motion, AnimatePresence } from 'framer-motion';

interface LeadSelectorProps {
  organizationId: string;
  selectedLeadId?: string;
  onSelect: (lead: Lead | null) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  onNewLeadRequested?: () => void;
  disabled?: boolean;
  required?: boolean;
}

const LeadSelector: React.FC<LeadSelectorProps> = ({
  organizationId,
  selectedLeadId,
  onSelect,
  label = 'Lead',
  placeholder = 'Select a lead...',
  error,
  onNewLeadRequested,
  disabled = false,
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchLeads = async () => {
      setIsLoading(true);
      try {
        const response = await leadService.getAll(organizationId);
        const fetchedLeads = response.data.items || [];
        setLeads(fetchedLeads);

        if (selectedLeadId) {
          const lead = fetchedLeads.find((c: Lead) => c.id === selectedLeadId);
          if (lead) setSelectedLead(lead);
        } else {
          setSelectedLead(null);
        }
      } catch (err) {
        console.error('Failed to fetch leads', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (organizationId) {
      fetchLeads();
    }
  }, [organizationId, selectedLeadId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredLeads = leads.filter(lead =>
    `${lead.firstName} ${lead.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (lead: Lead) => {
    setSelectedLead(lead);
    onSelect(lead);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedLead(null);
    onSelect(null);
  };



  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', width: '100%' }}>
      {label && (
        <label style={{ 
          fontSize: '0.8125rem', 
          fontWeight: 700, 
          color: 'var(--color-text-muted)', 
          textTransform: 'uppercase', 
          letterSpacing: '0.025em',
          display: 'block'
        }}>
          {label}{required && '*'}
        </label>
      )}
      
      <div style={{ position: 'relative' }} ref={dropdownRef}>
        <div
          onClick={() => !isLoading && !disabled && setIsOpen(!isOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.625rem 0.875rem',
            borderRadius: 'var(--radius)',
            border: `1px solid ${error ? 'var(--color-error)' : (isOpen ? 'var(--color-primary)' : 'var(--color-border)')}`,
            background: 'var(--color-surface)',
            cursor: disabled ? 'not-allowed' : 'pointer',
            minHeight: '2.75rem',
            transition: 'all 0.2s ease',
            opacity: disabled ? 0.7 : 1,
            boxShadow: error ? '0 0 0 1px var(--color-error), 0 0 0 4px rgba(220, 38, 38, 0.1)' : (isOpen ? '0 0 0 1px var(--color-primary), 0 0 0 4px rgba(var(--color-primary-rgb), 0.1)' : 'none')
          }}
        >
          <div style={{ 
            width: '1.75rem', 
            height: '1.75rem', 
            borderRadius: '50%', 
            backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'var(--color-primary)',
            flexShrink: 0
          }}>
            {selectedLead ? <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{selectedLead.firstName[0]}{selectedLead.lastName[0]}</span> : <User size={14} />}
          </div>
          
          <div style={{ flex: 1, fontSize: '0.9375rem', color: selectedLead ? 'var(--color-text)' : 'var(--color-text-muted)', fontWeight: selectedLead ? 500 : 400 }}>
            {selectedLead ? `${selectedLead.firstName} ${selectedLead.lastName}` : placeholder}
          </div>

          {selectedLead && !disabled && (
            <X 
              size={16} 
              color="var(--color-text-muted)" 
              style={{ cursor: 'pointer' }} 
              onClick={handleClear} 
            />
          )}
          <ChevronDown size={18} color="var(--color-text-muted)" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '0.5rem',
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-xl)',
                zIndex: 1000,
                overflow: 'hidden'
              }}
            >
              <div style={{ padding: '0.75rem', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={16} color="var(--color-text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    autoFocus
                    placeholder="Search leads..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem 0.5rem 2.25rem',
                      borderRadius: 'var(--radius)',
                      border: '1px solid var(--color-border)',
                      fontSize: '0.875rem',
                      background: 'var(--color-surface)'
                    }}
                  />
                </div>
              </div>

              <div style={{ maxHeight: '250px', overflowY: 'auto' }} className="no-scrollbar">
                {isLoading ? (
                  <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <Loader2 size={24} className="animate-spin" color="var(--color-primary)" style={{ margin: '0 auto' }} />
                  </div>
                ) : filteredLeads.length > 0 ? (
                  filteredLeads.map(lead => (
                    <div
                      key={lead.id}
                      onClick={() => handleSelect(lead)}
                      style={{
                        padding: '0.75rem 1rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        transition: 'background 0.2s',
                        backgroundColor: selectedLeadId === lead.id ? 'rgba(var(--color-primary-rgb), 0.05)' : 'transparent'
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-bg)'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = selectedLeadId === lead.id ? 'rgba(var(--color-primary-rgb), 0.05)' : 'transparent'}
                    >
                      <div style={{ 
                        width: '2rem', 
                        height: '2rem', 
                        borderRadius: '50%', 
                        backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: 'var(--color-primary)',
                        fontSize: '0.8125rem',
                        fontWeight: 700
                      }}>
                        {lead.firstName[0]}{lead.lastName[0]}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{lead.firstName} {lead.lastName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {lead.email || lead.phone}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                    No leads found matching "{searchQuery}"
                  </div>
                )}
              </div>

              <div style={{ padding: '0.75rem', borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)' }}>
                <Button 
                  fullWidth 
                  size="sm" 
                  variant="outline" 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onNewLeadRequested) {
                      onNewLeadRequested();
                    }
                    setIsOpen(false);
                  }}
                  leftIcon={<Plus size={16} />}
                >
                  Add New Lead
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {error && <span style={{ fontSize: '0.75rem', color: 'var(--color-error)', fontWeight: 600 }}>{error}</span>}
    </div>
  );
};

export default LeadSelector;
