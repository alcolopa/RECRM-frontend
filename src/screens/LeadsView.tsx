import { useState, useEffect } from 'react';
import { Search, Loader2, UserSquare2, UserPlus } from 'lucide-react';
import { type Lead, LeadStatus, leadService } from '../api/leads';
import { type ContactType } from '../api/contacts';
import { Input } from '../components/Input';
import LeadCard from '../components/LeadCard';
import LeadForm from '../components/LeadForm';
import LeadDetails from '../components/LeadDetails';
import LeadConvertModal from '../components/LeadConvertModal';
import Button from '../components/Button';
import ConfirmModal from '../components/ConfirmModal';

interface LeadsViewProps {
  organizationId: string;
}

const LeadsView: React.FC<LeadsViewProps> = ({ organizationId }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'list' | 'form' | 'details'>('list');
  const [editingLead, setEditingLead] = useState<Lead | undefined>(undefined);
  const [viewingLead, setViewingLead] = useState<Lead | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<LeadStatus | 'ALL'>('ALL');
  
  // Deletion state
  const [deletingLeadId, setDeletingLeadId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Conversion state
  const [convertingLead, setConvertingLead] = useState<Lead | null>(null);

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const response = await leadService.getAll(organizationId);
      setLeads(response.data);
    } catch (err) {
      console.error('Failed to fetch leads', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [organizationId]);

  const handleSave = async (data: Partial<Lead>) => {
    try {
      if (editingLead) {
        await leadService.update(editingLead.id, data, organizationId);
      } else {
        await leadService.create({ ...data, organizationId } as any);
      }
      
      setView('list');
      setEditingLead(undefined);
      fetchLeads();
    } catch (err) {
      console.error('Failed to save lead', err);
    }
  };

  const handleDelete = async () => {
    if (!deletingLeadId) return;
    setIsDeleting(true);
    try {
      await leadService.delete(deletingLeadId, organizationId);
      setDeletingLeadId(null);
      if (viewingLead?.id === deletingLeadId) {
        setView('list');
        setViewingLead(undefined);
      }
      fetchLeads();
    } catch (err) {
      console.error('Failed to delete lead', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConvert = async (data: { type: ContactType; notes?: string }) => {
    if (!convertingLead) return;
    try {
      await leadService.convert(convertingLead.id, data, organizationId);
      setConvertingLead(null);
      fetchLeads();
      // Optionally navigate to contacts or show success
    } catch (err) {
      console.error('Failed to convert lead', err);
      throw err;
    }
  };

  const filteredLeads = leads.filter(l => {
    const matchesSearch =
      l.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filterStatus === 'ALL' || l.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  if (view === 'form') {
    return (
      <LeadForm
        lead={editingLead}
        onSave={handleSave}
        onCancel={() => {
          setView(viewingLead ? 'details' : 'list');
          setEditingLead(undefined);
        }}
        organizationId={organizationId}
      />
    );
  }

  if (view === 'details' && viewingLead) {
    return (
      <LeadDetails
        lead={viewingLead}
        onBack={() => {
          setView('list');
          setViewingLead(undefined);
        }}
        onEdit={(l) => {
          setEditingLead(l);
          setView('form');
        }}
        onDelete={(id) => setDeletingLeadId(id)}
        onConvert={(l) => setConvertingLead(l)}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.25rem' }}>Leads</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Track and nurture your potential properties and clients.</p>
        </div>
        <Button
          onClick={() => {
            setEditingLead(undefined);
            setView('form');
          }}
          leftIcon={<UserPlus size={20} />}
        >
          Add Lead
        </Button>
      </header>

      {/* Filters & Search */}
      <div className="card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '250px' }}>
          <Input
            id="searchQuery"
            name="searchQuery"
            type="text"
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={Search}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
          <Button
            variant={filterStatus === 'ALL' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('ALL')}
          >
            All
          </Button>
          {Object.values(LeadStatus).map(status => (
            <Button
              key={status}
              variant={filterStatus === status ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus(status)}
              style={{ whiteSpace: 'nowrap' }}
            >
              {status.replace(/_/g, ' ')}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <Loader2 size={40} className="animate-spin" color="var(--color-primary)" />
        </div>
      ) : filteredLeads.length > 0 ? (
        <div className="grid grid-2 grid-3" style={{ gap: '1.5rem' }}>
          {filteredLeads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onView={(l) => {
                setViewingLead(l);
                setView('details');
              }}
              onEdit={(l) => {
                setEditingLead(l);
                setView('form');
              }}
              onDelete={(id) => setDeletingLeadId(id)}
              onConvert={(l) => setConvertingLead(l)}
            />
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '4rem', height: '4rem', borderRadius: '50%', backgroundColor: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
            <UserSquare2 size={32} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>No leads found</h3>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: '400px' }}>
            {searchQuery || filterStatus !== 'ALL'
              ? 'No leads match your current search or filters.'
              : 'Start tracking potential interest and growing your pipeline.'}
          </p>
          {!searchQuery && filterStatus === 'ALL' && (
            <Button onClick={() => setView('form')}>
              Add Your First Lead
            </Button>
          )}
        </div>
      )}

      {/* Modals */}
      <ConfirmModal
        isOpen={!!deletingLeadId}
        onClose={() => setDeletingLeadId(null)}
        onConfirm={handleDelete}
        title="Delete Lead"
        message="Are you sure you want to delete this lead? This will permanently remove all associated information."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />

      {convertingLead && (
        <LeadConvertModal
          isOpen={!!convertingLead}
          onClose={() => setConvertingLead(null)}
          onConvert={handleConvert}
          lead={convertingLead}
        />
      )}
    </div>
  );
};

export default LeadsView;
