import api from './client';

export interface Property {
  id: string;
  title: string;
  description?: string;
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  price?: number;
  status: 'AVAILABLE' | 'UNDER_CONTRACT' | 'SOLD' | 'RENTED' | 'OFF_MARKET';
  type: 'HOUSE' | 'APARTMENT' | 'CONDO' | 'TOWNHOUSE' | 'LAND' | 'COMMERCIAL' | 'INDUSTRIAL';
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  lotSize?: number;
  yearBuilt?: number;
  features: string[];
  images: string[];
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export const propertyService = {
  getAll: (orgId?: string) => 
    api.get<Property[]>('/properties', { params: { organizationId: orgId } }),
  
  getOne: (id: string) => 
    api.get<Property>(`/properties/${id}`),
  
  create: (data: Partial<Property>) => 
    api.post<Property>('/properties', data),
  
  update: (id: string, data: Partial<Property>) => 
    api.patch<Property>(`/properties/${id}`, data),
  
  delete: (id: string) => 
    api.delete(`/properties/${id}`)
};
