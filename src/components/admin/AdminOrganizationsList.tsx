import React, { useEffect, useState } from 'react';
import { adminService, type SubscriptionPlan, type PlanAddon } from '../../api/admin';
import Button from '../Button';
import { Loader2, PowerOff, Power, CreditCard, Package, ChevronDown, ChevronUp, X } from 'lucide-react';
import Badge from '../Badge';
import { Select } from '../Input';

interface AssignPlanModalProps {
  org: any;
  plans: SubscriptionPlan[];
  onClose: () => void;
  onAssigned: () => void;
}

const AssignPlanModal: React.FC<AssignPlanModalProps> = ({ org, plans, onClose, onAssigned }) => {
  const [selectedPlanId, setSelectedPlanId] = useState(org.subscription?.planId || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleAssign = async () => {
    if (!selectedPlanId) return;
    setIsSaving(true);
    try {
      await adminService.assignPlanToOrg(org.id, selectedPlanId, {});
      onAssigned();
    } catch (err) {
      console.error('Failed to assign plan', err);
      alert('Error assigning plan.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={onClose} />
      <div style={{ position: 'relative', backgroundColor: 'var(--surface)', borderRadius: '0.75rem', border: '1px solid var(--border)', padding: '2rem', width: '100%', maxWidth: '480px', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Assign Plan to {org.name}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
            <X size={20} />
          </button>
        </div>
        <Select
          label="Subscription Plan"
          options={plans.filter(p => p.isActive).map(p => ({
            value: p.id,
            label: `${p.name} — $${p.billingModel === 'PER_USER' ? `${p.basePrice || 0} + $${p.pricePerUser || 0}/user` : `${p.price || 0}/mo`}`,
          }))}
          value={selectedPlanId}
          onChange={(e) => setSelectedPlanId(e.target.value)}
          placeholder="Select a plan..."
        />
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleAssign} isLoading={isSaving} disabled={!selectedPlanId}>Assign Plan</Button>
        </div>
      </div>
    </div>
  );
};

interface ManageAddonsModalProps {
  org: any;
  addons: PlanAddon[];
  onClose: () => void;
  onUpdated: () => void;
}

const ManageAddonsModal: React.FC<ManageAddonsModalProps> = ({ org, addons, onClose, onUpdated }) => {
  const [isBusy, setIsBusy] = useState<string | null>(null);

  const subscriptionId = org.subscription?.id;
  const activeAddonIds = new Set(
    (org.subscription?.addons || []).map((sa: any) => sa.addonId)
  );

  if (!subscriptionId) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={onClose} />
        <div style={{ position: 'relative', backgroundColor: 'var(--surface)', borderRadius: '0.75rem', border: '1px solid var(--border)', padding: '2rem', width: '100%', maxWidth: '480px', zIndex: 1 }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Manage Add-ons for {org.name}</h3>
          <p style={{ color: 'var(--color-text-muted)' }}>Please assign a subscription plan first before adding add-ons.</p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
        </div>
      </div>
    );
  }

  const toggleAddon = async (addonId: string) => {
    setIsBusy(addonId);
    try {
      if (activeAddonIds.has(addonId)) {
        await adminService.removeAddonFromOrg(subscriptionId, addonId);
      } else {
        await adminService.assignAddonToOrg(subscriptionId, addonId);
      }
      onUpdated();
    } catch (err) {
      console.error('Failed to toggle addon', err);
    } finally {
      setIsBusy(null);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={onClose} />
      <div style={{ position: 'relative', backgroundColor: 'var(--surface)', borderRadius: '0.75rem', border: '1px solid var(--border)', padding: '2rem', width: '100%', maxWidth: '520px', zIndex: 1, maxHeight: '80vh', overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Manage Add-ons — {org.name}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {addons.filter(a => a.isActive).length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '2rem 0' }}>No add-ons available. Create some in the Add-ons tab.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {addons.filter(a => a.isActive).map((addon) => {
              const isActive = activeAddonIds.has(addon.id);
              return (
                <div key={addon.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  border: `1px solid ${isActive ? 'var(--primary)' : 'var(--border)'}`,
                  backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                  transition: 'all 0.2s',
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--foreground)' }}>{addon.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      ${addon.price}/mo{addon.description ? ` · ${addon.description}` : ''}
                    </div>
                  </div>
                  <Button
                    variant={isActive ? 'danger' : 'primary'}
                    size="sm"
                    isLoading={isBusy === addon.id}
                    onClick={() => toggleAddon(addon.id)}
                  >
                    {isActive ? 'Remove' : 'Add'}
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <Button variant="outline" onClick={onClose}>Done</Button>
        </div>
      </div>
    </div>
  );
};

const AdminOrganizationsList: React.FC = () => {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [addons, setAddons] = useState<PlanAddon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [assignPlanOrg, setAssignPlanOrg] = useState<any | null>(null);
  const [manageAddonsOrg, setManageAddonsOrg] = useState<any | null>(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setError(null);
      const [orgsRes, plansRes, addonsRes] = await Promise.all([
        adminService.getOrganizations(),
        adminService.getPlans(),
        adminService.getAddons(),
      ]);
      setOrganizations(orgsRes.data);
      setPlans(plansRes.data);
      setAddons(addonsRes.data);
    } catch (err: any) {
      console.error('Failed to fetch data', err);
      setError(err?.response?.data?.message || 'Failed to load organizations.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await adminService.updateOrganizationStatus(id, !currentStatus);
      fetchAll();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Loader2 className="animate-spin" size={32} color="var(--primary)" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <div style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--danger)', marginBottom: '0.5rem' }}>Error</div>
        <div style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>{error}</div>
        <button onClick={fetchAll} className="btn btn-primary">Retry</button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Organizations Management</h1>
        <Badge variant="outline" size="lg">{organizations.length} total</Badge>
      </div>

      <div style={{ backgroundColor: 'var(--surface)', borderRadius: '0.75rem', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
            <tr>
              {['Name', 'Status', 'Plan', 'Users', 'Contacts', 'Properties', 'Deals', 'Add-ons', 'Actions'].map((h) => (
                <th key={h} style={{ padding: '0.875rem 1rem', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.8125rem', textAlign: h === 'Actions' ? 'right' : 'left' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {organizations.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  No organizations found.
                </td>
              </tr>
            ) : organizations.map((org) => (
              <React.Fragment key={org.id}>
                <tr style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.15s', backgroundColor: expandedId === org.id ? 'var(--bg-secondary)' : undefined }}
                  onClick={() => setExpandedId(expandedId === org.id ? null : org.id)}
                >
                  <td style={{ padding: '0.875rem 1rem', fontWeight: 500 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {expandedId === org.id ? <ChevronUp size={14} color="var(--color-text-muted)" /> : <ChevronDown size={14} color="var(--color-text-muted)" />}
                      <div>
                        {org.name}
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 400 }}>{org.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <Badge variant={org.isSuspended ? 'danger' : 'success'} size="sm">
                      {org.isSuspended ? 'Suspended' : 'Active'}
                    </Badge>
                  </td>
                  <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem' }}>
                    {org.subscription?.plan?.name || <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>No plan</span>}
                  </td>
                  <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem' }}>{org._count?.memberships || 0}</td>
                  <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem' }}>{org._count?.contacts || 0}</td>
                  <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem' }}>{org._count?.properties || 0}</td>
                  <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem' }}>{org._count?.deals || 0}</td>
                  <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem' }}>
                    {org.subscription?.addons?.length || 0}
                  </td>
                  <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'flex-end' }}>
                      <Button variant="outline" size="sm" onClick={() => setAssignPlanOrg(org)}>
                        <CreditCard size={13} style={{ marginRight: '0.25rem' }} /> Plan
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setManageAddonsOrg(org)}>
                        <Package size={13} style={{ marginRight: '0.25rem' }} /> Add-ons
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => toggleStatus(org.id, org.isSuspended)}>
                        {org.isSuspended ? (
                          <><Power size={13} style={{ marginRight: '0.25rem' }} /> Activate</>
                        ) : (
                          <><PowerOff size={13} style={{ marginRight: '0.25rem' }} color="var(--danger)" /> Suspend</>
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
                {/* Expanded details row */}
                {expandedId === org.id && (
                  <tr>
                    <td colSpan={9} style={{ padding: '1rem 1.5rem 1.5rem', backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        {/* Subscription Details */}
                        <div>
                          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                            Subscription Details
                          </div>
                          {org.subscription ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', fontSize: '0.875rem' }}>
                              <div><strong>Plan:</strong> {org.subscription.plan?.name}</div>
                              <div><strong>Billing:</strong> {org.subscription.plan?.billingModel === 'PER_USER'
                                ? `$${org.subscription.plan.basePrice || 0} + $${org.subscription.plan.pricePerUser || 0}/user`
                                : `$${org.subscription.plan?.price || 0}/mo (flat)`}</div>
                              <div><strong>Status:</strong> {org.subscription.status}</div>
                              <div><strong>Since:</strong> {new Date(org.subscription.startDate).toLocaleDateString()}</div>
                            </div>
                          ) : (
                            <div style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>No subscription assigned.</div>
                          )}
                        </div>
                        {/* Active Addons */}
                        <div>
                          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                            Active Add-ons
                          </div>
                          {org.subscription?.addons?.length > 0 ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                              {org.subscription.addons.map((sa: any) => (
                                <Badge key={sa.id} variant="info" size="md">
                                  {sa.addon?.name} · ${sa.addon?.price}/mo
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <div style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>No add-ons active.</div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {assignPlanOrg && (
        <AssignPlanModal
          org={assignPlanOrg}
          plans={plans}
          onClose={() => setAssignPlanOrg(null)}
          onAssigned={() => { setAssignPlanOrg(null); fetchAll(); }}
        />
      )}
      {manageAddonsOrg && (
        <ManageAddonsModal
          org={manageAddonsOrg}
          addons={addons}
          onClose={() => setManageAddonsOrg(null)}
          onUpdated={() => { setManageAddonsOrg(null); fetchAll(); }}
        />
      )}
    </div>
  );
};

export default AdminOrganizationsList;
