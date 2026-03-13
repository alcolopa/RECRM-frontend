import api from './client';

export enum ContactType {
  BUYER = 'BUYER',
  SELLER = 'SELLER',
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  type: ContactType;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export const contactService = {
  getAll: (orgId: string) => api.get<Contact[]>(`/contacts?organizationId=${orgId}`),
  getById: (id: string) => api.get<Contact>(`/contacts/${id}`),
  create: (data: Partial<Contact>) => api.post<Contact>('/contacts', data),
  update: (id: string, data: Partial<Contact>) => api.patch<Contact>(`/contacts/${id}`, data),
  delete: (id: string) => api.delete(`/contacts/${id}`),
};
