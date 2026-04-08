import api, { type PaginatedResponse } from './client';
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

// --- Enum-like types ---
export type PropertyListingType = 'SALE' | 'RENT' | 'LEASE' | 'SALE_AND_RENT';
export type PropertyCondition = 'NEW' | 'GOOD' | 'NEEDS_RENOVATION' | 'UNDER_CONSTRUCTION';
export type OwnershipType = 'FREEHOLD' | 'LEASEHOLD';
export type ZoningType = 'RESIDENTIAL' | 'COMMERCIAL' | 'MIXED';
export type RentalPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
export type PaymentFrequency = 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
export type MaintenanceResponsibility = 'OWNER' | 'TENANT' | 'SHARED';
export type PropertySource = 'MANUAL' | 'WEBSITE' | 'WHATSAPP' | 'REFERRAL';
export type PropertyPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type PropertyType = 'APARTMENT' | 'HOUSE' | 'VILLA' | 'OFFICE' | 'SHOP' | 'LAND' | 'WAREHOUSE' | 'BUILDING';
export type PropertyStatus = 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'RENTED' | 'OFF_MARKET';

export interface Property {
  id: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;

  // --- 1. Core Info ---
  title: string;
  description?: string;
  type: PropertyType;
  listingType?: PropertyListingType;
  status: PropertyStatus;
  referenceCode?: string;
  createdById?: string;

  // --- 2. Location ---
  address: string;
  country?: string;
  city?: string;
  state?: string;
  governorate?: string;
  district?: string;
  street?: string;
  buildingName?: string;
  floor?: string;
  unitNumber?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;

  // --- 3. Property Specifications ---
  sizeSqm?: number;
  landSizeSqm?: number;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  lotSize?: number;
  livingRooms?: number;
  kitchens?: number;
  parkingSpaces?: number;
  floorNumber?: number;
  totalFloors?: number;
  yearBuilt?: number;
  condition?: PropertyCondition;
  furnished?: boolean;

  // --- 4. Pricing & Financials ---
  price?: number;
  currency?: string;
  negotiable?: boolean;

  // Sale pricing
  pricePerSqm?: number;
  commissionBuyerPercent?: number;
  commissionSellerPercent?: number;
  paymentTerms?: Record<string, any>;

  // Rent pricing
  rentalPeriod?: RentalPeriod;
  rentAmount?: number;
  paymentFrequency?: PaymentFrequency;
  advancePaymentMonths?: number;
  securityDeposit?: number;
  minLeaseDurationMonths?: number;
  maxLeaseDurationMonths?: number;
  utilitiesIncluded?: boolean;
  availableFrom?: string;
  renewalTerms?: string;

  // Lease pricing
  leaseTermYears?: number;
  rentEscalation?: string;
  fitOutPeriod?: string;
  serviceCharges?: number;
  insuranceRequired?: boolean;
  maintenanceResponsibility?: MaintenanceResponsibility;

  // --- 5. Legal & Ownership ---
  ownerName?: string;
  ownerContactId?: string;
  ownershipType?: OwnershipType;
  titleDeedAvailable?: boolean;
  zoningType?: ZoningType;
  legalNotes?: string;

  // --- 6. Features ---
  features: string[];
  featureIds?: string[];

  // --- 7. CRM Fields ---
  assignedUserId?: string;
  sellerProfileId?: string;
  source?: PropertySource;
  listingDate?: string;
  expiryDate?: string;
  priority?: PropertyPriority;
  propertyTags?: string[];

  // --- 8. Activity Tracking ---
  viewsCount?: number;
  inquiriesCount?: number;
  lastViewedAt?: string;

  // --- Relations ---
  propertyImages: PropertyImage[];
  organization?: {
    id: string;
    name: string;
    logo?: string;
    accentColor?: string;
    defaultTheme?: 'LIGHT' | 'DARK';
  };
  assignedUser?: UserProfile;
  createdBy?: UserProfile;
  ownerContact?: Contact;
  sellerProfile?: SellerProfile & { contact: Contact };
}

export interface PropertyFilters {
  assignedUserId?: string;
  status?: string;
  listingType?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const propertyService = {
  getAll: (orgId: string, page = 1, limit = 20, filters?: PropertyFilters) => 
    api.get<PaginatedResponse<Property>>('/properties', { 
      params: { 
        organizationId: orgId,
        page,
        limit,
        ...filters
      } 
    }),
  
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
