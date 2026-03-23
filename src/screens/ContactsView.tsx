import { useState, useEffect } from 'react';
import { Search, Loader2, Users, UserPlus, LayoutGrid, List, Edit2, Trash2, ExternalLink, ChevronUp, ChevronDown } from 'lucide-react';
import { type Contact, ContactType, contactService, ContactStatus } from '../api/contacts';
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
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'list' | 'form' | 'details'>('list');
  const [editingContact, setEditingContact] = useState<Contact | undefined>(undefined);
  const [viewingContact, setViewingContact] = useState<Contact | undefined>(undefined);
  const [initialStep, setInitialStep] = useState<number>(1);
  const [isIsolatedProfile, setIsIsolatedProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | ContactType>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [deletingContactId, setDeletingContactId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const getStatusBadge = (status: ContactStatus) => {
    const styles: Record<ContactStatus, { bg: string, color: string }> = {
      NEW: { bg: 'rgba(5, 150, 105, 0.1)', color: 'var(--color-primary)' },
      CONTACTED: { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' },
      QUALIFIED: { bg: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' },
      ACTIVE: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981' },
      INACTIVE: { bg: 'rgba(107, 114, 128, 0.1)', color: '#6b7280' },
      LOST: { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }
    };
    const style = styles[status] || styles.NEW;
    return (
      <span className="badge" style={{ backgroundColor: style.bg, color: style.color }}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  const fetchContacts = async (pageNum = page, type = filterType, sort = sortBy, order = sortOrder) => {
    setIsLoading(true);
    try {
      const apiType = type === 'ALL' ? undefined : type;
      const response = await contactService.getAll(organizationId, apiType, pageNum, limit, sort, order);
      setContacts(Array.isArray(response.data.items) ? response.data.items : []);
      setTotalCount(response.data.total || 0);
    } catch (err) {
      console.error('Failed to fetch contacts', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(1);
  };

  useEffect(() => {
    fetchContacts(page, filterType, sortBy, sortOrder);
  }, [page, sortBy, sortOrder]);

  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    } else {
      fetchContacts(1, filterType, sortBy, sortOrder);
    }
  }, [organizationId, filterType]);

  useEffect(() => {
    // Handle prefill from navigation state
    if (navigationState.context === 'creating-seller' || navigationState.context === 'creating-buyer') {
      setView('form');
      if (navigationState.context === 'creating-seller') {
        setFilterType(ContactType.SELLER);
      } else {
        setFilterType(ContactType.BUYER);
      }
    }
  }, [navigationState.context]);

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

  const filteredContacts = (Array.isArray(contacts) ? contacts : []).filter(c => {
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
        user={user}
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

        {/* View Switcher - Only on Desktop */}
        <div className="view-toggle hidden-mobile" style={{ marginLeft: 'auto' }}>
          <div 
            className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Grid View"
          >
            <LayoutGrid size={18} />
          </div>
          <div 
            className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title="List View"
          >
            <List size={18} />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <Loader2 size={40} className="animate-spin" color="var(--color-primary)" />
        </div>
      ) : (Array.isArray(filteredContacts) ? filteredContacts : []).length > 0 ? (
        <>
          {viewMode === 'grid' || window.innerWidth < 768 ? (
            <div className="grid grid-2 grid-3" style={{ gap: '1.5rem' }}>
              {(Array.isArray(filteredContacts) ? filteredContacts : []).map((contact) => (
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
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('firstName')} style={{ cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        Name {sortBy === 'firstName' && (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                      </div>
                    </th>
                    <th onClick={() => handleSort('type')} style={{ cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        Type {sortBy === 'type' && (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                      </div>
                    </th>
                    <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        Status {sortBy === 'status' && (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                      </div>
                    </th>
                    <th>Phone</th>
                    <th>Assigned To</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(Array.isArray(filteredContacts) ? filteredContacts : []).map(contact => (
                    <tr key={contact.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ 
                            width: '2.25rem', 
                            height: '2.25rem', 
                            borderRadius: '50%', 
                            backgroundColor: 'var(--color-bg)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 600,
                            color: 'var(--color-primary)',
                            fontSize: '0.75rem'
                          }}>
                            {contact.firstName[0]}{contact.lastName[0]}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{contact.firstName} {contact.lastName}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{contact.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ 
                          fontSize: '0.75rem', 
                          fontWeight: 600,
                          color: contact.type === 'BUYER' ? 'var(--color-primary)' : contact.type === 'SELLER' ? '#8b5cf6' : '#f59e0b'
                        }}>
                          {contact.type}
                        </span>
                      </td>
                      <td>{getStatusBadge(contact.status)}</td>
                      <td>{contact.phone}</td>
                      <td>
                        {contact.assignedAgent ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '1.5rem', height: '1.5rem', borderRadius: '50%', backgroundColor: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.625rem' }}>
                              {contact.assignedAgent.firstName[0]}
                            </div>
                            <span style={{ fontSize: '0.8125rem' }}>{contact.assignedAgent.firstName}</span>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>Unassigned</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.25rem' }}>
                          <button 
                            className="table-action-btn"
                            onClick={() => { setViewingContact(contact); setView('details'); }}
                            title="View Details"
                          >
                            <ExternalLink size={16} />
                          </button>
                          {permissions.can(Permission.CONTACTS_EDIT) && (
                            <button 
                              className="table-action-btn"
                              onClick={() => { setEditingContact(contact); setView('form'); }}
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                          )}
                          {permissions.can(Permission.CONTACTS_DELETE) && (
                            <button 
                              className="table-action-btn"
                              style={{ color: 'var(--color-error)' }}
                              onClick={() => handleDelete(contact.id)}
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalCount > limit && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              gap: '1rem',
              marginTop: '2rem',
              padding: '1rem',
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--color-border)'
            }}>
              <Button 
                variant="outline" 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || isLoading}
              >
                Previous
              </Button>
              <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                Page {page} of {Math.ceil(totalCount / limit)}
              </span>
              <Button 
                variant="outline" 
                onClick={() => setPage(p => p + 1)}
                disabled={page >= Math.ceil(totalCount / limit) || isLoading}
              >
                Next
              </Button>
            </div>
          )}
        </>
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
          {!searchQuery && filterType === 'ALL' && permissions.can(Permission.CONTACTS_CREATE) && (
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
