import api from './client';
import { type SellerProfile, type Contact } from './contacts';

export interface PropertyImage {
  id: string;
  url: string;
  propertyId: string;
  createdAt: string;
  updatedAt: string;
}

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
  propertyImages: PropertyImage[];
  organizationId: string;
  sellerProfileId?: string;
  sellerProfile?: SellerProfile & { contact: Contact };
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
    api.delete(`/properties/${id}`),

  uploadImage: (propertyId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<PropertyImage>(`/properties/${propertyId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  deleteImage: (imageId: string) => 
    api.delete(`/properties/images/${imageId}`)
};
