import { useState, useEffect } from 'react';
import { Search, Loader2, Users, UserPlus } from 'lucide-react';
import { type Contact, ContactType, contactService } from '../api/contacts';
import { Input } from '../components/Input';
import ContactCard from '../components/ContactCard';
import ContactForm from '../components/ContactForm';
import ContactDetails from '../components/ContactDetails';
import Button from '../components/Button';
import ConfirmModal from '../components/ConfirmModal';
import { useNavigation } from '../contexts/NavigationContext';
import { usePermissions } from '../utils/permissions';
import { type UserProfile, Permission } from '../api/users';

interface ContactsViewProps {
  organizationId: string;
  user: UserProfile;
}

const ContactsView: React.FC<ContactsViewProps> = ({ organizationId, user }) => {
  const permissions = usePermissions(user);
  const { navigationState, navigate } = useNavigation();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'list' | 'form' | 'details'>('list');
  const [editingContact, setEditingContact] = useState<Contact | undefined>(undefined);
  const [viewingContact, setViewingContact] = useState<Contact | undefined>(undefined);
  const [initialStep, setInitialStep] = useState<number>(1);
  const [isIsolatedProfile, setIsIsolatedProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | ContactType>('ALL');
  const [deletingContactId, setDeletingContactId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
    
    // Handle prefill from navigation state
    if (navigationState.context === 'creating-seller' || navigationState.context === 'creating-buyer') {
      setView('form');
      if (navigationState.context === 'creating-seller') {
        setFilterType(ContactType.SELLER);
      } else {
        setFilterType(ContactType.BUYER);
      }
    }
  }, [organizationId, navigationState.context]);

  const handleSave = async (data: Partial<Contact>) => {
    try {
      let savedContact: Contact;
      if (editingContact) {
        const response = await contactService.update(editingContact.id, data, organizationId);
        savedContact = response.data;
      } else {
        const response = await contactService.create({ ...data, organizationId });
        savedContact = response.data;
      }

      if (navigationState.returnTo === 'properties' && navigationState.context === 'creating-seller') {
        // Ensure we have the sellerProfile ID
        let sellerProfileId = savedContact.sellerProfile?.id;
        
        if (!sellerProfileId) {
          try {
            const fullContact = await contactService.getById(savedContact.id, organizationId);
            sellerProfileId = fullContact.data.sellerProfile?.id;
          } catch (err) {
            console.error('Failed to fetch full contact for seller profile', err);
          }
        }

        navigate('properties', {
          ...navigationState,
          prefillData: { 
            ...navigationState.prefillData,
            newSellerProfileId: sellerProfileId 
          }
        });
      } else if (navigationState.returnTo === 'offers') {
        navigate('offers', {
          ...navigationState,
          prefillData: { 
            ...navigationState.prefillData,
            contactId: savedContact.id 
          }
        });
      } else {
        // Redirect to detail page for the newly created/updated contact
        setViewingContact(savedContact);
        setView('details');
        setEditingContact(undefined);
        setInitialStep(1);
        setIsIsolatedProfile(false);
        fetchContacts();
      }
    } catch (err) {
      console.error('Failed to save contact', err);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingContactId(id);
  };

  const confirmDelete = async () => {
    if (!deletingContactId) return;
    
    setIsDeleting(true);
    try {
      await contactService.delete(deletingContactId, organizationId);
      if (viewingContact?.id === deletingContactId) {
        setView('list');
        setViewingContact(undefined);
      }
      fetchContacts();
      setDeletingContactId(null);
    } catch (err) {
      console.error('Failed to delete contact', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredContacts = contacts.filter(c => {
    const matchesSearch =
      c.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filterType === 'ALL' || c.type === filterType || (c.type === ContactType.BOTH && (filterType === ContactType.BUYER || filterType === ContactType.SELLER));

    return matchesSearch && matchesFilter;
  });

  if (view === 'form') {
    return (
      <ContactForm
        contact={editingContact}
        onSave={handleSave}
        onCancel={() => {
          if (navigationState.returnTo === 'properties') {
            navigate('properties', navigationState);
          } else {
            setView(viewingContact ? 'details' : 'list');
            setEditingContact(undefined);
            setInitialStep(1);
            setIsIsolatedProfile(false);
          }
        }}
        organizationId={organizationId}
        fixedType={navigationState.context === 'creating-seller' ? ContactType.SELLER : undefined}
        initialStep={initialStep}
        isIsolatedProfile={isIsolatedProfile}
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
        onEdit={(c, step, isIsolated) => {
          setEditingContact(c);
          setInitialStep(step || 1);
          setIsIsolatedProfile(!!isIsolated);
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
          <p style={{ color: 'var(--color-text-muted)' }}>Manage your buyers and sellers in one place.</p>
        </div>
        {permissions.can(Permission.CONTACTS_CREATE) && (
          <Button
            onClick={() => {
              setEditingContact(undefined);
              setInitialStep(1);
              setIsIsolatedProfile(false);
              setView('form');
            }}
            leftIcon={<UserPlus size={20} />}
          >
            Add Contact
          </Button>
        )}
      </header>

      <div className="card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '250px' }}>
          <Input
            id="searchQuery"
            name="searchQuery"
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={Search}
            style={{ fontSize: '0.875rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button
            variant={filterType === 'ALL' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilterType('ALL')}
          >
            All
          </Button>
          <Button
            variant={filterType === ContactType.BUYER ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilterType(ContactType.BUYER)}
          >
            Buyers
          </Button>
          <Button
            variant={filterType === ContactType.SELLER ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilterType(ContactType.SELLER)}
          >
            Sellers
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <Loader2 size={40} className="animate-spin" color="var(--color-primary)" />
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
                setIsIsolatedProfile(false);
                setInitialStep(1);
                setView('form');
              }}
              onDelete={handleDelete}
              canEdit={permissions.can(Permission.CONTACTS_EDIT)}
              canDelete={permissions.can(Permission.CONTACTS_DELETE)}
            />
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '4rem', height: '4rem', borderRadius: '50%', backgroundColor: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
            <Users size={32} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>No contacts found</h3>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: '400px' }}>
            {searchQuery || filterType !== 'ALL'
              ? 'No contacts match your current filters.'
              : 'You haven\'t added any contacts yet. Start by adding your first buyer or seller.'}
          </p>
          {!searchQuery && filterType === 'ALL' && (
            <Button onClick={() => setView('form')}>
              Add Your First Contact
            </Button>
          )}
        </div>
      )}

      <ConfirmModal
        isOpen={!!deletingContactId}
        onClose={() => setDeletingContactId(null)}
        onConfirm={confirmDelete}
        title="Delete Contact"
        message="Are you sure you want to delete this contact? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ContactsView;
