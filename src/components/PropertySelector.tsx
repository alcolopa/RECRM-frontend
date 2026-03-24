import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Building2, X, Loader2, ChevronDown, MapPin, AlertCircle } from 'lucide-react';
import { type Property, propertyService } from '../api/properties';
import Button from './Button';
import { motion, AnimatePresence } from 'framer-motion';
import PropertyForm from './PropertyForm';

interface PropertySelectorProps {
  organizationId: string;
  selectedPropertyId?: string;
  onSelect: (propertyId: string, property?: Property) => void;
  label?: string;
  error?: string;
  disabled?: boolean;
  onNewPropertyRequested?: () => void;
}

const PropertySelector: React.FC<PropertySelectorProps> = ({
  organizationId,
  selectedPropertyId,
  onSelect,
  label = "Property",
  error: externalError,
  disabled = false,
  onNewPropertyRequested
}) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchProperties = async () => {
      setIsLoading(true);
      try {
        const response = await propertyService.getAll(organizationId);
        setProperties(response.data.items || []);
      } catch (err) {
        console.error('Failed to fetch properties', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (organizationId) {
      fetchProperties();
    }
  }, [organizationId]);

  useEffect(() => {
    if (selectedPropertyId && properties.length > 0) {
      const property = properties.find(p => p.id === selectedPropertyId);
      if (property) setSelectedProperty(property);
    } else if (!selectedPropertyId) {
      setSelectedProperty(null);
    }
  }, [selectedPropertyId, properties]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredProperties = properties.filter(p => {
    const fullSearch = `${p.title} ${p.address} ${p.city}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullSearch.includes(query);
  });

  const handleSelect = (property: Property) => {
    setSelectedProperty(property);
    onSelect(property.id, property);
    setIsDropdownOpen(false);
    setSearchQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedProperty(null);
    onSelect('');
  };

  const handleCreateProperty = async (data: Partial<Property>) => {
    try {
      setError(null);
      const response = await propertyService.create({ ...data, organizationId } as any);
      const newProperty = response.data;
      setProperties(prev => [newProperty, ...prev]);
      handleSelect(newProperty);
      setIsAddingNew(false);
      return newProperty;
    } catch (err) {
      console.error('Failed to create property', err);
      setError('Failed to create property. Please try again.');
      throw err;
    }
  };

  if (isAddingNew) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 3000, backgroundColor: 'var(--color-bg)', padding: isMobile ? '1rem' : '2rem', overflowY: 'auto' }}>
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
                fontWeight: 500,
                maxWidth: '800px',
                margin: '0 auto 1.5rem'
              }}
            >
              <AlertCircle size={18} />
              {error}
            </motion.div>
          )}
        </AnimatePresence>
        <PropertyForm
          organizationId={organizationId}
          onSave={handleCreateProperty}
          onCancel={() => {
            setIsAddingNew(false);
            setError(null);
          }}
        />
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', width: '100%', position: 'relative' }}>
      {label && (
        <label style={{
          fontSize: '0.8125rem',
          fontWeight: 700,
          color: 'var(--color-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.025em',
          display: 'block'
        }}>
          {label}
        </label>
      )}

      {selectedProperty ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.625rem 0.875rem',
            borderRadius: 'var(--radius)',
            border: `1px solid ${externalError ? 'var(--color-error)' : 'var(--color-primary)'}`,
            background: 'rgba(var(--color-primary-rgb), 0.05)',
            height: '3.5rem',
            boxShadow: externalError ? '0 0 0 1px var(--color-error), 0 0 0 4px rgba(220, 38, 38, 0.1)' : 'none',
            transition: 'all 0.2s ease',
            opacity: disabled ? 0.6 : 1,
            pointerEvents: disabled ? 'none' : 'auto'
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
            <Building2 size={14} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {selectedProperty.title}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <MapPin size={10} /> {selectedProperty.address}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted-foreground)' }}>
            {!disabled && (
              <X
                size={16}
                onClick={handleClear}
                style={{ cursor: 'pointer', transition: 'color 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-error)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted-foreground)')}
              />
            )}
            <ChevronDown size={18} />
          </div>
        </div>
      ) : (
        <div
          onClick={() => !disabled && setIsDropdownOpen(!isDropdownOpen)}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.625rem 0.875rem',
            borderRadius: 'var(--radius)',
            border: `1px solid ${externalError ? 'var(--color-error)' : (isDropdownOpen ? 'var(--color-primary)' : 'var(--color-border)')}`,
            background: 'var(--color-surface)',
            cursor: disabled ? 'not-allowed' : 'pointer',
            minHeight: '2.75rem',
            transition: 'all 0.2s ease',
            boxShadow: externalError ? '0 0 0 1px var(--color-error), 0 0 0 4px rgba(220, 38, 38, 0.1)' : (isDropdownOpen ? '0 0 0 1px var(--color-primary), 0 0 0 4px rgba(var(--color-primary-rgb), 0.1)' : 'none'),
            opacity: disabled ? 0.6 : 1
          }}
        >
          <Building2 size={18} color="var(--muted-foreground)" />
          <span style={{ fontSize: '0.9375rem', color: 'var(--muted-foreground)' }}>Select property...</span>
          <ChevronDown size={18} color="var(--muted-foreground)" style={{ marginLeft: 'auto', transform: isDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </div>
      )}

      <AnimatePresence>
        {isDropdownOpen && !selectedProperty && (
          <>
            {isMobile && (
              <div 
                onClick={() => setIsDropdownOpen(false)}
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0,0,0,0.4)',
                  backdropFilter: 'blur(4px)',
                  zIndex: 999
                }}
              />
            )}
            <motion.div
              initial={{ opacity: 0, x: isMobile ? '-50%' : 0, y: isMobile ? 50 : -5 }}
              animate={{ opacity: 1, x: isMobile ? '-50%' : 0, y: isMobile ? '-50%' : 0 }}
              exit={{ opacity: 0, x: isMobile ? '-50%' : 0, y: isMobile ? 50 : -5 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{
                position: isMobile ? 'fixed' : 'absolute',
                top: isMobile ? '50%' : '100%',
                left: isMobile ? '50%' : 0,
                right: isMobile ? 'auto' : 0,
                marginTop: isMobile ? 0 : '0.5rem',
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-2xl)',
                zIndex: 1000,
                overflow: 'hidden',
                width: isMobile ? 'calc(100vw - 2.5rem)' : '100%',
                maxWidth: isMobile ? '400px' : 'none',
              }}
            >
              {isMobile && (
                <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--color-bg)' }}>
                  <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700 }}>Select Property</h4>
                  <button 
                    onClick={() => setIsDropdownOpen(false)}
                    style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
                  >
                    <X size={20} />
                  </button>
                </div>
              )}
            <div style={{ padding: '0.75rem', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)' }}>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
                <input
                  autoFocus
                  type="text"
                  placeholder="Filter properties..."
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
              {!isLoading && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onNewPropertyRequested) {
                      onNewPropertyRequested();
                    } else {
                      setIsAddingNew(true);
                    }
                    setIsDropdownOpen(false);
                  }}
                  style={{
                    padding: '0.75rem',
                    margin: '0.25rem',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    color: 'var(--color-primary)',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    background: 'rgba(var(--color-primary-rgb), 0.05)',
                    border: '1px dashed var(--color-primary)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(var(--color-primary-rgb), 0.1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(var(--color-primary-rgb), 0.05)')}
                >
                  <div style={{
                    width: '1.5rem',
                    height: '1.5rem',
                    borderRadius: '50%',
                    background: 'var(--color-primary)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Plus size={14} />
                  </div>
                  New Property
                </div>
              )}
              {isLoading ? (
                <div style={{ padding: '1.5rem', textAlign: 'center' }}>
                  <Loader2 size={20} className="animate-spin" color="var(--color-primary)" />
                </div>
              ) : filteredProperties.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {filteredProperties.map(property => (
                    <div
                      key={property.id}
                      onClick={(e) => { e.stopPropagation(); handleSelect(property); }}
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
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)', display: 'flex', justifyContent: 'space-between' }}>
                        <span>{property.title}</span>
                        {property.price && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 700 }}>
                            ${property.price.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <MapPin size={10} /> {property.address}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--muted-foreground)', fontSize: '0.8125rem' }}>
                  <p>No properties found.</p>
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
            </div>
          </motion.div>
          </>
        )}
      </AnimatePresence>

      {externalError && (
        <span style={{ fontSize: '0.75rem', color: 'var(--color-error)', marginTop: '0.125rem', fontWeight: 500 }}>
          {externalError}
        </span>
      )}
    </div>
  );
};

export default PropertySelector;
