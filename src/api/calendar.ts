import api from './client';
import { type UserProfile } from './users';

export type CalendarEventType = 'MEETING' | 'CALL' | 'SITE_VISIT' | 'BLOCKER' | 'OTHER';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  type: CalendarEventType;
  organizationId: string;
  userId: string;
  contactId?: string;
  leadId?: string;
  createdAt: string;
  updatedAt: string;
  user?: Partial<UserProfile>;
  contact?: { id: string; firstName: string; lastName: string; email: string };
  lead?: { id: string; firstName: string; lastName: string; email: string };
}

export const calendarService = {
  getAll: (orgId: string, startDate?: string, endDate?: string) => 
    api.get<CalendarEvent[]>('/calendar', { 
      params: { 
        organizationId: orgId,
        startDate,
        endDate
      } 
    }),
    
  getOne: (id: string, orgId: string) => 
    api.get<CalendarEvent>(`/calendar/${id}`, { params: { organizationId: orgId } }),
    
  create: (data: Partial<CalendarEvent>, orgId: string) => 
    api.post<CalendarEvent>(`/calendar?organizationId=${orgId}`, data),
    
  update: (id: string, data: Partial<CalendarEvent>, orgId: string) => 
    api.patch<CalendarEvent>(`/calendar/${id}?organizationId=${orgId}`, data),
    
  delete: (id: string, orgId: string) => 
    api.delete(`/calendar/${id}?organizationId=${orgId}`),
};
