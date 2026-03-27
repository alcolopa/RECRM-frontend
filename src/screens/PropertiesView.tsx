import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Loader2, Home, User, LayoutGrid, List, Edit2, Trash2, ExternalLink, ChevronUp, ChevronDown } from 'lucide-react';
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
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'list' | 'form' | 'details'>('list');
  const [editingProperty, setEditingProperty] = useState<Property | undefined>(undefined);
  const [selectedProperty, setSelectedProperty] = useState<Property | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState<string>('all');
  const [agents, setAgents] = useState<UserProfile[]>([]);
  const [deletingPropertyId, setDeletingPropertyId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterListingType, setFilterListingType] = useState('');
  const [filterMinPrice, setFilterMinPrice] = useState('');
  const [filterMaxPrice, setFilterMaxPrice] = useState('');
  const [filterBedrooms, setFilterBedrooms] = useState('');

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string, color: string }> = {
      AVAILABLE: { bg: 'rgba(5, 150, 105, 0.1)', color: 'var(--color-primary)' },
      RESERVED: { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' },
      SOLD: { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' },
      RENTED: { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' },
      OFF_MARKET: { bg: 'rgba(107, 114, 128, 0.1)', color: '#6b7280' }
    };
    const style = styles[status] || styles.AVAILABLE;
    return (
      <span className="badge" style={{ backgroundColor: style.bg, color: style.color }}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  const activeFilterCount = [filterStatus, filterType, filterListingType, filterMinPrice, filterMaxPrice, filterBedrooms].filter(Boolean).length;

  const clearFilters = () => {
    setFilterStatus('');
    setFilterType('');
    setFilterListingType('');
    setFilterMinPrice('');
    setFilterMaxPrice('');
    setFilterBedrooms('');
  };

  const fetchProperties = async (pageNum = page, agentId = selectedAgentId, sort = sortBy, order = sortOrder) => {
    setIsLoading(true);
    try {
      const filters = {
        assignedUserId: agentId === 'all' ? undefined : agentId,
        status: filterStatus || undefined,
        type: filterType || undefined,
        listingType: filterListingType || undefined,
        minPrice: filterMinPrice ? Number(filterMinPrice) : undefined,
        maxPrice: filterMaxPrice ? Number(filterMaxPrice) : undefined,
        bedrooms: filterBedrooms ? Number(filterBedrooms) : undefined,
        sortBy: sort,
        sortOrder: order
      };
      const response = await propertyService.getAll(organizationId, pageNum, limit, filters);
      setProperties(Array.isArray(response.data.items) ? response.data.items : []);
      setTotalCount(response.data.total || 0);

      // Update selected property if we are in details view
      if (selectedProperty && Array.isArray(response.data.items)) {
        const updated = response.data.items.find(p => p.id === selectedProperty.id);
        if (updated) setSelectedProperty(updated);
      }
    } catch (err) {
      console.error('Failed to fetch properties', err);
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

  const fetchAgents = async () => {
    try {
      const response = await userService.getAll(organizationId);
      const data = response.data;
      if (Array.isArray(data)) {
        setAgents(data);
      } else if (data && typeof data === 'object' && Array.isArray((data as any).items)) {
        setAgents((data as any).items);
      } else {
        setAgents([]);
      }
    } catch (err) {
      console.error('Failed to fetch agents', err);
    }
  };

  useEffect(() => {
    fetchProperties(page, selectedAgentId, sortBy, sortOrder);
  }, [page, selectedAgentId, sortBy, sortOrder, organizationId, filterStatus, filterType, filterListingType, filterMinPrice, filterMaxPrice, filterBedrooms]);

  useEffect(() => {
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

  const filteredProperties = (Array.isArray(properties) ? properties : []).filter(p => {
    const matchesSearch = !searchQuery || 
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
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
        user={user}
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

      {/* Search & Filter Bar */}
      <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
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
                ...(Array.isArray(agents) ? agents : []).map(a => ({ 
                  value: a.id, 
                  label: `${a.firstName} ${a.lastName}` 
                }))
              ]}
              style={{ fontSize: '0.875rem' }}
            />
          </div>
          <Button 
            variant={showFilters ? 'primary' : 'outline'} 
            leftIcon={<Filter size={18} />} 
            style={{ padding: '0.625rem 1rem', position: 'relative' }}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
            {activeFilterCount > 0 && (
              <span style={{
                position: 'absolute', top: '-6px', right: '-6px',
                width: '20px', height: '20px', borderRadius: '50%',
                backgroundColor: 'var(--color-primary)', color: 'white',
                fontSize: '0.6875rem', fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {activeFilterCount}
              </span>
            )}
          </Button>

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

        {/* Collapsible Filter Panel */}
        {showFilters && (
          <div style={{ 
            marginTop: '1rem', paddingTop: '1rem', 
            borderTop: '1px solid var(--color-border)',
            display: 'flex', flexDirection: 'column', gap: '1rem'
          }}>
            <div className="grid grid-2 grid-3" style={{ gap: '0.75rem' }}>
              <Select
                id="filterStatus" name="filterStatus" label="Status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                options={[
                  { value: '', label: 'All Statuses' },
                  { value: 'AVAILABLE', label: 'Available' },
                  { value: 'RESERVED', label: 'Reserved' },
                  { value: 'SOLD', label: 'Sold' },
                  { value: 'RENTED', label: 'Rented' },
                  { value: 'OFF_MARKET', label: 'Off Market' },
                ]}
                style={{ fontSize: '0.8125rem' }}
              />
              <Select
                id="filterType" name="filterType" label="Property Type"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                options={[
                  { value: '', label: 'All Types' },
                  { value: 'APARTMENT', label: 'Apartment' },
                  { value: 'HOUSE', label: 'House' },
                  { value: 'VILLA', label: 'Villa' },
                  { value: 'OFFICE', label: 'Office' },
                  { value: 'SHOP', label: 'Shop' },
                  { value: 'LAND', label: 'Land' },
                  { value: 'WAREHOUSE', label: 'Warehouse' },
                  { value: 'BUILDING', label: 'Building' },
                ]}
                style={{ fontSize: '0.8125rem' }}
              />
              <Select
                id="filterListingType" name="filterListingType" label="Listing Type"
                value={filterListingType}
                onChange={(e) => setFilterListingType(e.target.value)}
                options={[
                  { value: '', label: 'All Listings' },
                  { value: 'SALE', label: 'For Sale' },
                  { value: 'RENT', label: 'For Rent' },
                  { value: 'LEASE', label: 'For Lease' },
                ]}
                style={{ fontSize: '0.8125rem' }}
              />
              <Input
                id="filterMinPrice" name="filterMinPrice" label="Min Price"
                type="number" placeholder="0"
                value={filterMinPrice}
                onChange={(e) => setFilterMinPrice(e.target.value)}
                style={{ fontSize: '0.8125rem' }}
              />
              <Input
                id="filterMaxPrice" name="filterMaxPrice" label="Max Price"
                type="number" placeholder="Any"
                value={filterMaxPrice}
                onChange={(e) => setFilterMaxPrice(e.target.value)}
                style={{ fontSize: '0.8125rem' }}
              />
              <Select
                id="filterBedrooms" name="filterBedrooms" label="Bedrooms"
                value={filterBedrooms}
                onChange={(e) => setFilterBedrooms(e.target.value)}
                options={[
                  { value: '', label: 'Any' },
                  { value: '1', label: '1+' },
                  { value: '2', label: '2+' },
                  { value: '3', label: '3+' },
                  { value: '4', label: '4+' },
                  { value: '5', label: '5+' },
                ]}
                style={{ fontSize: '0.8125rem' }}
              />
            </div>
            {activeFilterCount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={clearFilters}
                  style={{
                    border: 'none', background: 'none', cursor: 'pointer',
                    color: 'var(--color-primary)', fontSize: '0.8125rem', fontWeight: 600,
                    padding: '0.25rem 0.5rem'
                  }}
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <Loader2 size={40} className="animate-spin" color="var(--color-primary)" />
        </div>
      ) : filteredProperties.length > 0 ? (
        <>
          {viewMode === 'grid' || window.innerWidth < 768 ? (
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
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('title')} style={{ cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        Property {sortBy === 'title' && (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                      </div>
                    </th>
                    <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        Status {sortBy === 'status' && (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                      </div>
                    </th>
                    <th onClick={() => handleSort('type')} style={{ cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        Type {sortBy === 'type' && (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                      </div>
                    </th>
                    <th onClick={() => handleSort('price')} style={{ cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        Price {sortBy === 'price' && (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                      </div>
                    </th>
                    <th>Location</th>
                    <th>Agent</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProperties.map(property => (
                    <tr key={property.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ 
                            width: '3.5rem', 
                            height: '2.5rem', 
                            borderRadius: '0.375rem', 
                            backgroundColor: 'var(--color-bg)',
                            overflow: 'hidden'
                          }}>
                            {Array.isArray(property.propertyImages) && property.propertyImages[0] ? (
                              <img 
                                src={property.propertyImages[0].url} 
                                alt={property.title}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
                                <Home size={16} />
                              </div>
                            )}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{property.title}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{property.address}</div>
                          </div>
                        </div>
                      </td>
                      <td>{getStatusBadge(property.status)}</td>
                      <td>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          {property.type.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {property.price ? `$${property.price.toLocaleString()}` : 'Price on Request'}
                      </td>
                      <td>{property.city}, {property.country}</td>
                      <td>
                        {property.assignedUser ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '1.5rem', height: '1.5rem', borderRadius: '50%', backgroundColor: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.625rem' }}>
                              {(property.assignedUser.firstName || property.assignedUser.email || '?')[0]}
                            </div>
                            <span style={{ fontSize: '0.8125rem' }}>{property.assignedUser.firstName || property.assignedUser.email || 'Unknown'}</span>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>Unassigned</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.25rem' }}>
                          <button 
                            className="table-action-btn"
                            onClick={() => { setSelectedProperty(property); setView('details'); }}
                            title="View Details"
                          >
                            <ExternalLink size={16} />
                          </button>
                          {permissions.can(Permission.PROPERTIES_EDIT) && (
                            <button 
                              className="table-action-btn"
                              onClick={() => { setEditingProperty(property); setView('form'); }}
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                          )}
                          {permissions.can(Permission.PROPERTIES_DELETE) && (
                            <button 
                              className="table-action-btn"
                              style={{ color: 'var(--color-error)' }}
                              onClick={() => handleDelete(property.id)}
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
            <Home size={32} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>No properties found</h3>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: '400px' }}>
            {searchQuery ? 'No properties match your search criteria.' : 'You haven\'t added any properties yet. Get started by adding your first listing.'}
          </p>
          {!searchQuery && permissions.can(Permission.PROPERTIES_CREATE) && (
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
