import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, User, X, Loader2, ChevronDown } from 'lucide-react';
import { type Contact, contactService, ContactType } from '../api/contacts';
import Button from './Button';
import { motion, AnimatePresence } from 'framer-motion';
import ContactForm from './ContactForm';
import Modal from './Modal';
import { AlertCircle } from 'lucide-react';

interface ContactSelectorProps {
  organizationId: string;
  selectedContactId?: string;
  onSelect: (contactId: string, contact?: Contact) => void;
  label?: string;
  restrictType?: ContactType;
  onNewContactRequested?: () => void;
}

const ContactSelector: React.FC<ContactSelectorProps> = ({ 
  organizationId, 
  selectedContactId, 
  onSelect,
  label = "Seller",
  restrictType,
  onNewContactRequested
}) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchContacts = async () => {
      setIsLoading(true);
      try {
        const response = await contactService.getAll(organizationId, restrictType);
        setContacts(response.data);
        
        if (selectedContactId) {
          const contact = response.data.find(c => c.id === selectedContactId || c.sellerProfile?.id === selectedContactId);
          if (contact) setSelectedContact(contact);
        } else {
          setSelectedContact(null);
        }
      } catch (err) {
        console.error('Failed to fetch contacts', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContacts();
  }, [organizationId, selectedContactId, restrictType]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredContacts = contacts.filter(c => {
    const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || c.email?.toLowerCase().includes(query) || c.phone.includes(query);
  });

  const handleSelect = (contact: Contact) => {
    setSelectedContact(contact);
    if (contact.sellerProfile) {
      onSelect(contact.sellerProfile.id, contact);
    } else {
      onSelect('', contact);
    }
    setIsDropdownOpen(false);
    setSearchQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedContact(null);
    onSelect('');
  };

  const handleCreateContact = async (data: Partial<Contact>) => {
    try {
      setError(null);
      const response = await contactService.create({ ...data, organizationId });
      const newContact = response.data;
      setContacts(prev => [newContact, ...prev]);
      handleSelect(newContact);
      setIsAddingNew(false);
    } catch (err) {
      console.error('Failed to create contact', err);
      setError('Failed to create contact. Please try again.');
    }
  };

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', width: '100%', position: 'relative' }}>
      {label && (
        <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)' }}>
          {label}
        </label>
      )}

      {selectedContact ? (
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--color-primary)',
            background: 'rgba(var(--color-primary-rgb), 0.05)',
            minHeight: '2.75rem',
          }}
        >
          <div style={{ 
            width: '1.75rem', 
            height: '1.75rem', 
            borderRadius: '50%', 
            background: 'rgba(var(--color-primary-rgb), 0.1)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'var(--color-primary)',
            flexShrink: 0
          }}>
            <User size={14} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--color-text)' }}>
              {selectedContact.firstName} {selectedContact.lastName}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted-foreground)' }}>
            <X 
              size={16} 
              onClick={handleClear}
              style={{ cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-error)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted-foreground)')}
            />
            <ChevronDown size={18} />
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <div 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius)',
              border: `1px solid ${isDropdownOpen ? 'var(--color-primary)' : 'var(--color-border)'}`,
              background: 'var(--color-surface)',
              cursor: 'pointer',
              minHeight: '2.75rem',
              transition: 'all 0.2s ease'
            }}
          >
            <Search size={18} color="var(--muted-foreground)" />
            <span style={{ fontSize: '0.9375rem', color: 'var(--muted-foreground)' }}>Select contact...</span>
            <ChevronDown size={18} color="var(--muted-foreground)" style={{ marginLeft: 'auto', transform: isDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </div>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onNewContactRequested ? onNewContactRequested() : setIsAddingNew(true)}
            leftIcon={<Plus size={18} />}
            style={{ height: '2.75rem' }}
          >
            New
          </Button>
        </div>
      )}

      <AnimatePresence>
        {isDropdownOpen && !selectedContact && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '0.5rem',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 1000,
              overflow: 'hidden'
            }}
          >
            <div style={{ padding: '0.75rem', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)' }}>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
                <input
                  autoFocus
                  type="text"
                  placeholder="Filter contacts..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onClick={e => e.stopPropagation()}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem 0.5rem 2.25rem',
                    borderRadius: '0.375rem',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface)',
                    outline: 'none',
                    fontSize: '0.8125rem',
                    color: 'var(--color-text)'
                  }}
                />
              </div>
            </div>

            <div style={{ maxHeight: '250px', overflowY: 'auto', padding: '0.25rem' }}>
              {isLoading ? (
                <div style={{ padding: '1.5rem', textAlign: 'center' }}>
                  <Loader2 size={20} className="animate-spin" color="var(--color-primary)" />
                </div>
              ) : filteredContacts.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {filteredContacts.map(contact => (
                    <div 
                      key={contact.id} 
                      onClick={(e) => { e.stopPropagation(); handleSelect(contact); }}
                      style={{
                        padding: '0.625rem 0.75rem',
                        borderRadius: '0.375rem',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.125rem'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(var(--color-primary-rgb), 0.05)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)' }}>{contact.firstName} {contact.lastName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                        {contact.email} {contact.email && contact.phone && '•'} {contact.phone}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--muted-foreground)', fontSize: '0.8125rem' }}>
                  <p>No contacts found.</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      if (onNewContactRequested) {
                        onNewContactRequested();
                      } else {
                        setIsAddingNew(true);
                      }
                      setIsDropdownOpen(false);
                    }}
                    style={{ marginTop: '0.5rem' }}
                  >
                    <Plus size={16} /> Create "{searchQuery}"
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Modal
        isOpen={isAddingNew}
        onClose={() => {
          setIsAddingNew(false);
          setError(null);
        }}
        title={`Add New ${restrictType === ContactType.SELLER ? 'Seller' : 'Contact'}`}
        maxWidth="800px"
      >
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '0.5rem',
                color: 'rgb(239, 68, 68)',
                fontSize: '0.875rem',
                marginBottom: '1rem',
                fontWeight: 500
              }}
            >
              <AlertCircle size={18} />
              {error}
            </motion.div>
          )}
        </AnimatePresence>
        
        <div style={{ padding: '0.5rem' }}>
          <ContactForm 
            organizationId={organizationId}
            onSave={handleCreateContact}
            onCancel={() => {
              setIsAddingNew(false);
              setError(null);
            }}
            fixedType={restrictType}
          />
        </div>
      </Modal>
    </div>
  );
};

export default ContactSelector;
