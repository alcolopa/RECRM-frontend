import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  Save, 
  AlertCircle,
  X,
  Calendar as CalendarIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { type CalendarEvent, type CalendarEventType } from '../api/calendar';
import Button from './Button';
import { Input, Select, Textarea } from './Input';
import UserSelector from './UserSelector';
import ContactSelector from './ContactSelector';
import DateSelector from './DateSelector';
import { usePermissions } from '../utils/permissions';
import { Permission, type UserProfile } from '../api/users';

interface CalendarEventFormProps {
  event?: CalendarEvent | null;
  onSave: (data: Partial<CalendarEvent>) => Promise<void>;
  onCancel: () => void;
  organizationId: string;
  user: UserProfile;
}

const CalendarEventForm: React.FC<CalendarEventFormProps> = ({ 
  event, 
  onSave, 
  onCancel, 
  organizationId,
  user
}) => {
  const permissions = usePermissions(user);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const startSelectorRef = useRef<HTMLDivElement>(null);
  const endSelectorRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<Partial<CalendarEvent>>({
    title: event?.title || '',
    description: event?.description || '',
    startTime: event?.startTime ? new Date(event.startTime).toISOString() : '',
    endTime: event?.endTime ? new Date(event.endTime).toISOString() : '',
    type: event?.type || 'MEETING',
    userId: event?.userId || user.id,
    contactId: event?.contactId || '',
    leadId: event?.leadId || ''
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      setError('Title is required');
      return;
    }
    if (!formData.startTime) {
      setError('Start time is required');
      return;
    }
    if (!formData.endTime) {
      setError('End time is required');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = { ...formData };
      if (!data.contactId) delete data.contactId;
      if (!data.leadId) delete data.leadId;
      
      await onSave(data);
    } catch (err: any) {
      console.error('Failed to save event', err);
      setError(err.response?.data?.message || 'Failed to save event. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button 
          type="button" 
          onClick={onCancel}
          style={{ 
            padding: '0.5rem', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--color-surface)', border: '1px solid var(--color-border)', cursor: 'pointer', color: 'var(--color-text)', flexShrink: 0
          }}
        >
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            {event ? 'Edit Event' : 'Schedule Event'}
          </h1>
          <p style={{ color: 'var(--color-text-muted)' }}>
            {event ? 'Update appointment details and participants.' : 'Schedule a new meeting, call, or site visit.'}
          </p>
        </div>
      </header>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              padding: '1rem', background: 'rgba(220, 38, 38, 0.1)', color: 'var(--color-error)', borderRadius: 'var(--radius)',
              fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              width: '100%', border: '1px solid var(--color-error)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={18} />
              {error}
            </div>
            <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: '0.25rem' }}>
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="card" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '2rem', padding: isMobile ? '1.5rem' : '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Input 
            label="Event Title"
            id="title"
            name="title"
            required
            placeholder="e.g. Property Viewing"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            icon={CalendarIcon}
          />
          
          <div className="grid grid-2">
            <Select 
              label="Event Type"
              id="type"
              name="type"
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value as CalendarEventType})}
              options={[
                { value: 'MEETING', label: 'Meeting' },
                { value: 'CALL', label: 'Call' },
                { value: 'SITE_VISIT', label: 'Site Visit' },
                { value: 'BLOCKER', label: 'Time Blocker' },
                { value: 'OTHER', label: 'Other' }
              ]}
            />
            {(permissions.can(Permission.CALENDAR_VIEW_ALL) || user.role === 'OWNER' || user.role === 'ADMIN') && (
              <UserSelector 
                label="Assigned To"
                organizationId={organizationId}
                selectedUserId={formData.userId}
                onSelect={(id) => setFormData({...formData, userId: id})}
              />
            )}
          </div>

          <div className="grid grid-2">
            <div ref={startSelectorRef}>
              <DateSelector 
                label="Start Time"
                id="startTime"
                required
                includeTime={true}
                value={formData.startTime || null}
                onChange={(val) => setFormData({...formData, startTime: val || ''})}
                onOpen={() => {
                  if (isMobile && startSelectorRef.current) {
                    startSelectorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
              />
            </div>
            <div ref={endSelectorRef}>
              <DateSelector 
                label="End Time"
                id="endTime"
                required
                includeTime={true}
                value={formData.endTime || null}
                onChange={(val) => setFormData({...formData, endTime: val || ''})}
                onOpen={() => {
                  if (isMobile && endSelectorRef.current) {
                    endSelectorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
              />
            </div>
          </div>

          {formData.type !== 'BLOCKER' && (
            <ContactSelector 
              organizationId={organizationId}
              selectedContactId={formData.contactId}
              onSelect={(contact) => setFormData({...formData, contactId: contact?.id})}
              label="Link to Contact (Optional)"
            />
          )}

          <Textarea 
            label="Description"
            id="description"
            name="description"
            placeholder="Add notes or location details..."
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            rows={4}
          />

          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '0.75rem', marginTop: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
            <Button variant="outline" onClick={onCancel} style={{ flex: 1 }}>Cancel</Button>
            <Button type="submit" isLoading={isLoading} style={{ flex: isMobile ? 1 : 2 }} leftIcon={<Save size={20} />}>
              {event ? 'Update Event' : 'Schedule Event'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CalendarEventForm;
