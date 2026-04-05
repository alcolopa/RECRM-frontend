import React, { useEffect, useState } from 'react';
import { adminService, type PlanAddon } from '../../api/admin';
import Button from '../Button';
import { Loader2, Plus, Edit, Trash2, Check, X, Package } from 'lucide-react';
import { Input } from '../Input';
import { Textarea } from '../Input';
import Badge from '../Badge';

const emptyForm: Partial<PlanAddon> = {
  name: '',
  description: '',
  price: '',
  features: [],
  isActive: true,
};

const AdminAddons: React.FC = () => {
  const [addons, setAddons] = useState<PlanAddon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<PlanAddon>>(emptyForm);
  const [featureInput, setFeatureInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchAddons();
  }, []);

  const fetchAddons = async () => {
    try {
      setError(null);
      const { data } = await adminService.getAddons();
      setAddons(data);
    } catch (err: any) {
      console.error('Failed to fetch addons', err);
      setError(err?.response?.data?.message || 'Failed to load add-ons.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOrUpdate = async () => {
    if (!formData.name || !formData.price) return;
    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price as string),
      };
      if (editingId) {
        await adminService.updateAddon(editingId, payload);
      } else {
        await adminService.createAddon(payload);
      }
      setIsFormOpen(false);
      setEditingId(null);
      setFormData(emptyForm);
      fetchAddons();
    } catch (err) {
      console.error('Save failed', err);
    } finally {
      setIsSaving(false);
    }
  };

  const startEdit = (addon: PlanAddon) => {
    setEditingId(addon.id);
    setFormData({ ...addon, features: addon.features || [] });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this add-on?')) return;
    try {
      await adminService.deleteAddon(id);
      fetchAddons();
    } catch (err: any) {
      const msg = err?.response?.data?.addon || err?.response?.data?.message || 'Error deleting add-on.';
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
        <button onClick={fetchAddons} className="btn btn-primary">Retry</button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Add-ons</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Create purchasable add-on packages that organizations can activate alongside their subscription plan.
          </p>
        </div>
        <Button onClick={() => { setEditingId(null); setFormData(emptyForm); setFeatureInput(''); setIsFormOpen(true); }}>
          <Plus size={16} style={{ marginRight: '0.25rem' }} /> Create Add-on
        </Button>
      </div>

      {/* Create / Edit Form */}
      {isFormOpen && (
        <div style={{ backgroundColor: 'var(--surface)', padding: '2rem', borderRadius: '0.75rem', border: '1px solid var(--border)', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>
            {editingId ? 'Edit Add-on' : 'Create Add-on'}
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: '1rem', marginBottom: '1rem' }}>
            <Input
              label="Add-on Name"
              value={formData.name || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. AI Matching Pack"
            />
            <Input
              label="Monthly Price ($)"
              type="number"
              value={formData.price || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
              placeholder="19"
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <Textarea
              label="Description"
              value={formData.description || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this add-on provides..."
              style={{ minHeight: '80px' }}
            />
          </div>

          {/* Features */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.025em', display: 'block', marginBottom: '0.375rem' }}>
              Included Features
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

          {/* Active toggle */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.isActive !== false}
                onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                style={{ width: '1rem', height: '1rem', accentColor: 'var(--primary)', cursor: 'pointer' }}
              />
              Add-on is active and available for purchase
            </label>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <Button variant="outline" onClick={() => { setIsFormOpen(false); setEditingId(null); }}>Cancel</Button>
            <Button onClick={handleCreateOrUpdate} isLoading={isSaving}>Save Add-on</Button>
          </div>
        </div>
      )}

      {/* Add-on Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {addons.map((addon) => (
          <div key={addon.id} style={{
            backgroundColor: 'var(--surface)',
            borderRadius: '0.75rem',
            border: `1px solid ${addon.isActive ? 'var(--border)' : 'var(--danger)'}`,
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            opacity: addon.isActive ? 1 : 0.7,
            transition: 'all 0.2s',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                  <Package size={18} color="var(--primary)" />
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--foreground)' }}>{addon.name}</h3>
                  {!addon.isActive && <Badge variant="danger" size="sm">Inactive</Badge>}
                </div>
                {addon.description && (
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>{addon.description}</div>
                )}
                <div style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--primary)' }}>
                  ${addon.price}
                  <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', fontWeight: 400 }}>/mo</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.375rem', flexShrink: 0 }}>
                <button onClick={() => startEdit(addon)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', padding: '0.25rem' }}>
                  <Edit size={16} />
                </button>
                <button onClick={() => handleDelete(addon.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: '0.25rem' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Features */}
            {addon.features && (addon.features as string[]).length > 0 && (
              <div style={{ flex: 1, marginBottom: '1rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                  {(addon.features as string[]).map((f) => (
                    <span key={f} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.125rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 500, backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                      <Check size={10} /> {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Active subscriptions count */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
              <Package size={14} style={{ marginRight: '0.25rem', verticalAlign: 'middle' }} />
              {addon._count?.subscriptionAddons || 0} active subscription{(addon._count?.subscriptionAddons || 0) !== 1 ? 's' : ''}
            </div>
          </div>
        ))}
        {addons.length === 0 && !isFormOpen && (
          <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', backgroundColor: 'var(--surface)', borderRadius: '0.75rem', border: '1px dashed var(--border)', color: 'var(--color-text-muted)' }}>
            <Package size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
            <div>No add-ons defined yet. Create one to get started.</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAddons;
