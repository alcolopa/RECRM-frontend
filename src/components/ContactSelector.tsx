import React, { useState, useEffect } from 'react';
import { Search, Plus, User, Mail, Phone, X, Loader2 } from 'lucide-react';
import { type Contact, contactService, ContactType } from '../api/contacts';
import { Input } from './Input';
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

  useEffect(() => {
    const fetchContacts = async () => {
      setIsLoading(true);
      try {
        const response = await contactService.getAll(organizationId, restrictType);
        setContacts(response.data);
        
        if (selectedContactId) {
          const contact = response.data.find(c => c.id === selectedContactId || c.sellerProfile?.id === selectedContactId);
          if (contact) setSelectedContact(contact);
        }
      } catch (err) {
        console.error('Failed to fetch contacts', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContacts();
  }, [organizationId, selectedContactId]);

  const filteredContacts = contacts.filter(c => {
    const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || c.email?.toLowerCase().includes(query) || c.phone.includes(query);
  });

  const handleSelect = (contact: Contact) => {
    setSelectedContact(contact);
    // Use sellerProfile ID if it exists, otherwise we'll handle creation in backend or elsewhere
    // But for the DTO we need sellerProfileId
    if (contact.sellerProfile) {
      onSelect(contact.sellerProfile.id, contact);
    } else {
      // If no seller profile, we might need a way to create one or the backend handles it via contactId
      // Actually the schema has sellerProfileId on Property.
      // So we should ideally ensure the contact has a seller profile.
      onSelect('', contact); // Signal that we need to create a profile or handle it
    }
    setIsDropdownOpen(false);
    setSearchQuery('');
  };
  const handleCreateContact = async (data: Partial<Contact>) => {
    try {
      setError(null);
      const response = await contactService.create(data);
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
    <div style={{ position: 'relative', width: '100%' }}>
      <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.5rem', display: 'block' }}>
        {label}
      </label>

      {selectedContact ? (
        <div className="card" style={{ 
          padding: '0.75rem 1rem', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-primary)',
          borderRadius: 'var(--radius)',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flex: 1 }}>
            <div style={{ 
              width: '2.5rem', 
              height: '2.5rem', 
              borderRadius: '50%', 
              background: 'rgba(var(--color-primary-rgb), 0.1)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'var(--color-primary)',
              flexShrink: 0
            }}>
              <User size={20} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ 
                fontWeight: 600, 
                whiteSpace: 'nowrap', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis' 
              }}>
                {selectedContact.firstName} {selectedContact.lastName}
              </div>
              <div style={{ 
                fontSize: '0.75rem', 
                color: 'var(--color-text-muted)', 
                display: 'flex', 
                flexDirection: window.innerWidth <= 480 ? 'column' : 'row',
                gap: window.innerWidth <= 480 ? '0.125rem' : '0.5rem',
                overflow: 'hidden'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  <Mail size={12} /> {selectedContact.email || 'No email'}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  <Phone size={12} /> {selectedContact.phone}
                </span>
              </div>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              setSelectedContact(null);
              onSelect('');
            }}
            aria-label="Clear selection"
            style={{ padding: '0.25rem', flexShrink: 0 }}
          >
            <X size={18} />
          </Button>
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Input
                id="contact-search"
                name="contact-search"
                placeholder="Search existing contacts..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                icon={Search}
              />
            </div>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                if (onNewContactRequested) {
                  onNewContactRequested();
                } else {
                  setIsAddingNew(true);
                }
              }}
              leftIcon={<Plus size={18} />}
            >
              New
            </Button>
          </div>

          <AnimatePresence>
            {isDropdownOpen && searchQuery && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={dropdownStyle}
              >
                {isLoading ? (
                  <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <Loader2 size={24} className="animate-spin" color="var(--color-primary)" />
                  </div>
                ) : filteredContacts.length > 0 ? (
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {filteredContacts.map(contact => (
                      <div 
                        key={contact.id} 
                        style={itemStyle}
                        onClick={() => handleSelect(contact)}
                      >
                        <div style={{ fontWeight: 600 }}>{contact.firstName} {contact.lastName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          {contact.email} • {contact.phone}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    <p>No contacts found.</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setIsAddingNew(true);
                        setIsDropdownOpen(false);
                      }}
                      style={{ marginTop: '0.5rem' }}
                    >
                      <Plus size={16} /> Create "{searchQuery}"
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}


      {/* Modal for adding new contact */}
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

const dropdownStyle: React.CSSProperties = {
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  background: 'var(--color-bg)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius)',
  boxShadow: 'var(--shadow-lg)',
  zIndex: 1000,
  marginTop: '0.5rem',
  overflow: 'hidden'
};

const itemStyle: React.CSSProperties = {
  padding: '0.75rem 1rem',
  cursor: 'pointer',
  transition: 'background 0.2s',
  borderBottom: '1px solid var(--color-border)',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem'
};
