import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Loader2,
  CheckSquare,
  Clock,
  User,
  Trash2,
  Edit2,
  CheckCircle2,
  Circle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { taskService, type Task, type TaskStatus, type TaskPriority } from '../api/tasks';
import { type UserProfile } from '../api/users';
import Button from '../components/Button';
import { Input, Select } from '../components/Input';
import ConfirmModal from '../components/ConfirmModal';
import TaskForm from '../components/TaskForm';
import Tabs from '../components/Tabs';
import { usePermissions } from '../utils/permissions';
import { Permission } from '../api/users';

interface TasksViewProps {
  organizationId: string;
  user: UserProfile;
}

const TasksView: React.FC<TasksViewProps> = ({ organizationId, user }) => {
  const permissions = usePermissions(user);
  const [view, setView] = useState<'list' | 'form'>('list');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [viewFilter, setViewFilter] = useState<'my' | 'all'>(
    permissions.can(Permission.TASKS_VIEW_ALL) ? 'all' : 'my'
  );

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const response = await taskService.getAll(organizationId);
      const data = response.data;
      if (Array.isArray(data)) {
        setTasks(data);
      } else if (data && typeof data === 'object' && Array.isArray((data as any).items)) {
        setTasks((data as any).items);
      } else {
        setTasks([]);
      }
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [organizationId]);

  const handleSave = async (data: Partial<Task>) => {
    try {
      if (editingTask) {
        await taskService.update(editingTask.id, data, organizationId);
      } else {
        await taskService.create(data, organizationId);
      }
      setView('list');
      setEditingTask(null);
      fetchTasks();
    } catch (err) {
      throw err;
    }
  };

  const handleDelete = async () => {
    if (!deletingTaskId) return;
    setIsDeleting(true);
    try {
      await taskService.delete(deletingTaskId, organizationId);
      setTasks(tasks.filter(t => t.id !== deletingTaskId));
      setDeletingTaskId(null);
    } catch (err) {
      console.error('Failed to delete task', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (task: Task) => {
    const newStatus: TaskStatus = task.status === 'COMPLETED' ? 'TODO' : 'COMPLETED';
    try {
      // Optimistic update
      setTasks(tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
      await taskService.update(task.id, { status: newStatus }, organizationId);
    } catch (err) {
      console.error('Failed to toggle task status', err);
      fetchTasks(); // Revert on error
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesView = viewFilter === 'all' || task.assignedUserId === user.id;

    return matchesSearch && matchesStatus && matchesView;
  });

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'URGENT': return '#ef4444';
      case 'HIGH': return '#f97316';
      case 'MEDIUM': return '#3b82f6';
      case 'LOW': return '#10b981';
      default: return 'var(--color-text-muted)';
    }
  };

  if (view === 'form') {
    return (
      <TaskForm
        task={editingTask}
        organizationId={organizationId}
        user={user}
        onSave={handleSave}
        onCancel={() => {
          setView('list');
          setEditingTask(null);
        }}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.25rem' }}>Tasks</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Manage your to-do list and team assignments.</p>
        </div>
        <Button onClick={() => { setEditingTask(null); setView('form'); }} leftIcon={<Plus size={20} />}>New Task</Button>
      </header>

      {/* Filters */}
      <div className="card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '250px' }}>
          <Input id="search" name="search" placeholder="Search tasks..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} icon={Search} />
        </div>
        <div style={{ width: '180px' }}>
          <Select id="status-filter" name="status-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} options={[{ value: 'all', label: 'All Statuses' }, { value: 'TODO', label: 'To Do' }, { value: 'IN_PROGRESS', label: 'In Progress' }, { value: 'COMPLETED', label: 'Completed' }, { value: 'CANCELLED', label: 'Cancelled' }]} />
        </div>
        {permissions.can(Permission.TASKS_VIEW_ALL) && (
          <Tabs activeTab={viewFilter} onTabChange={(id) => setViewFilter(id as 'my' | 'all')} options={[{ id: 'my', label: 'My Tasks' }, { id: 'all', label: 'Team Tasks' }]} />
        )}
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <Loader2 className="animate-spin" size={40} color="var(--color-primary)" />
        </div>
      ) : filteredTasks.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <AnimatePresence>
            {filteredTasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="card"
                style={{
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  borderLeft: `4px solid ${getPriorityColor(task.priority)}`,
                  opacity: task.status === 'COMPLETED' ? 0.7 : 1
                }}
              >
                <button
                  onClick={() => handleToggleStatus(task)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: task.status === 'COMPLETED' ? 'var(--color-primary)' : 'var(--color-text-muted)', padding: 0 }}
                >
                  {task.status === 'COMPLETED' ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                </button>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                    <h3 style={{
                      fontSize: '1rem',
                      fontWeight: 600,
                      textDecoration: task.status === 'COMPLETED' ? 'line-through' : 'none',
                      color: task.status === 'COMPLETED' ? 'var(--color-text-muted)' : 'var(--color-text)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {task.title}
                    </h3>
                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      padding: '0.125rem 0.5rem',
                      borderRadius: '1rem',
                      backgroundColor: `${getPriorityColor(task.priority)}15`,
                      color: getPriorityColor(task.priority),
                      textTransform: 'uppercase'
                    }}>
                      {task.priority}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    {task.dueDate && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        <Clock size={14} /> {new Date(task.dueDate).toLocaleDateString()} {new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                    {task.assignedUser && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        <User size={14} /> {task.assignedUser.firstName} {task.assignedUser.lastName}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="table-action-btn" onClick={() => { setEditingTask(task); setView('form'); }}><Edit2 size={18} /></button>
                  <button className="table-action-btn" style={{ color: 'var(--color-error)' }} onClick={() => setDeletingTaskId(task.id)}><Trash2 size={18} /></button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="card" style={{ padding: '5rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '4rem', height: '4rem', borderRadius: '50%', backgroundColor: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
            <CheckSquare size={32} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>No tasks found</h3>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: '400px' }}>
            {searchQuery || statusFilter !== 'all'
              ? 'No tasks match your current search or filters.'
              : 'Keep track of your work and team assignments here.'}
          </p>
          {!searchQuery && statusFilter === 'all' && <Button onClick={() => setView('form')}>Add Your First Task</Button>}
        </div>
      )}

      <ConfirmModal
        isOpen={!!deletingTaskId}
        onClose={() => setDeletingTaskId(null)}
        onConfirm={handleDelete}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default TasksView;
