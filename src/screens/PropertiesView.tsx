import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Loader2, Home } from 'lucide-react';
import { type Property, propertyService } from '../api/properties';
import { Input } from '../components/Input';
import PropertyCard from '../components/PropertyCard';
import PropertyForm from '../components/PropertyForm';
import PropertyDetails from '../components/PropertyDetails';
import Button from '../components/Button';
import ConfirmModal from '../components/ConfirmModal';
import { useNavigation } from '../contexts/NavigationContext';

interface PropertiesViewProps {
  organizationId: string;
}

const PropertiesView: React.FC<PropertiesViewProps> = ({ organizationId }) => {
  const { navigationState } = useNavigation();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'list' | 'form' | 'details'>('list');
  const [editingProperty, setEditingProperty] = useState<Property | undefined>(undefined);
  const [selectedProperty, setSelectedProperty] = useState<Property | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
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

  useEffect(() => {
    fetchProperties();
  }, [organizationId]);

  useEffect(() => {
    // Detect returning from seller creation
    if (navigationState.context === 'creating-seller' && navigationState.draftData) {
      setView('form');
      if (navigationState.draftData.id) {
        setEditingProperty(navigationState.draftData);
      }
    }
  }, [navigationState.context, navigationState.draftData]);

  const handleSave = async (data: Partial<Property>) => {
    // Strip metadata and relationship fields that backend doesn't accept in Create/Update DTOs
    const { 
      id, 
      createdAt, 
      updatedAt, 
      propertyImages, 
      deals, 
      activities, 
      sellerProfile,
      organization,
      tags,
      ...cleanData 
    } = data as any;
    
    try {
      let savedProperty: Property;
      if (editingProperty) {
        const response = await propertyService.update(editingProperty.id, cleanData);
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
      await propertyService.delete(deletingPropertyId);
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
    if (!searchQuery) return true;
    return p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city?.toLowerCase().includes(searchQuery.toLowerCase())
  });

  if (view === 'form') {
    return (
      <PropertyForm
        property={editingProperty}
        onSave={handleSave}
        onCancel={() => {
          setView('list');
          setEditingProperty(undefined);
        }}
        onSuccess={() => {
          setView('list');
          setEditingProperty(undefined);
          fetchProperties();
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
        <Button
          onClick={() => setView('form')}
          leftIcon={<Plus size={20} />}
        >
          Add Property
        </Button>
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
