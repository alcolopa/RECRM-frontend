import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Loader2, 
  HandCoins, 
  CheckCircle2, 
  Clock,
  User
} from 'lucide-react';
import { type Offer, offersService, OfferStatus } from '../api/offers';
import { type UserProfile, userService } from '../api/users';
import { Input, Select } from '../components/Input';
import Button from '../components/Button';
import OfferCard from '../components/OfferCard';
import OfferForm from '../components/OfferForm';
import { useNavigation } from '../contexts/NavigationContext';

interface OffersViewProps {
  organizationId: string;
}

const OffersView: React.FC<OffersViewProps> = ({ organizationId }) => {
  const { navigationState, clearNavigationState } = useNavigation();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'list' | 'form' | 'details'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [agents, setAgents] = useState<UserProfile[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('all');
  const [prefillProperty, setPrefillProperty] = useState<any>(null);

  const fetchOffers = async () => {
    setIsLoading(true);
    try {
      const response = await offersService.getAll(organizationId);
      setOffers(response.data);
    } catch (err) {
      console.error('Failed to fetch offers', err);
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
    fetchOffers();
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
    }
  }, [navigationState]);

  const filteredOffers = offers.filter(offer => {
    const propertyTitle = offer.negotiation?.property?.title || '';
    const contactName = `${offer.negotiation?.contact?.firstName} ${offer.negotiation?.contact?.lastName}`.toLowerCase();
    
    const matchesSearch = !searchQuery || 
      propertyTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contactName.includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || offer.status === statusFilter;
    const matchesAgent = selectedAgentId === 'all' || offer.createdById === selectedAgentId;
    
    return matchesSearch && matchesStatus && matchesAgent;
  });

  const stats = {
    total: offers.length,
    active: offers.filter(o => [OfferStatus.SUBMITTED, OfferStatus.UNDER_REVIEW, OfferStatus.COUNTERED].includes(o.status)).length,
    accepted: offers.filter(o => o.status === OfferStatus.ACCEPTED).length,
  };

  if (view === 'form') {
    return (
      <OfferForm
        onCancel={() => {
          setView('list');
          setPrefillProperty(null);
        }}
        onSuccess={() => {
          setView('list');
          setPrefillProperty(null);
          fetchOffers();
        }}
        organizationId={organizationId}
        initialProperty={prefillProperty}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.25rem' }}>Offers & Negotiations</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Track property offers and negotiation history.</p>
        </div>
        <Button
          onClick={() => setView('form')}
          leftIcon={<Plus size={20} />}
        >
          Create Offer
        </Button>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-3" style={{ gap: '1.5rem' }}>
        <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '0.75rem', backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)', color: 'var(--color-primary)' }}>
            <HandCoins size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Total Offers</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.total}</div>
          </div>
        </div>
        <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '0.75rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Active Negotiations</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.active}</div>
          </div>
        </div>
        <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '0.75rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Accepted Offers</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.accepted}</div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="card" style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '250px' }}>
          <Input
            id="searchQuery"
            name="searchQuery"
            type="text"
            placeholder="Search by property or buyer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={Search}
            style={{ fontSize: '0.875rem' }}
          />
        </div>
        <div style={{ width: '180px' }}>
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
        <div style={{ width: '180px' }}>
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
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <Loader2 size={40} className="animate-spin" color="var(--color-primary)" />
        </div>
      ) : filteredOffers.length > 0 ? (
        <div className="grid grid-1 grid-2" style={{ gap: '1.5rem' }}>
          {filteredOffers.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              onRefresh={fetchOffers}
            />
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '4rem', height: '4rem', borderRadius: '50%', backgroundColor: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
            <HandCoins size={32} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>No offers found</h3>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: '400px' }}>
            {searchQuery || statusFilter !== 'all' || selectedAgentId !== 'all'
              ? 'No offers match your current filters.'
              : 'There are no offers in your organization yet.'}
          </p>
          {!searchQuery && statusFilter === 'all' && selectedAgentId === 'all' && (
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
