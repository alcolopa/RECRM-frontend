import api from './client';
import { type SellerProfile, type Contact } from './contacts';
import { type UserProfile } from './users';

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
  propertyImages: PropertyImage[];
  organizationId: string;
  organization?: {
    id: string;
    name: string;
    logo?: string;
    accentColor?: string;
    defaultTheme?: 'LIGHT' | 'DARK';
  };
  assignedUserId?: string;
  assignedUser?: UserProfile;
  sellerProfileId?: string;
  sellerProfile?: SellerProfile & { contact: Contact };
  createdAt: string;
  updatedAt: string;
}

export const propertyService = {
  getAll: (orgId: string) => 
    api.get<Property[]>('/properties', { params: { organizationId: orgId } }),
  
  getOne: (id: string, orgId: string) => 
    api.get<Property>(`/properties/${id}`, { params: { organizationId: orgId } }),
  
  create: (data: Partial<Property> & { organizationId: string }) => 
    api.post<Property>(`/properties?organizationId=${data.organizationId}`, data),
  
  update: (id: string, data: Partial<Property>, orgId: string) => 
    api.patch<Property>(`/properties/${id}`, data, { params: { organizationId: orgId } }),
  
  delete: (id: string, orgId: string) => 
    api.delete(`/properties/${id}`, { params: { organizationId: orgId } }),

  getFeatures: () =>
    api.get<Feature[]>('/properties/features'),

  getPublic: (id: string) =>
    api.get<Property>(`/properties/public/${id}`),

  uploadImage: (propertyId: string, file: File, orgId: string, onProgress?: (progress: number) => void) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<PropertyImage>(`/properties/${propertyId}/images?organizationId=${orgId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
  },

  deleteImage: (imageId: string, orgId: string) => 
    api.delete(`/properties/images/${imageId}?organizationId=${orgId}`)
};
