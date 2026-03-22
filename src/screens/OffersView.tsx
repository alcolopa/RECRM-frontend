import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Loader2, 
  HandCoins, 
  Clock,
  User,
  XCircle,
  LayoutGrid,
  List,
  ExternalLink,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { type Offer, offersService, OfferStatus } from '../api/offers';
import { type UserProfile, userService } from '../api/users';
import { Input, Select } from '../components/Input';
import Button from '../components/Button';
import OfferCard from '../components/OfferCard';
import OfferForm from '../components/OfferForm';
import { useNavigation } from '../contexts/NavigationContext';
import { usePermissions } from '../utils/permissions';
import { Permission } from '../api/users';

interface OffersViewProps {
  organizationId: string;
  user: UserProfile;
}

type QuickFilterType = 'all' | 'active' | 'inactive';

const OffersView: React.FC<OffersViewProps> = ({ organizationId, user }) => {
  const permissions = usePermissions(user);
  const { navigationState, clearNavigationState } = useNavigation();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'list' | 'form' | 'details'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [agents, setAgents] = useState<UserProfile[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('all');
  const [quickFilter, setQuickFilter] = useState<QuickFilterType>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<string>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const [prefillProperty, setPrefillProperty] = useState<any>(null);
  const [prefillContactId, setPrefillContactId] = useState<string | undefined>(undefined);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const activeStatuses = [OfferStatus.SUBMITTED, OfferStatus.UNDER_REVIEW, OfferStatus.COUNTERED];

  const getStatusBadge = (status: OfferStatus) => {
    const styles: Record<OfferStatus, { bg: string, color: string }> = {
      DRAFT: { bg: 'rgba(107, 114, 128, 0.1)', color: '#6b7280' },
      SUBMITTED: { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' },
      UNDER_REVIEW: { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' },
      COUNTERED: { bg: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' },
      ACCEPTED: { bg: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-primary)' },
      REJECTED: { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' },
      WITHDRAWN: { bg: 'rgba(107, 114, 128, 0.1)', color: '#6b7280' },
      EXPIRED: { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }
    };
    const style = styles[status] || styles.DRAFT;
    return (
      <span className="badge" style={{ backgroundColor: style.bg, color: style.color }}>
        {status.replace(/_/g, ' ')}
      </span>
    );
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchOffers = async (pageNum = page, sort = sortBy, order = sortOrder) => {
    setIsLoading(true);
    try {
      const response = await offersService.getAll(organizationId, pageNum, limit, sort, order);
      setOffers(Array.isArray(response.data.items) ? response.data.items : []);
      setTotalCount(response.data.total || 0);
    } catch (err) {
      console.error('Failed to fetch offers', err);
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
      setAgents(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Failed to fetch agents', err);
    }
  };

  useEffect(() => {
    fetchOffers(page, sortBy, sortOrder);
  }, [page, sortBy, sortOrder]);

  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    } else {
      fetchOffers(1, sortBy, sortOrder);
    }
    fetchAgents();
  }, [organizationId]);

  useEffect(() => {
    if (navigationState.prefillData?.propertyId) {
      const fetchProperty = async () => {
        try {
          const { propertyService } = await import('../api/properties');
          const response = await propertyService.getOne(navigationState.prefillData.propertyId, organizationId);
          setPrefillProperty(response.data);
          setView('form');
          clearNavigationState();
        } catch (err) {
          console.error('Failed to fetch prefill property', err);
        }
      };
      fetchProperty();
    } else if (navigationState.prefillData?.contactId) {
      setPrefillContactId(navigationState.prefillData.contactId);
      setView('form');
      clearNavigationState();
    }
  }, [navigationState]);

  const stats = {
    total: (Array.isArray(offers) ? offers : []).length,
    active: (Array.isArray(offers) ? offers : []).filter(o => activeStatuses.includes(o.status)).length,
    inactive: (Array.isArray(offers) ? offers : []).filter(o => !activeStatuses.includes(o.status)).length,
  };

  const filteredOffers = (Array.isArray(offers) ? offers : []).filter(offer => {
    const propertyTitle = offer.negotiation?.property?.title || '';
    const contactName = `${offer.negotiation?.contact?.firstName} ${offer.negotiation?.contact?.lastName}`.toLowerCase();
    
    const matchesSearch = !searchQuery || 
      propertyTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contactName.includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || offer.status === statusFilter;
    const matchesAgent = selectedAgentId === 'all' || offer.createdById === selectedAgentId;
    
    // Quick Filter Logic
    let matchesQuickFilter = true;
    if (quickFilter === 'active') {
      matchesQuickFilter = activeStatuses.includes(offer.status);
    } else if (quickFilter === 'inactive') {
      matchesQuickFilter = !activeStatuses.includes(offer.status);
    }
    
    return matchesSearch && matchesStatus && matchesAgent && matchesQuickFilter;
  });

  if (view === 'form') {
    return (
      <OfferForm
        onCancel={() => {
          setView('list');
          setPrefillProperty(null);
          setPrefillContactId(undefined);
        }}
        onSuccess={() => {
          setView('list');
          setPrefillProperty(null);
          setPrefillContactId(undefined);
          fetchOffers();
        }}
        organizationId={organizationId}
        initialProperty={prefillProperty}
        initialContactId={prefillContactId}
      />
    );
  }

  const statCardStyle = (type: QuickFilterType): React.CSSProperties => ({
    padding: '1.25rem', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '1rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: quickFilter === type ? '2px solid var(--color-primary)' : '2px solid transparent',
    transform: quickFilter === type ? 'scale(1.02)' : 'scale(1)',
    position: 'relative'
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <header className="offers-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', flexDirection: isMobile ? 'column' : 'row', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: isMobile ? '1.375rem' : '1.875rem', fontWeight: 700, marginBottom: '0.25rem' }}>Offers & Negotiations</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: isMobile ? '0.8125rem' : undefined }}>Track property offers and negotiation history.</p>
        </div>
        {permissions.can(Permission.DEALS_CREATE) && (
          <Button
            onClick={() => setView('form')}
            leftIcon={<Plus size={20} />}
            style={isMobile ? { width: '100%' } : undefined}
          >
            Create Offer
          </Button>
        )}
      </header>

      {/* Stats Cards */}
      <div className="grid grid-3" style={{ gap: '1rem' }}>
        <div 
          className="card" 
          style={statCardStyle('all')}
          onClick={() => setQuickFilter('all')}
        >
          <div style={{ padding: '0.75rem', borderRadius: '0.75rem', backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)', color: 'var(--color-primary)' }}>
            <HandCoins size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Offers</div>
            <div style={{ fontSize: 1.5 + 'rem', fontWeight: 700 }}>{stats.total}</div>
          </div>
        </div>
        <div 
          className="card" 
          style={statCardStyle('active')}
          onClick={() => setQuickFilter('active')}
        >
          <div style={{ padding: '0.75rem', borderRadius: '0.75rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active</div>
            <div style={{ fontSize: 1.5 + 'rem', fontWeight: 700 }}>{stats.active}</div>
          </div>
        </div>
        <div 
          className="card" 
          style={statCardStyle('inactive')}
          onClick={() => setQuickFilter('inactive')}
        >
          <div style={{ padding: '0.75rem', borderRadius: '0.75rem', backgroundColor: 'rgba(107, 114, 128, 0.1)', color: 'var(--color-text-muted)' }}>
            <XCircle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Inactive</div>
            <div style={{ fontSize: 1.5 + 'rem', fontWeight: 700 }}>{stats.inactive}</div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="card offers-filters" style={{ padding: '1rem', display: 'flex', gap: '0.75rem', alignItems: isMobile ? 'stretch' : 'center', flexDirection: isMobile ? 'column' : 'row', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: isMobile ? '0' : '250px' }}>
          <Input
            id="searchQuery"
            name="searchQuery"
            type="text"
            placeholder="Search property or buyer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={Search}
            style={{ fontSize: '0.875rem' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', width: isMobile ? '100%' : 'auto' }}>
          <div style={{ flex: isMobile ? 1 : 'none', width: isMobile ? 'auto' : '220px' }}>
            <Select
              id="statusFilter"
              name="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as string)}
              icon={Filter}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: OfferStatus.SUBMITTED, label: 'Submitted' },
                { value: OfferStatus.UNDER_REVIEW, label: 'Under Review' },
                { value: OfferStatus.COUNTERED, label: 'Countered' },
                { value: OfferStatus.ACCEPTED, label: 'Accepted' },
                { value: OfferStatus.REJECTED, label: 'Rejected' },
              ]}
              style={{ fontSize: '0.875rem' }}
            />
          </div>
          <div style={{ flex: isMobile ? 1 : 'none', width: isMobile ? 'auto' : '220px' }}>
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
        </div>

        {/* View Switcher - Only on Desktop */}
        {!isMobile && (
          <div className="view-toggle" style={{ marginLeft: 'auto' }}>
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
        )}
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <Loader2 size={40} className="animate-spin" color="var(--color-primary)" />
        </div>
      ) : (Array.isArray(filteredOffers) ? filteredOffers : []).length > 0 ? (
        <>
          {viewMode === 'grid' || isMobile ? (
            <div className="grid grid-3" style={{ gap: isMobile ? '1rem' : '1.5rem' }}>
              {(Array.isArray(filteredOffers) ? filteredOffers : []).map((offer) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  onRefresh={fetchOffers}
                />
              ))}
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Buyer</th>
                    <th onClick={() => handleSort('updatedAt')} style={{ cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        Property {sortBy === 'updatedAt' && (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                      </div>
                    </th>
                    <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        Status {sortBy === 'status' && (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                      </div>
                    </th>
                    <th onClick={() => handleSort('price')} style={{ cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        Price {sortBy === 'price' && (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                      </div>
                    </th>
                    <th>Agent</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(Array.isArray(filteredOffers) ? filteredOffers : []).map(offer => (
                    <tr key={offer.id}>
                      <td>
                        <div>
                          <div style={{ fontWeight: 600 }}>{offer.negotiation?.contact?.firstName} {offer.negotiation?.contact?.lastName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{offer.offerer}</div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500, fontSize: '0.8125rem' }}>{offer.negotiation?.property?.title}</div>
                      </td>
                      <td>{getStatusBadge(offer.status)}</td>
                      <td style={{ fontWeight: 600 }}>${offer.price.toLocaleString()}</td>
                      <td>
                        {offer.createdBy ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '1.5rem', height: '1.5rem', borderRadius: '50%', backgroundColor: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.625rem' }}>
                              {(offer.createdBy.firstName || offer.createdBy.email || '?')[0]}
                            </div>
                            <span style={{ fontSize: '0.8125rem' }}>{offer.createdBy.firstName || offer.createdBy.email || 'Unknown'}</span>
                          </div>
                        ) : '-'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.25rem' }}>
                          <button 
                            className="table-action-btn"
                            onClick={() => { /* Navigate to details */ }}
                            title="View Details"
                          >
                            <ExternalLink size={16} />
                          </button>
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
      ) : (        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '4rem', height: '4rem', borderRadius: '50%', backgroundColor: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
            <HandCoins size={32} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>No offers found</h3>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: '400px' }}>
            {searchQuery || statusFilter !== 'all' || selectedAgentId !== 'all' || quickFilter !== 'all'
              ? 'No offers match your current filters.'
              : 'There are no offers in your organization yet.'}
          </p>
          {!searchQuery && statusFilter === 'all' && selectedAgentId === 'all' && quickFilter === 'all' && permissions.can(Permission.DEALS_CREATE) && (
            <Button onClick={() => setView('form')}>
              Create Your First Offer
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default OffersView;