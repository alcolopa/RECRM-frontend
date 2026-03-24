import { useState, useEffect } from 'react';
import { Search, Loader2, UserSquare2, UserPlus, LayoutGrid, List, Edit2, Trash2, ExternalLink, RefreshCw } from 'lucide-react';
import { type Lead, LeadStatus, leadService } from '../api/leads';
import { type ContactType } from '../api/contacts';
import { type UserProfile, Permission } from '../api/users';
import Button from '../components/Button';
import { Input, Select } from '../components/Input';
import LeadCard from '../components/LeadCard';
import LeadDetails from '../components/LeadDetails';
import LeadForm from '../components/LeadForm';
import LeadConvertView from '../components/LeadConvertView';
import ConfirmModal from '../components/ConfirmModal';
import { usePermissions } from '../utils/permissions';

interface LeadsViewProps {
  organizationId: string;
  user: UserProfile;
}

const LeadsView: React.FC<LeadsViewProps> = ({ organizationId, user }) => {
  const permissions = usePermissions(user);
  const [view, setView] = useState<'list' | 'details' | 'form' | 'convert'>('list');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<LeadStatus | 'ALL'>('ALL');
  
  const [viewingLead, setViewingLead] = useState<Lead | undefined>(undefined);
  const [editingLead, setEditingLead] = useState<Lead | undefined>(undefined);
  const [convertingLead, setConvertingLead] = useState<Lead | undefined>(undefined);
  const [deletingLeadId, setDeletingLeadId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const response = await leadService.getAll(organizationId);
      setLeads(Array.isArray(response.data) ? response.data : []);
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
        await leadService.create({ ...data, organizationId });
      }
      setView('list');
      setEditingLead(undefined);
      fetchLeads();
    } catch (err) {
      throw err;
    }
  };

  const handleConvert = async (data: { type: ContactType; notes?: string }) => {
    if (!convertingLead) return;
    try {
      await leadService.convert(convertingLead.id, data, organizationId);
      setView('list');
      setConvertingLead(undefined);
      fetchLeads();
    } catch (err) {
      throw err;
    }
  };

  const handleDelete = async () => {
    if (!deletingLeadId) return;
    setIsDeleting(true);
    try {
      await leadService.delete(deletingLeadId, organizationId);
      setLeads(leads.filter(l => l.id !== deletingLeadId));
      setDeletingLeadId(null);
      if (viewingLead?.id === deletingLeadId) {
        setView('list');
        setViewingLead(undefined);
      }
    } catch (err) {
      console.error('Failed to delete lead', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredLeads = leads.filter(l => {
    const matchesSearch =
      l.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'ALL' || l.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: LeadStatus) => {
    const styles: Record<LeadStatus, { bg: string, color: string }> = {
      NEW: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981' },
      CONTACTED: { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' },
      QUALIFIED: { bg: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' },
      PROPOSAL_SENT: { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' },
      NEGOTIATION: { bg: 'rgba(236, 72, 153, 0.1)', color: '#ec4899' },
      LOST: { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' },
      CLOSED_WON: { bg: 'rgba(22, 163, 74, 0.1)', color: '#16a34a' }
    };
    const style = styles[status];
    return (
      <span style={{ 
        padding: '0.25rem 0.625rem', 
        borderRadius: '2rem', 
        fontSize: '0.75rem', 
        fontWeight: 600,
        backgroundColor: style.bg,
        color: style.color,
        textTransform: 'capitalize'
      }}>
        {status.toLowerCase().replace('_', ' ')}
      </span>
    );
  };

  if (view === 'details' && viewingLead) {
    return (
      <LeadDetails
        lead={viewingLead}
        user={user}
        onBack={() => {
          setView('list');
          setViewingLead(undefined);
        }}
        onEdit={(l) => {
          setEditingLead(l);
          setView('form');
        }}
        onDelete={(id) => setDeletingLeadId(id)}
        onConvert={(l) => {
          setConvertingLead(l);
          setView('convert');
        }}
      />
    );
  }

  if (view === 'form') {
    return (
      <LeadForm
        organizationId={organizationId}
        lead={editingLead}
        onSave={handleSave}
        onCancel={() => {
          setView('list');
          setEditingLead(undefined);
        }}
      />
    );
  }

  if (view === 'convert' && convertingLead) {
    return (
      <LeadConvertView
        lead={convertingLead}
        onConvert={handleConvert}
        onClose={() => {
          setView('list');
          setConvertingLead(undefined);
        }}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.25rem' }}>Leads</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Track and manage potential clients.</p>
        </div>
        {permissions.can(Permission.LEADS_CREATE) && (
          <Button 
            onClick={() => {
              setEditingLead(undefined);
              setView('form');
            }}
            leftIcon={<UserPlus size={20} />}
          >
            Add New Lead
          </Button>
        )}
      </header>

      {/* Filters & Search */}
      <div className="card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '250px' }}>
          <Input
            id="search"
            name="search"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={Search}
          />
        </div>
        <div style={{ width: '180px' }}>
          <Select
            id="status-filter"
            name="status-filter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            options={[
              { value: 'ALL', label: 'All Statuses' },
              ...Object.values(LeadStatus).map(s => ({ value: s, label: s.charAt(0) + s.slice(1).toLowerCase().replace('_', ' ') }))
            ]}
          />
        </div>
        <div style={{ display: 'flex', backgroundColor: 'var(--color-bg)', padding: '0.25rem', borderRadius: '0.5rem', border: '1px solid var(--color-border)' }}>
          <button 
            onClick={() => setViewMode('grid')}
            style={{ 
              padding: '0.5rem', borderRadius: '0.375rem', border: 'none', 
              backgroundColor: viewMode === 'grid' ? 'var(--color-surface)' : 'transparent',
              color: viewMode === 'grid' ? 'var(--color-primary)' : 'var(--color-text-muted)',
              cursor: 'pointer', boxShadow: viewMode === 'grid' ? 'var(--shadow-sm)' : 'none'
            }}
          >
            <LayoutGrid size={18} />
          </button>
          <button 
            onClick={() => setViewMode('table')}
            style={{ 
              padding: '0.5rem', borderRadius: '0.375rem', border: 'none', 
              backgroundColor: viewMode === 'table' ? 'var(--color-surface)' : 'transparent',
              color: viewMode === 'table' ? 'var(--color-primary)' : 'var(--color-text-muted)',
              cursor: 'pointer', boxShadow: viewMode === 'table' ? 'var(--shadow-sm)' : 'none'
            }}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <Loader2 className="animate-spin" size={40} color="var(--color-primary)" />
        </div>
      ) : filteredLeads.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-2 grid-3" style={{ gap: '1.5rem' }}>
            {filteredLeads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                user={user}
                onView={(l) => {
                  setViewingLead(l);
                  setView('details');
                }}
                onEdit={(l) => {
                  setEditingLead(l);
                  setView('form');
                }}
                onDelete={(id) => setDeletingLeadId(id)}
                onConvert={(l) => {
                  setConvertingLead(l);
                  setView('convert');
                }}
                canEdit={permissions.can(Permission.LEADS_EDIT)}
                canDelete={permissions.can(Permission.LEADS_DELETE)}
              />
            ))}
          </div>
        ) : (
          <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Budget</th>
                  <th>Location</th>
                  <th>Added</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} onClick={() => { setViewingLead(lead); setView('details'); }} style={{ cursor: 'pointer' }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ 
                          width: '2rem', height: '2rem', borderRadius: '50%', 
                          backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)', 
                          color: 'var(--color-primary)', display: 'flex', 
                          alignItems: 'center', justifyContent: 'center', 
                          fontSize: '0.75rem', fontWeight: 700 
                        }}>
                          {lead.firstName[0]}{lead.lastName[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{lead.firstName} {lead.lastName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{lead.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{getStatusBadge(lead.status)}</td>
                    <td style={{ fontWeight: 500 }}>
                      {lead.budget ? `$${Number(lead.budget).toLocaleString()}` : '-'}
                    </td>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                      {lead.preferredLocation || '-'}
                    </td>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button 
                          className="table-action-btn"
                          onClick={() => { setViewingLead(lead); setView('details'); }}
                          title="View Details"
                        >
                          <ExternalLink size={16} />
                        </button>
                        {permissions.can(Permission.LEADS_EDIT) && (
                          <button 
                            className="table-action-btn"
                            style={{ color: 'var(--color-primary)' }}
                            onClick={() => {
                              setConvertingLead(lead);
                              setView('convert');
                            }}
                            title="Convert to Contact"
                          >
                            <RefreshCw size={16} />
                          </button>
                        )}
                        {permissions.can(Permission.LEADS_EDIT) && (
                          <button 
                            className="table-action-btn"
                            onClick={() => { setEditingLead(lead); setView('form'); }}
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                        )}
                        {permissions.can(Permission.LEADS_DELETE) && (
                          <button 
                            className="table-action-btn"
                            style={{ color: 'var(--color-error)' }}
                            onClick={() => setDeletingLeadId(lead.id)}
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
        )
      ) : (
        <div className="card" style={{ padding: '5rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '4rem', height: '4rem', borderRadius: '50%', backgroundColor: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
            <UserSquare2 size={32} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>No leads found</h3>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: '400px' }}>
            {searchQuery || filterStatus !== 'ALL'
              ? 'No leads match your current search or filters.'
              : 'Start tracking potential interest and growing your pipeline.'}
          </p>
          {!searchQuery && filterStatus === 'ALL' && permissions.can(Permission.LEADS_CREATE) && (
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
        message="Are you sure you want to delete this lead? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default LeadsView;
