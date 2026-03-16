import api from './client';

// Replace enums with union types + const objects for erasableSyntaxOnly compatibility
export type ContactType = 'BUYER' | 'SELLER';
export const ContactType = {
  BUYER: 'BUYER' as ContactType,
  SELLER: 'SELLER' as ContactType,
} as const;

export type ContactStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'ACTIVE' | 'INACTIVE' | 'LOST';
export const ContactStatus = {
  NEW: 'NEW' as ContactStatus,
  CONTACTED: 'CONTACTED' as ContactStatus,
  QUALIFIED: 'QUALIFIED' as ContactStatus,
  ACTIVE: 'ACTIVE' as ContactStatus,
  INACTIVE: 'INACTIVE' as ContactStatus,
  LOST: 'LOST' as ContactStatus,
} as const;

export type FinancingType = 'CASH' | 'MORTGAGE';
export const FinancingType = {
  CASH: 'CASH' as FinancingType,
  MORTGAGE: 'MORTGAGE' as FinancingType,
} as const;

export type BuyingTimeline = 
  | 'ASAP' 
  | 'ONE_TO_THREE_MONTHS' 
  | 'THREE_TO_SIX_MONTHS' 
  | 'SIX_PLUS_MONTHS' 
  | 'JUST_LOOKING';
export const BuyingTimeline = {
  ASAP: 'ASAP' as BuyingTimeline,
  ONE_TO_THREE_MONTHS: 'ONE_TO_THREE_MONTHS' as BuyingTimeline,
  THREE_TO_SIX_MONTHS: 'THREE_TO_SIX_MONTHS' as BuyingTimeline,
  SIX_PLUS_MONTHS: 'SIX_PLUS_MONTHS' as BuyingTimeline,
  JUST_LOOKING: 'JUST_LOOKING' as BuyingTimeline,
} as const;

export type PurchasePurpose = 
  | 'PRIMARY_RESIDENCE' 
  | 'INVESTMENT' 
  | 'VACATION_HOME' 
  | 'RELOCATION';
export const PurchasePurpose = {
  PRIMARY_RESIDENCE: 'PRIMARY_RESIDENCE' as PurchasePurpose,
  INVESTMENT: 'INVESTMENT' as PurchasePurpose,
  VACATION_HOME: 'VACATION_HOME' as PurchasePurpose,
  RELOCATION: 'RELOCATION' as PurchasePurpose,
} as const;

export type ListingType = 'EXCLUSIVE' | 'NON_EXCLUSIVE';
export const ListingType = {
  EXCLUSIVE: 'EXCLUSIVE' as ListingType,
  NON_EXCLUSIVE: 'NON_EXCLUSIVE' as ListingType,
} as const;

export type SellingTimeline = 
  | 'ASAP' 
  | 'ONE_TO_THREE_MONTHS' 
  | 'THREE_TO_SIX_MONTHS' 
  | 'SIX_PLUS_MONTHS' 
  | 'JUST_EXPLORING';
export const SellingTimeline = {
  ASAP: 'ASAP' as SellingTimeline,
  ONE_TO_THREE_MONTHS: 'ONE_TO_THREE_MONTHS' as SellingTimeline,
  THREE_TO_SIX_MONTHS: 'THREE_TO_SIX_MONTHS' as SellingTimeline,
  SIX_PLUS_MONTHS: 'SIX_PLUS_MONTHS' as SellingTimeline,
  JUST_EXPLORING: 'JUST_EXPLORING' as SellingTimeline,
} as const;

export type ReasonForSelling = 
  | 'UPGRADE' 
  | 'RELOCATION' 
  | 'INVESTMENT_EXIT' 
  | 'FINANCIAL_NEED' 
  | 'DIVORCE' 
  | 'INHERITANCE' 
  | 'OTHER';
export const ReasonForSelling = {
  UPGRADE: 'UPGRADE' as ReasonForSelling,
  RELOCATION: 'RELOCATION' as ReasonForSelling,
  INVESTMENT_EXIT: 'INVESTMENT_EXIT' as ReasonForSelling,
  FINANCIAL_NEED: 'FINANCIAL_NEED' as ReasonForSelling,
  DIVORCE: 'DIVORCE' as ReasonForSelling,
  INHERITANCE: 'INHERITANCE' as ReasonForSelling,
  OTHER: 'OTHER' as ReasonForSelling,
} as const;

export type PropertyType = 
  | 'APARTMENT' 
  | 'HOUSE' 
  | 'VILLA' 
  | 'LAND' 
  | 'COMMERCIAL' 
  | 'OFFICE' 
  | 'RETAIL';
export const PropertyType = {
  APARTMENT: 'APARTMENT' as PropertyType,
  HOUSE: 'HOUSE' as PropertyType,
  VILLA: 'VILLA' as PropertyType,
  LAND: 'LAND' as PropertyType,
  COMMERCIAL: 'COMMERCIAL' as PropertyType,
  OFFICE: 'OFFICE' as PropertyType,
  RETAIL: 'RETAIL' as PropertyType,
} as const;

export interface BuyerProfile {
  id: string;
  contactId: string;
  minBudget?: number;
  maxBudget?: number;
  financingType?: FinancingType;
  preApproved?: boolean;
  preApprovedAmount?: number;
  downPayment?: number;
  propertyTypes: PropertyType[];
  minBedrooms?: number;
  minBathrooms?: number;
  minArea?: number;
  maxArea?: number;
  preferredCities: string[];
  preferredNeighborhoods: string[];
  parkingRequired: boolean;
  gardenRequired: boolean;
  furnished: boolean;
  newConstruction: boolean;
  buyingTimeline?: BuyingTimeline;
  purchasePurpose?: PurchasePurpose;
}

export interface SellerProfile {
  id: string;
  contactId: string;
  propertyId?: string;
  minimumPrice?: number;
  mortgageBalance?: number;

  listingType?: ListingType;
  readyToList: boolean;
  occupied: boolean;
  tenantLeaseEndDate?: string;
  sellingTimeline?: SellingTimeline;
  reasonForSelling?: ReasonForSelling;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  secondaryPhone?: string;
  type: ContactType;
  leadSource?: string;
  assignedAgentId?: string;
  status: ContactStatus;
  notes?: string;
  tags: string[];
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  lastContactedAt?: string;
  buyerProfile?: BuyerProfile;
  sellerProfile?: SellerProfile;
  assignedAgent?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export const contactService = {
  getAll: (orgId: string, type?: ContactType) => 
    api.get<Contact[]>(`/contacts?organizationId=${orgId}${type ? `&type=${type}` : ''}`),
  getById: (id: string, orgId: string) => api.get<Contact>(`/contacts/${id}?organizationId=${orgId}`),
  create: (data: Partial<Contact> & { organizationId: string }) => api.post<Contact>(`/contacts?organizationId=${data.organizationId}`, data),
  update: (id: string, data: Partial<Contact>, orgId: string) => api.patch<Contact>(`/contacts/${id}?organizationId=${orgId}`, data),
  delete: (id: string, orgId: string) => api.delete(`/contacts/${id}?organizationId=${orgId}`),
};
