import React, { useState, useEffect, useRef } from 'react';
import {
  CheckSquare, 
  ChevronLeft, 
  Save, 
  AlertCircle,
  X
  } from 'lucide-react';import { motion, AnimatePresence } from 'framer-motion';
import { type Task, type TaskPriority, type TaskStatus } from '../api/tasks';
import Button from './Button';
import { Input, Select, Textarea } from './Input';
import UserSelector from './UserSelector';
import DateSelector from './DateSelector';
import { usePermissions } from '../utils/permissions';
import { Permission, type UserProfile } from '../api/users';
import { mapBackendErrors, getErrorMessage } from '../utils/errors';

interface TaskFormProps {
  task?: Task | null;
  onSave: (data: Partial<Task>) => Promise<void>;
  onCancel: () => void;
  organizationId: string;
  user: UserProfile;
}

const TaskForm: React.FC<TaskFormProps> = ({
  task,
  onSave,
  onCancel,
  organizationId,
  user
}) => {
  const permissions = usePermissions(user);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const dateSelectorRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<Partial<Task>>({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'TODO',
    priority: task?.priority || 'MEDIUM',
    dueDate: task?.dueDate ? new Date(task.dueDate).toISOString() : '',
    assignedUserId: task?.assignedUserId || user.id
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title?.trim()) {
      newErrors.title = 'Task title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters long';
    }

    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      await onSave(formData);
    } catch (err: any) {
      console.error('Failed to save task', err);
      const backendErrors = mapBackendErrors(err);
      if (Object.keys(backendErrors).length > 0) {
        setFieldErrors(backendErrors);
      } else {
        setError(getErrorMessage(err, 'Failed to save task. Please try again.'));
      }
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
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            {task ? 'Edit Task' : 'New Task'}
          </h1>
          <p style={{ color: 'var(--color-text-muted)' }}>
            {task ? 'Update task details and assignment.' : 'Create a new assignment or personal reminder.'}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={18} />
              {error}
            </div>
            <button
              onClick={() => setError(null)}
              style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: '0.25rem' }}
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="card" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '2rem', padding: isMobile ? '1.5rem' : '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Input
            label="Task Title"
            id="title"
            name="title"
            required
            placeholder="e.g. Follow up with client regarding offer"
            value={formData.title}
            onChange={(e) => {
              setFormData({ ...formData, title: e.target.value });
              if (fieldErrors.title) setFieldErrors(prev => ({ ...prev, title: '' }));
            }}
            icon={CheckSquare}
            error={fieldErrors.title}
          />

          <Textarea
            label="Description"
            id="description"
            name="description"
            placeholder="Add any additional details or context..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            error={fieldErrors.description}
          />

          <div className="grid grid-2">
            <Select
              label="Priority"
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
              options={[
                { value: 'LOW', label: 'Low' },
                { value: 'MEDIUM', label: 'Medium' },
                { value: 'HIGH', label: 'High' },
                { value: 'URGENT', label: 'Urgent' }
              ]}
              error={fieldErrors.priority}
            />
            <div ref={dateSelectorRef}>
              <DateSelector
                label="Due Date"
                id="dueDate"
                includeTime={true}
                value={formData.dueDate || null}
                onChange={(val) => setFormData({ ...formData, dueDate: val || '' })}
                onOpen={() => {
                  if (isMobile && dateSelectorRef.current) {
                    dateSelectorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                error={fieldErrors.dueDate}
              />
            </div>
          </div>

          <div className="grid grid-2">
            <Select
              label="Status"
              id="status"
              name="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
              options={[
                { value: 'TODO', label: 'To Do' },
                { value: 'IN_PROGRESS', label: 'In Progress' },
                { value: 'COMPLETED', label: 'Completed' },
                { value: 'CANCELLED', label: 'Cancelled' }
              ]}
              error={fieldErrors.status}
            />
            {(permissions.can(Permission.TASKS_ASSIGN_ANY) || user.role === 'OWNER' || user.role === 'ADMIN') && (
              <UserSelector
                label="Assign To"
                organizationId={organizationId}
                selectedUserId={formData.assignedUserId}
                onSelect={(id) => setFormData({ ...formData, assignedUserId: id })}
                error={fieldErrors.assignedUserId}
              />
            )}
          </div>

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
              {task ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
