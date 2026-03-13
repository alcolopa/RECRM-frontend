import { useState, useEffect } from 'react';
import { Search, Loader2, Users, UserPlus } from 'lucide-react';
import { type Contact, ContactType, contactService } from '../api/contacts';
import ContactCard from './ContactCard';
import ContactForm from './ContactForm';
import ContactDetails from './ContactDetails';

interface ContactsViewProps {
  organizationId: string;
}

const ContactsView: React.FC<ContactsViewProps> = ({ organizationId }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'list' | 'form' | 'details'>('list');
  const [editingContact, setEditingContact] = useState<Contact | undefined>(undefined);
  const [viewingContact, setViewingContact] = useState<Contact | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | ContactType>('ALL');

  const fetchContacts = async () => {
    setIsLoading(true);
    try {
      const response = await contactService.getAll(organizationId);
      setContacts(response.data);
    } catch (err) {
      console.error('Failed to fetch contacts', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [organizationId]);

  const handleSave = async (data: Partial<Contact>) => {
    try {
      if (editingContact) {
        await contactService.update(editingContact.id, data);
      } else {
        await contactService.create({ ...data, organizationId });
      }
      setView('list');
      setEditingContact(undefined);
      fetchContacts();
    } catch (err) {
      console.error('Failed to save contact', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await contactService.delete(id);
        if (viewingContact?.id === id) {
          setView('list');
          setViewingContact(undefined);
        }
        fetchContacts();
      } catch (err) {
        console.error('Failed to delete contact', err);
      }
    }
  };

  const filteredContacts = contacts.filter(c => {
    if (!searchQuery) return true;
    const matchesSearch =
      c.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filterType === 'ALL' || c.type === filterType;

    return matchesSearch && matchesFilter;
  });

  if (view === 'form') {
    return (
      <ContactForm
        contact={editingContact}
        onSave={handleSave}
        onCancel={() => {
          setView('list');
          setEditingContact(undefined);
        }}
        organizationId={organizationId}
      />
    );
  }

  if (view === 'details' && viewingContact) {
    return (
      <ContactDetails
        contact={viewingContact}
        onBack={() => {
          setView('list');
          setViewingContact(undefined);
        }}
        onEdit={(c) => {
          setEditingContact(c);
          setView('form');
        }}
        onDelete={handleDelete}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.25rem' }}>Contacts</h1>
          <p style={{ color: 'var(--secondary)' }}>Manage your buyers and sellers in one place.</p>
        </div>
        <button
          onClick={() => setView('form')}
          className="btn btn-primary"
          style={{ gap: '0.5rem' }}
        >
          <UserPlus size={20} /> Add Contact
        </button>
      </header>

      {/* Filters & Search */}
      <div className="card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
          <Search size={18} color="var(--secondary)" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            id="searchQuery"
            name="searchQuery"
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.625rem 1rem 0.625rem 2.5rem',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              fontSize: '0.875rem',
              outline: 'none'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setFilterType('ALL')}
            className={`btn ${filterType === 'ALL' ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
          >
            All
          </button>
          <button
            onClick={() => setFilterType(ContactType.BUYER)}
            className={`btn ${filterType === ContactType.BUYER ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
          >
            Buyers
          </button>
          <button
            onClick={() => setFilterType(ContactType.SELLER)}
            className={`btn ${filterType === ContactType.SELLER ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
          >
            Sellers
          </button>
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <Loader2 size={40} className="animate-spin" color="var(--primary)" />
        </div>
      ) : filteredContacts.length > 0 ? (
        <div className="grid grid-2 grid-3" style={{ gap: '1.5rem' }}>
          {filteredContacts.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onView={(c) => {
                setViewingContact(c);
                setView('details');
              }}
              onEdit={(c) => {
                setEditingContact(c);
                setView('form');
              }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '4rem', height: '4rem', borderRadius: '50%', backgroundColor: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)' }}>
            <Users size={32} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>No contacts found</h3>
          <p style={{ color: 'var(--secondary)', maxWidth: '400px' }}>
            {searchQuery || filterType !== 'ALL'
              ? 'No contacts match your current filters.'
              : 'You haven\'t added any contacts yet. Start by adding your first buyer or seller.'}
          </p>
          {!searchQuery && filterType === 'ALL' && (
            <button onClick={() => setView('form')} className="btn btn-primary">
              Add Your First Contact
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ContactsView;
