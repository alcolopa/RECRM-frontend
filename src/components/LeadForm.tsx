import { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Save,
  Target,
  DollarSign,
  MapPin,
  Briefcase,
  Layers,
  ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { mapBackendErrors, getErrorMessage } from '../utils/errors';
import { X } from 'lucide-react';
import { type Lead, LeadStatus } from '../api/leads';
import { PropertyType } from '../api/contacts';
import PhoneInput from './PhoneInput';
import { Input, Select, Textarea } from './Input';
import Button from './Button';
import UserSelector from './UserSelector';

interface LeadFormProps {
  lead?: Lead;
  onSave: (data: Partial<Lead>) => Promise<void>;
  onCancel: () => void;
  organizationId: string;
}

const LeadForm: React.FC<LeadFormProps> = ({ 
  lead, 
  onSave, 
  onCancel, 
  organizationId
}) => {
  const [formData, setFormData] = useState({
    firstName: lead?.firstName || '',
    lastName: lead?.lastName || '',
    email: lead?.email || '',
    phone: lead?.phone || '',
    status: lead?.status || LeadStatus.NEW,
    source: lead?.source || '',
    notes: lead?.notes || '',
    budget: lead?.budget ? Number(lead.budget) : undefined,
    preferredLocation: lead?.preferredLocation || '',
    propertyType: lead?.propertyType || undefined,
    assignedUserId: lead?.assignedUserId || ''
  });

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.budget && Number(formData.budget) < 0) {
      newErrors.budget = 'Budget cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePhoneChange = (value: string) => {
    setFormData(prev => ({ ...prev, phone: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const finalData = {
        ...formData,
        email: formData.email.trim() || undefined,
        budget: formData.budget ? Number(formData.budget) : undefined,
        organizationId
      };
      await onSave(finalData);
    } catch (err: any) {
      console.error('Failed to save lead', err);
      setError(getErrorMessage(err, 'Failed to save lead. Please check your information.'));
      const backendErrors = mapBackendErrors(err);
      if (Object.keys(backendErrors).length > 0) {
        setErrors(backendErrors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <header style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '1rem',
        marginBottom: isMobile ? '0.5rem' : '1rem'
      }}>
        <button 
          type="button" 
          onClick={onCancel}
          style={{ 
            padding: '0.5rem', 
            borderRadius: '50%', 
            width: '40px', 
            height: '40px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            cursor: 'pointer',
            color: 'var(--color-text)',
            flexShrink: 0
          }}
        >
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 1.875rem)', fontWeight: 700, marginBottom: '0.25rem' }}>
            {lead ? 'Edit Lead' : 'Add New Lead'}
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Fill in the details for your potential client.</p>
        </div>
      </header>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              padding: '1rem',
              background: 'rgba(220, 38, 38, 0.1)',
              color: 'var(--color-error)',
              borderRadius: 'var(--radius)',
              fontSize: '0.875rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              border: '1px solid var(--color-error)'
            }}
          >
            {error}
            <button
              onClick={() => setError(null)}
              style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: '0.25rem' }}
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="card" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        >
          <div className="grid grid-2">
            <Input
              label="First Name"
              id="firstName"
              name="firstName"
              required
              value={formData.firstName}
              onChange={handleChange}
              placeholder="John"
              icon={User}
              error={errors.firstName}
            />
            <Input
              label="Last Name"
              id="lastName"
              name="lastName"
              required
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Doe"
              icon={User}
              error={errors.lastName}
            />
          </div>

          <div className="grid grid-2">
            <Input
              label="Email Address"
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              icon={Mail}
              error={errors.email}
            />
            <PhoneInput 
              id="phone" 
              label="Phone Number"
              value={formData.phone} 
              onChange={handlePhoneChange}
              error={errors.phone}
            />
          </div>

          <div className="grid grid-3">
            <Select
              label="Status"
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              icon={Briefcase}
              options={Object.values(LeadStatus).map(s => ({ value: s, label: s.replace(/_/g, ' ') }))}
            />
            <Input
              label="Source"
              id="source"
              name="source"
              value={formData.source}
              onChange={handleChange}
              placeholder="e.g. Website"
              icon={Layers}
            />
            <UserSelector 
              organizationId={organizationId}
              selectedUserId={formData.assignedUserId}
              onSelect={(id) => setFormData(prev => ({ ...prev, assignedUserId: id }))}
              label="Assigned To"
            />
          </div>

          <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '0.5rem 0' }} />
          
          <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Target size={18} color="var(--color-primary)" /> Interests & Budget
          </h3>

          <div className="grid grid-3">
            <Input
              label="Budget Limit"
              id="budget"
              name="budget"
              type="number"
              value={formData.budget || ''}
              onChange={handleChange}
              placeholder="500000"
              icon={DollarSign}
            />
            <Select
              label="Property Type"
              id="propertyType"
              name="propertyType"
              value={formData.propertyType || ''}
              onChange={handleChange}
              options={[
                { value: '', label: 'Any Type' },
                ...Object.values(PropertyType).map(t => ({ value: t, label: t.toLowerCase() }))
              ]}
              style={{ textTransform: 'capitalize' }}
            />
            <Input
              label="Prefered Location"
              id="preferredLocation"
              name="preferredLocation"
              value={formData.preferredLocation}
              onChange={handleChange}
              placeholder="Beirut"
              icon={MapPin}
            />
          </div>

          <Textarea
            label="Internal Notes"
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Add any specific requirements or details..."
          />

          <div style={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            gap: '0.75rem', 
            marginTop: '1.5rem', 
            borderTop: '1px solid var(--color-border)', 
            paddingTop: '1.5rem' 
          }}>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel} 
              style={{ flex: 1 }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              isLoading={isLoading} 
              style={{ flex: isMobile ? 1 : 2 }}
              leftIcon={<Save size={20} />}
            >
              {lead ? 'Update Lead' : 'Save Lead'}
            </Button>
          </div>
        </motion.div>
      </form>
    </div>
  );
};

export default LeadForm;
