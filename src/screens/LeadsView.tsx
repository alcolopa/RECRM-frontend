import { useState, useEffect } from 'react';
import { Search, Loader2, UserSquare2, UserPlus, LayoutGrid, List, Edit2, Trash2, ExternalLink, RefreshCw, ChevronUp, ChevronDown } from 'lucide-react';
import { type Lead, LeadStatus, leadService } from '../api/leads';
import { type ContactType } from '../api/contacts';
import { Input } from '../components/Input';
import LeadCard from '../components/LeadCard';
import LeadForm from '../components/LeadForm';
import LeadDetails from '../components/LeadDetails';
import LeadConvertModal from '../components/LeadConvertModal';
import Button from '../components/Button';
import ConfirmModal from '../components/ConfirmModal';

import { type UserProfile, Permission } from '../api/users';
import { usePermissions } from '../utils/permissions';

interface LeadsViewProps {
  organizationId: string;
  user: UserProfile;
}

const LeadsView: React.FC<LeadsViewProps> = ({ organizationId, user }) => {
  const permissions = usePermissions(user);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'list' | 'form' | 'details'>('list');
  const [editingLead, setEditingLead] = useState<Lead | undefined>(undefined);
  const [viewingLead, setViewingLead] = useState<Lead | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<LeadStatus | 'ALL'>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Deletion state
  const [deletingLeadId, setDeletingLeadId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Conversion state
  const [convertingLead, setConvertingLead] = useState<Lead | null>(null);

  const getStatusBadge = (status: LeadStatus) => {
    const styles: Record<LeadStatus, { bg: string, color: string }> = {
      NEW: { bg: 'rgba(5, 150, 105, 0.1)', color: 'var(--color-primary)' },
      CONTACTED: { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' },
      QUALIFIED: { bg: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' },
      PROPOSAL_SENT: { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' },
      NEGOTIATION: { bg: 'rgba(236, 72, 153, 0.1)', color: '#ec4899' },
      LOST: { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' },
      CLOSED_WON: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }
    };
    const style = styles[status] || styles.NEW;
    return (
      <span className="badge" style={{ backgroundColor: style.bg, color: style.color }}>
        {status.replace(/_/g, ' ')}
      </span>
    );
  };

  const fetchLeads = async (pageNum = page, status = filterStatus, sort = sortBy, order = sortOrder) => {
    setIsLoading(true);
    try {
      const apiStatus = status === 'ALL' ? undefined : status;
      const response = await leadService.getAll(organizationId, pageNum, limit, apiStatus, sort, order);
      setLeads(Array.isArray(response.data.items) ? response.data.items : []);
      setTotalCount(response.data.total || 0);
    } catch (err) {
      console.error('Failed to fetch leads', err);
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
    fetchLeads(page, filterStatus, sortBy, sortOrder);
  }, [page, filterStatus, sortBy, sortOrder]);

  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    } else {
      fetchLeads(1, filterStatus, sortBy, sortOrder);
    }
  }, [organizationId, filterStatus]);

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

  const filteredLeads = (Array.isArray(leads) ? leads : []).filter(l => {
    const matchesSearch =
      l.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.email?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
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
        {permissions.can(Permission.LEADS_CREATE) && (
          <Button
            onClick={() => {
              setEditingLead(undefined);
              setView('form');
            }}
            leftIcon={<UserPlus size={20} />}
          >
            Add Lead
          </Button>
        )}
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

        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem', flex: 1 }}>
          <Button
            variant={filterStatus === 'ALL' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('ALL')}
          >
            All
          </Button>
          {(Array.isArray(Object.values(LeadStatus)) ? Object.values(LeadStatus) : []).map(status => (
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

        {/* View Switcher - Only on Desktop */}
        <div className="view-toggle hidden-mobile">
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
      ) : filteredLeads.length > 0 ? (
        <>
          {viewMode === 'grid' || window.innerWidth < 768 ? (
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
                  canEdit={permissions.can(Permission.LEADS_EDIT)}
                  canDelete={permissions.can(Permission.LEADS_DELETE)}
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
                        Lead {sortBy === 'firstName' && (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                      </div>
                    </th>
                    <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        Status {sortBy === 'status' && (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                      </div>
                    </th>
                    <th onClick={() => handleSort('budget')} style={{ cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        Budget {sortBy === 'budget' && (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                      </div>
                    </th>
                    <th>Location</th>
                    <th>Property Type</th>
                    <th>Assigned To</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map(lead => (
                    <tr key={lead.id}>
                      <td>
                        <div>
                          <div style={{ fontWeight: 600 }}>{lead.firstName} {lead.lastName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{lead.email || lead.phone || 'No contact info'}</div>
                        </div>
                      </td>
                      <td>{getStatusBadge(lead.status)}</td>
                      <td>{lead.budget ? `$${lead.budget.toLocaleString()}` : '-'}</td>
                      <td>{lead.preferredLocation || '-'}</td>
                      <td>{lead.propertyType || '-'}</td>
                      <td>
                        {lead.assignedUser ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '1.5rem', height: '1.5rem', borderRadius: '50%', backgroundColor: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.625rem' }}>
                              {lead.assignedUser.firstName[0]}
                            </div>
                            <span style={{ fontSize: '0.8125rem' }}>{lead.assignedUser.firstName}</span>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>Unassigned</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.25rem' }}>
                          <button 
                            className="table-action-btn"
                            onClick={() => { setViewingLead(lead); setView('details'); }}
                            title="View Details"
                          >
                            <ExternalLink size={16} />
                          </button>
                          <button 
                            className="table-action-btn"
                            style={{ color: 'var(--color-primary)' }}
                            onClick={() => setConvertingLead(lead)}
                            title="Convert to Contact"
                          >
                            <RefreshCw size={16} />
                          </button>
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
