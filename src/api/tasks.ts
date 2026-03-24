import api from './client';
import { type UserProfile } from './users';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  organizationId: string;
  assignedUserId?: string;
  createdById?: string;
  createdAt: string;
  updatedAt: string;
  assignedUser?: Partial<UserProfile>;
  createdBy?: Partial<UserProfile>;
}

export const taskService = {
  getAll: (orgId: string) => 
    api.get<Task[]>('/tasks', { params: { organizationId: orgId } }),
    
  getOne: (id: string, orgId: string) => 
    api.get<Task>(`/tasks/${id}`, { params: { organizationId: orgId } }),
    
  create: (data: Partial<Task>, orgId: string) => 
    api.post<Task>(`/tasks?organizationId=${orgId}`, data),
    
  update: (id: string, data: Partial<Task>, orgId: string) => 
    api.patch<Task>(`/tasks/${id}?organizationId=${orgId}`, data),
    
  delete: (id: string, orgId: string) => 
    api.delete(`/tasks/${id}?organizationId=${orgId}`),
};
