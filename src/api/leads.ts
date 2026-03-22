import api, { type PaginatedResponse } from './client';
import { PropertyType, ContactType } from './contacts';

export type LeadStatus = 
  | 'NEW' 
  | 'CONTACTED' 
  | 'QUALIFIED' 
  | 'PROPOSAL_SENT' 
  | 'NEGOTIATION' 
  | 'LOST' 
  | 'CLOSED_WON';

export const LeadStatus = {
  NEW: 'NEW' as LeadStatus,
  CONTACTED: 'CONTACTED' as LeadStatus,
  QUALIFIED: 'QUALIFIED' as LeadStatus,
  PROPOSAL_SENT: 'PROPOSAL_SENT' as LeadStatus,
  NEGOTIATION: 'NEGOTIATION' as LeadStatus,
  LOST: 'LOST' as LeadStatus,
  CLOSED_WON: 'CLOSED_WON' as LeadStatus,
} as const;

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  status: LeadStatus;
  source?: string;
  notes?: string;
  budget?: number;
  preferredLocation?: string;
  propertyType?: PropertyType;
  organizationId: string;
  assignedUserId?: string;
  convertedAt?: string;
  convertedContactId?: string;
  createdAt: string;
  updatedAt: string;
  assignedUser?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  convertedContact?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface ConvertLeadData {
  type: ContactType;
  notes?: string;
}

export const leadService = {
  getAll: (orgId: string, page = 1, limit = 20, status?: LeadStatus, sortBy?: string, sortOrder?: 'asc' | 'desc') => 
    api.get<PaginatedResponse<Lead>>(`/leads`, {
      params: {
        organizationId: orgId,
        page,
        limit,
        status,
        sortBy,
        sortOrder
      }
    }),
  getById: (id: string, orgId: string) => 
    api.get<Lead>(`/leads/${id}?organizationId=${orgId}`),
  create: (data: Partial<Lead> & { organizationId: string }) => 
    api.post<Lead>(`/leads`, data),
  update: (id: string, data: Partial<Lead>, orgId: string) => 
    api.patch<Lead>(`/leads/${id}?organizationId=${orgId}`, data),
  delete: (id: string, orgId: string) => 
    api.delete(`/leads/${id}?organizationId=${orgId}`),
  convert: (id: string, data: ConvertLeadData, orgId: string) => 
    api.post<any>(`/leads/${id}/convert?organizationId=${orgId}`, data),
};
