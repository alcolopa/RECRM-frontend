import React, { useEffect, useState } from 'react';
import { adminService, type SubscriptionPlan } from '../../api/admin';
import Button from '../Button';
import { Loader2, Plus, Edit, Trash2, Users, Check, X } from 'lucide-react';
import { Input } from '../Input';
import { Select } from '../Input';
import Badge from '../Badge';

const emptyForm: Partial<SubscriptionPlan> = {
  name: '',
  description: '',
  billingModel: 'FLAT',
  price: '',
  basePrice: '',
  pricePerUser: '',
  maxUsers: 5,
  maxContacts: 500,
  maxProperties: 25,
  maxDeals: 100,
  features: [],
  isActive: true,
};

const AdminSubscriptionPlans: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<SubscriptionPlan>>(emptyForm);
  const [featureInput, setFeatureInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setError(null);
      const { data } = await adminService.getPlans();
      setPlans(data);
    } catch (err: any) {
      console.error('Failed to fetch plans', err);
      setError(err?.response?.data?.message || 'Failed to load plans.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOrUpdate = async () => {
    if (!formData.name) return;
    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        price: formData.price ? parseFloat(formData.price.toString()) : null,
        basePrice: formData.basePrice ? parseFloat(formData.basePrice.toString()) : null,
        pricePerUser: formData.pricePerUser ? parseFloat(formData.pricePerUser.toString()) : null,
        maxUsers: formData.maxUsers ? Number(formData.maxUsers) : null,
        maxContacts: formData.maxContacts ? Number(formData.maxContacts) : null,
        maxProperties: formData.maxProperties ? Number(formData.maxProperties) : null,
        maxDeals: formData.maxDeals ? Number(formData.maxDeals) : null,
      };
      if (editingId) {
        await adminService.updatePlan(editingId, payload);
      } else {
        await adminService.createPlan(payload);
      }
      setIsFormOpen(false);
      setEditingId(null);
      setFormData(emptyForm);
      fetchPlans();
    } catch (err) {
      console.error('Save failed', err);
    } finally {
      setIsSaving(false);
    }
  };

  const startEdit = (plan: SubscriptionPlan) => {
    setEditingId(plan.id);
    setFormData({
      ...plan,
      features: plan.features || [],
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this subscription plan?')) return;
    try {
      await adminService.deletePlan(id);
      fetchPlans();
    } catch (err: any) {
      const msg = err?.response?.data?.plan || err?.response?.data?.message || 'Error deleting plan.';
      alert(msg);
    }
  };

  const addFeature = () => {
    const f = featureInput.trim();
    if (!f) return;
    const current = (formData.features || []) as string[];
    if (!current.includes(f)) {
      setFormData((prev) => ({ ...prev, features: [...current, f] }));
    }
    setFeatureInput('');
  };

  const removeFeature = (feature: string) => {
    setFormData((prev) => ({
      ...prev,
      features: ((prev.features || []) as string[]).filter((f) => f !== feature),
    }));
  };

  const getPriceDisplay = (plan: SubscriptionPlan) => {
    if (plan.billingModel === 'PER_USER') {
      return (
        <div>
          <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>
            ${plan.basePrice || 0}
          </span>
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', fontWeight: 400 }}> base</span>
          <div style={{ fontSize: '0.875rem', color: 'var(--foreground)', fontWeight: 500 }}>
            + ${plan.pricePerUser || 0}
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', fontWeight: 400 }}>/user/mo</span>
          </div>
        </div>
      );
    }
    return (
      <div>
        <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>${plan.price || 0}</span>
        <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', fontWeight: 400 }}>/mo</span>
      </div>
    );
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
        <button onClick={fetchPlans} className="btn btn-primary">Retry</button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Subscription Plans</h1>
        <Button onClick={() => { setEditingId(null); setFormData(emptyForm); setFeatureInput(''); setIsFormOpen(true); }}>
          <Plus size={16} style={{ marginRight: '0.25rem' }} /> Create Plan
        </Button>
      </div>

      {/* Create / Edit Form */}
      {isFormOpen && (
        <div style={{ backgroundColor: 'var(--surface)', padding: '2rem', borderRadius: '0.75rem', border: '1px solid var(--border)', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>
            {editingId ? 'Edit Plan' : 'Create Plan'}
          </h2>

          {/* Row 1: Name, Description, Billing Model */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 200px', gap: '1rem', marginBottom: '1rem' }}>
            <Input
              label="Plan Name"
              value={formData.name || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Professional"
            />
            <Input
              label="Description"
              value={formData.description || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Short description"
            />
            <Select
              label="Billing Model"
              options={[
                { value: 'FLAT', label: 'Flat Rate' },
                { value: 'PER_USER', label: 'Per User' },
              ]}
              value={formData.billingModel || 'FLAT'}
              onChange={(e) => setFormData((prev) => ({ ...prev, billingModel: e.target.value as any }))}
            />
          </div>

          {/* Row 2: Pricing (conditional) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            {formData.billingModel === 'FLAT' ? (
              <Input
                label="Monthly Price ($)"
                type="number"
                value={formData.price || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                placeholder="49"
              />
            ) : (
              <>
                <Input
                  label="Base Price ($)"
                  type="number"
                  value={formData.basePrice || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, basePrice: e.target.value }))}
                  placeholder="29"
                />
                <Input
                  label="Price Per User ($)"
                  type="number"
                  value={formData.pricePerUser || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, pricePerUser: e.target.value }))}
                  placeholder="10"
                />
              </>
            )}
          </div>

          {/* Row 3: Limits */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <Input
              label="Max Users"
              type="number"
              value={formData.maxUsers || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, maxUsers: parseInt(e.target.value, 10) || null }))}
              helperText="Leave empty for unlimited"
            />
            <Input
              label="Max Contacts"
              type="number"
              value={formData.maxContacts || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, maxContacts: parseInt(e.target.value, 10) || null }))}
            />
            <Input
              label="Max Properties"
              type="number"
              value={formData.maxProperties || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, maxProperties: parseInt(e.target.value, 10) || null }))}
            />
            <Input
              label="Max Deals"
              type="number"
              value={formData.maxDeals || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, maxDeals: parseInt(e.target.value, 10) || null }))}
            />
          </div>

          {/* Row 4: Features */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.025em', display: 'block', marginBottom: '0.375rem' }}>
              Features
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addFeature(); } }}
                placeholder="Type a feature and press Enter..."
                style={{ flex: 1, padding: '0.5rem 0.75rem', border: '1px solid var(--border)', borderRadius: '0.375rem', backgroundColor: 'var(--color-bg)', color: 'var(--foreground)', fontSize: '0.875rem' }}
              />
              <Button variant="outline" size="sm" onClick={addFeature}>Add</Button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
              {((formData.features || []) as string[]).map((f) => (
                <span key={f} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                  padding: '0.25rem 0.625rem', borderRadius: '9999px', fontSize: '0.8125rem', fontWeight: 500,
                  backgroundColor: 'var(--primary-light)', color: 'var(--primary)',
                }}>
                  <Check size={12} /> {f}
                  <button onClick={() => removeFeature(f)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', display: 'flex', padding: 0 }}>
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Row 5: Active toggle */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.isActive !== false}
                onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                style={{ width: '1rem', height: '1rem', accentColor: 'var(--primary)', cursor: 'pointer' }}
              />
              Plan is active and visible to organizations
            </label>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <Button variant="outline" onClick={() => { setIsFormOpen(false); setEditingId(null); }}>Cancel</Button>
            <Button onClick={handleCreateOrUpdate} isLoading={isSaving}>Save Plan</Button>
          </div>
        </div>
      )}

      {/* Plan Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {plans.map((plan) => (
          <div key={plan.id} style={{
            backgroundColor: 'var(--surface)',
            borderRadius: '0.75rem',
            border: `1px solid ${plan.isActive ? 'var(--border)' : 'var(--danger)'}`,
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            opacity: plan.isActive ? 1 : 0.7,
            transition: 'all 0.2s',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--foreground)' }}>{plan.name}</h3>
                  {!plan.isActive && <Badge variant="danger" size="sm">Inactive</Badge>}
                  <Badge variant="outline" size="sm">{plan.billingModel === 'PER_USER' ? 'Per User' : 'Flat'}</Badge>
                </div>
                {plan.description && (
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>{plan.description}</div>
                )}
                {getPriceDisplay(plan)}
              </div>
              <div style={{ display: 'flex', gap: '0.375rem', flexShrink: 0, marginLeft: '0.5rem' }}>
                <button onClick={() => startEdit(plan)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', padding: '0.25rem' }}>
                  <Edit size={16} />
                </button>
                <button onClick={() => handleDelete(plan.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: '0.25rem' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Limits */}
            <div style={{ flex: 1, marginBottom: '1rem' }}>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Users size={14} /> <strong>{plan.maxUsers ?? '∞'}</strong> Users</li>
                <li><strong>{plan.maxContacts ?? '∞'}</strong> Contacts · <strong>{plan.maxProperties ?? '∞'}</strong> Properties · <strong>{plan.maxDeals ?? '∞'}</strong> Deals</li>
              </ul>
            </div>

            {/* Features */}
            {plan.features && (plan.features as string[]).length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                  {(plan.features as string[]).map((f) => (
                    <span key={f} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.125rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 500, backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                      <Check size={10} /> {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Subscriber count */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
              <Users size={14} style={{ marginRight: '0.25rem', verticalAlign: 'middle' }} />
              {plan._count?.subscriptions || 0} organization{(plan._count?.subscriptions || 0) !== 1 ? 's' : ''} subscribed
            </div>
          </div>
        ))}
        {plans.length === 0 && !isFormOpen && (
          <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', backgroundColor: 'var(--surface)', borderRadius: '0.75rem', border: '1px dashed var(--border)', color: 'var(--color-text-muted)' }}>
            No subscription plans defined. Create one to get started.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSubscriptionPlans;
