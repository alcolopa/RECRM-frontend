import api from './client';

export enum ContactType {
  BUYER = 'BUYER',
  SELLER = 'SELLER',
}

export enum ContactStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  QUALIFIED = 'QUALIFIED',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  LOST = 'LOST',
}

export enum FinancingType {
  CASH = 'CASH',
  MORTGAGE = 'MORTGAGE',
}

export enum BuyingTimeline {
  ASAP = 'ASAP',
  ONE_TO_THREE_MONTHS = 'ONE_TO_THREE_MONTHS',
  THREE_TO_SIX_MONTHS = 'THREE_TO_SIX_MONTHS',
  SIX_PLUS_MONTHS = 'SIX_PLUS_MONTHS',
  JUST_LOOKING = 'JUST_LOOKING',
}

export enum PurchasePurpose {
  PRIMARY_RESIDENCE = 'PRIMARY_RESIDENCE',
  INVESTMENT = 'INVESTMENT',
  VACATION_HOME = 'VACATION_HOME',
  RELOCATION = 'RELOCATION',
}

export enum ListingType {
  EXCLUSIVE = 'EXCLUSIVE',
  NON_EXCLUSIVE = 'NON_EXCLUSIVE',
}

export enum SellingTimeline {
  ASAP = 'ASAP',
  ONE_TO_THREE_MONTHS = 'ONE_TO_THREE_MONTHS',
  THREE_TO_SIX_MONTHS = 'THREE_TO_SIX_MONTHS',
  SIX_PLUS_MONTHS = 'SIX_PLUS_MONTHS',
  JUST_EXPLORING = 'JUST_EXPLORING',
}

export enum ReasonForSelling {
  UPGRADE = 'UPGRADE',
  RELOCATION = 'RELOCATION',
  INVESTMENT_EXIT = 'INVESTMENT_EXIT',
  FINANCIAL_NEED = 'FINANCIAL_NEED',
  DIVORCE = 'DIVORCE',
  INHERITANCE = 'INHERITANCE',
  OTHER = 'OTHER',
}

export enum PropertyType {
  APARTMENT = 'APARTMENT',
  HOUSE = 'HOUSE',
  VILLA = 'VILLA',
  LAND = 'LAND',
  COMMERCIAL = 'COMMERCIAL',
  OFFICE = 'OFFICE',
  RETAIL = 'RETAIL',
}

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
  getAll: (orgId: string) => api.get<Contact[]>(`/contacts?organizationId=${orgId}`),
  getById: (id: string) => api.get<Contact>(`/contacts/${id}`),
  create: (data: Partial<Contact>) => api.post<Contact>('/contacts', data),
  update: (id: string, data: Partial<Contact>) => api.patch<Contact>(`/contacts/${id}`, data),
  delete: (id: string) => api.delete(`/contacts/${id}`),
};
