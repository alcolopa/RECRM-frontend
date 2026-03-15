import api from './client';
import { type SellerProfile, type Contact } from './contacts';

export interface PropertyImage {
  id: string;
  url: string;
  propertyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Feature {
  id: string;
  name: string;
  category?: string;
}

export interface PropertyFeature {
  id: string;
  propertyId: string;
  featureId: string;
  feature: Feature;
}

export interface Property {
  id: string;
  title: string;
  description?: string;
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  governorate?: string;
  price?: number;
  status: 'AVAILABLE' | 'UNDER_CONTRACT' | 'SOLD' | 'RENTED' | 'OFF_MARKET';
  type: 'APARTMENT' | 'HOUSE' | 'VILLA' | 'CONDO' | 'TOWNHOUSE' | 'LAND' | 'COMMERCIAL' | 'OFFICE' | 'RETAIL' | 'INDUSTRIAL';
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  lotSize?: number;
  yearBuilt?: number;
  features: string[];
  featureIds?: string[];
  propertyFeatures?: PropertyFeature[];
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

  getFeatures: () =>
    api.get<Feature[]>('/properties/features'),

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
