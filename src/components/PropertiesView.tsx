import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Loader2, Home } from 'lucide-react';
import { type Property, propertyService } from '../api/properties';
import { Input } from './Input';
import PropertyCard from './PropertyCard';
import PropertyForm from './PropertyForm';

interface PropertiesViewProps {
  organizationId: string;
}

const PropertiesView: React.FC<PropertiesViewProps> = ({ organizationId }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingProperty, setEditingProperty] = useState<Property | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      const response = await propertyService.getAll(organizationId);
      setProperties(response.data);
    } catch (err) {
      console.error('Failed to fetch properties', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [organizationId]);

  const handleSave = async (data: Partial<Property>) => {
    try {
      if (editingProperty) {
        await propertyService.update(editingProperty.id, data);
      } else {
        await propertyService.create({ ...data, organizationId });
      }
      setView('list');
      setEditingProperty(undefined);
      fetchProperties();
    } catch (err) {
      console.error('Failed to save property', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await propertyService.delete(id);
        fetchProperties();
      } catch (err) {
        console.error('Failed to delete property', err);
      }
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
        organizationId={organizationId}
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
        <button
          onClick={() => setView('form')}
          className="btn btn-primary"
          style={{ gap: '0.5rem' }}
        >
          <Plus size={20} /> Add Property
        </button>
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
        <button className="btn btn-outline" style={{ gap: '0.5rem', padding: '0.625rem 1rem' }}>
          <Filter size={18} /> Filters
        </button>
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
            <button onClick={() => setView('form')} className="btn btn-primary">
              Add Your First Property
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PropertiesView;
