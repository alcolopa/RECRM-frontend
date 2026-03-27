import api from './client';
import { type Contact } from './contacts';
import { type Property } from './properties';

export type DealStage = 'DISCOVERY' | 'QUALIFICATION' | 'PRESENTATION' | 'NEGOTIATION' | 'CLOSED_WON' | 'CLOSED_LOST' | 'CLOSED_CANCELLED';

export interface Deal {
  id: string;
  title: string;
  value: number;
  stage: DealStage;
  organizationId: string;
  contactId: string;
  propertyId: string;
  assignedUserId?: string;
  type: string;
  propertyPrice?: number;
  rentPrice?: number;
  contact?: Contact;
  property?: Property;
  createdAt: string;
  updatedAt: string;
}

export const dealService = {
  getPipeline: (organizationId: string) => 
    api.get('/deals/pipeline', { params: { organizationId } }),
  
  findAll: (organizationId: string) => 
    api.get<Deal[]>('/deals', { params: { organizationId } }),
  
  findOne: (id: string, organizationId: string) => 
    api.get<Deal>(`/deals/${id}`, { params: { organizationId } }),
  
  create: (data: Partial<Deal>, organizationId: string) => 
    api.post<Deal>('/deals', data, { params: { organizationId } }),
  
  update: (id: string, data: Partial<Deal>, organizationId: string) => 
    api.patch<Deal>(`/deals/${id}`, data, { params: { organizationId } })
};
