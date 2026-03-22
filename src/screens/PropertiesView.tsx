import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Loader2, Home, User } from 'lucide-react';
import { type Property, propertyService } from '../api/properties';
import { type UserProfile, userService } from '../api/users';
import { Input, Select } from '../components/Input';
import PropertyCard from '../components/PropertyCard';
import PropertyForm from '../components/PropertyForm';
import PropertyDetails from '../components/PropertyDetails';
import Button from '../components/Button';
import ConfirmModal from '../components/ConfirmModal';
import { useNavigation } from '../contexts/NavigationContext';
import { usePermissions } from '../utils/permissions';
import { Permission } from '../api/users';

interface PropertiesViewProps {
  organizationId: string;
  user: UserProfile;
}

const PropertiesView: React.FC<PropertiesViewProps> = ({ organizationId, user }) => {
  const permissions = usePermissions(user);
  const { navigationState, navigate } = useNavigation();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'list' | 'form' | 'details'>('list');
  const [editingProperty, setEditingProperty] = useState<Property | undefined>(undefined);
  const [selectedProperty, setSelectedProperty] = useState<Property | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState<string>('all');
  const [agents, setAgents] = useState<UserProfile[]>([]);
  const [deletingPropertyId, setDeletingPropertyId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      const response = await propertyService.getAll(organizationId);
      setProperties(response.data);
      // Update selected property if we are in details view
      if (selectedProperty) {
        const updated = response.data.find(p => p.id === selectedProperty.id);
        if (updated) setSelectedProperty(updated);
      }
    } catch (err) {
      console.error('Failed to fetch properties', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await userService.getAll(organizationId);
      setAgents(response.data);
    } catch (err) {
      console.error('Failed to fetch agents', err);
    }
  };

  useEffect(() => {
    fetchProperties();
    fetchAgents();
  }, [organizationId]);

  useEffect(() => {
    // Detect returning from creation contexts
    if ((navigationState.context === 'creating-seller' || navigationState.context === 'creating-property') && navigationState.draftData) {
      setView('form');
      if (navigationState.draftData.id) {
        setEditingProperty(navigationState.draftData);
      }
    } else if (navigationState.context === 'creating-property') {
      setView('form');
    }
  }, [navigationState.context, navigationState.draftData]);

  const handleSave = async (data: Partial<Property>) => {
    // Strip metadata and relationship fields that backend doesn't accept in Create/Update DTOs
    const cleanData = { ...data } as any;
    delete cleanData.id;
    delete cleanData.createdAt;
    delete cleanData.updatedAt;
    delete cleanData.propertyImages;
    delete cleanData.deals;
    delete cleanData.activities;
    delete cleanData.sellerProfile;
    delete cleanData.organization;
    delete cleanData.tags;
    delete cleanData.negotiations;
    delete cleanData.assignedUser;
    
    try {
      let savedProperty: Property;
      if (editingProperty) {
        const response = await propertyService.update(editingProperty.id, cleanData, organizationId);
        savedProperty = response.data;
      } else {
        const response = await propertyService.create({ ...cleanData, organizationId });
        savedProperty = response.data;
      }
      return savedProperty;
    } catch (err) {
      console.error('Failed to save property', err);
      throw err;
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingPropertyId(id);
  };

  const confirmDelete = async () => {
    if (!deletingPropertyId) return;
    
    setIsDeleting(true);
    try {
      await propertyService.delete(deletingPropertyId, organizationId);
      if (selectedProperty?.id === deletingPropertyId) {
        setView('list');
        setSelectedProperty(undefined);
      }
      fetchProperties();
      setDeletingPropertyId(null);
    } catch (err) {
      console.error('Failed to delete property', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredProperties = properties.filter(p => {
    const matchesSearch = !searchQuery || 
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesAgent = selectedAgentId === 'all' || p.assignedUserId === selectedAgentId;
    
    return matchesSearch && matchesAgent;
  });

  if (view === 'form') {
    return (
      <PropertyForm
        property={editingProperty}
        onSave={handleSave}
        onCancel={() => {
          if (navigationState.returnTo === 'offers') {
            navigate('offers', navigationState);
          } else {
            setView('list');
            setEditingProperty(undefined);
          }
        }}
        onSuccess={(savedProperty) => {
          if (navigationState.returnTo === 'offers' && savedProperty) {
            navigate('offers', {
              ...navigationState,
              prefillData: { 
                ...navigationState.prefillData,
                propertyId: savedProperty.id 
              }
            });
          } else {
            setView('list');
            setEditingProperty(undefined);
            fetchProperties();
          }
        }}
        organizationId={organizationId}
      />
    );
  }

  if (view === 'details' && selectedProperty) {
    return (
      <PropertyDetails
        property={selectedProperty}
        onBack={() => {
          setView('list');
          setSelectedProperty(undefined);
        }}
        onEdit={(p) => {
          setEditingProperty(p);
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
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.25rem' }}>Properties</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Manage your listings and property details.</p>
        </div>
        {permissions.can(Permission.PROPERTIES_CREATE) && (
          <Button
            onClick={() => setView('form')}
            leftIcon={<Plus size={20} />}
          >
            Add Property
          </Button>
        )}
      </header>

      {/* Filters & Search */}
      <div className="card" style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '250px' }}>
          <Input
            id="searchQuery"
            name="searchQuery"
            type="text"
            placeholder="Search by title, address, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={Search}
            style={{ fontSize: '0.875rem' }}
          />
        </div>
        <div style={{ width: '200px' }}>
          <Select
            id="agentFilter"
            name="agentFilter"
            value={selectedAgentId}
            onChange={(e) => setSelectedAgentId(e.target.value as string)}
            icon={User}
            options={[
              { value: 'all', label: 'All Agents' },
              ...agents.map(a => ({ 
                value: a.id, 
                label: `${a.firstName} ${a.lastName}` 
              }))
            ]}
            style={{ fontSize: '0.875rem' }}
          />
        </div>
        <Button variant="outline" leftIcon={<Filter size={18} />} style={{ padding: '0.625rem 1rem' }}>
          Filters
        </Button>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <Loader2 size={40} className="animate-spin" color="var(--color-primary)" />
        </div>
      ) : filteredProperties.length > 0 ? (
        <div className="grid grid-2 grid-3" style={{ gap: '1.5rem' }}>
          {filteredProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onClick={() => {
                setSelectedProperty(property);
                setView('details');
              }}
              onEdit={(p) => {
                setEditingProperty(p);
                setView('form');
              }}
              onDelete={handleDelete}
              canEdit={permissions.can(Permission.PROPERTIES_EDIT)}
              canDelete={permissions.can(Permission.PROPERTIES_DELETE)}
            />
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '4rem', height: '4rem', borderRadius: '50%', backgroundColor: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
            <Home size={32} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>No properties found</h3>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: '400px' }}>
            {searchQuery ? 'No properties match your search criteria.' : 'You haven\'t added any properties yet. Get started by adding your first listing.'}
          </p>
          {!searchQuery && (
            <Button onClick={() => setView('form')}>
              Add Your First Property
            </Button>
          )}
        </div>
      )}

      <ConfirmModal
        isOpen={!!deletingPropertyId}
        onClose={() => setDeletingPropertyId(null)}
        onConfirm={confirmDelete}
        title="Delete Property"
        message="Are you sure you want to delete this property? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default PropertiesView;
