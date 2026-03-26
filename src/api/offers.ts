import api, { type PaginatedResponse } from './client';
import { type Property } from './properties';
import { type Contact } from './contacts';
import { type UserProfile } from './users';

export type OfferStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'COUNTERED' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN' | 'EXPIRED';
export type DealType = 'SALE' | 'RENT';
export const OfferStatus = {
  DRAFT: 'DRAFT' as OfferStatus,
  SUBMITTED: 'SUBMITTED' as OfferStatus,
  UNDER_REVIEW: 'UNDER_REVIEW' as OfferStatus,
  COUNTERED: 'COUNTERED' as OfferStatus,
  ACCEPTED: 'ACCEPTED' as OfferStatus,
  REJECTED: 'REJECTED' as OfferStatus,
  WITHDRAWN: 'WITHDRAWN' as OfferStatus,
  EXPIRED: 'EXPIRED' as OfferStatus,
};

export type NegotiationStatus = 'ACTIVE' | 'ACCEPTED' | 'REJECTED' | 'CLOSED';
export const NegotiationStatus = {
  ACTIVE: 'ACTIVE' as NegotiationStatus,
  ACCEPTED: 'ACCEPTED' as NegotiationStatus,
  REJECTED: 'REJECTED' as NegotiationStatus,
  CLOSED: 'CLOSED' as NegotiationStatus,
};

export type FinancingType = 'CASH' | 'MORTGAGE' | 'PRIVATE_FINANCING' | 'OTHER';
export const FinancingType = {
  CASH: 'CASH' as FinancingType,
  MORTGAGE: 'MORTGAGE' as FinancingType,
  PRIVATE_FINANCING: 'PRIVATE_FINANCING' as FinancingType,
  OTHER: 'OTHER' as FinancingType,
};

export type OffererType = 'AGENCY' | 'BUYER';
export const OffererType = {
  AGENCY: 'AGENCY' as OffererType,
  BUYER: 'BUYER' as OffererType,
};

export interface OfferNegotiation {
  id: string;
  status: NegotiationStatus;
  organizationId: string;
  propertyId: string;
  property: Property;
  contactId: string;
  contact: Contact;
  leadId?: string;
  createdById: string;
  createdBy: UserProfile;
  offers: Offer[];
  createdAt: string;
  updatedAt: string;
}

export interface Offer {
  id: string;
  price: number;
  deposit?: number;
  financingType: FinancingType;
  closingDate?: string;
  expirationDate?: string;
  status: OfferStatus;
  notes?: string;
  offerer: OffererType;
  type: DealType;
  buyerCommission?: number;
  sellerCommission?: number;
  agentCommission?: number;
  negotiationId: string;
  negotiation: OfferNegotiation;
  organizationId: string;
  createdById: string;
  createdBy: UserProfile;
  history: OfferHistory[];
  createdAt: string;
  updatedAt: string;
}

export interface OfferHistory {
  id: string;
  action: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  offerer?: OffererType;
  offerId: string;
  userId: string;
  user: UserProfile;
  createdAt: string;
}

export const offersService = {
  getAll: (orgId: string, page = 1, limit = 20, sortBy?: string, sortOrder?: 'asc' | 'desc') => 
    api.get<PaginatedResponse<Offer>>('/offers', { 
      params: { 
        organizationId: orgId,
        page,
        limit,
        sortBy,
        sortOrder
      } 
    }),
  
  getOne: (id: string, orgId: string) => 
    api.get<Offer>(`/offers/${id}`, { params: { organizationId: orgId } }),
  
  create: (data: any, orgId: string) => 
    api.post<Offer>(`/offers?organizationId=${orgId}`, data),
  
  counter: (id: string, data: any, orgId: string) => 
    api.post<Offer>(`/offers/${id}/counter?organizationId=${orgId}`, data),
  
  accept: (id: string, orgId: string) => 
    api.post<Offer>(`/offers/${id}/accept?organizationId=${orgId}`),
  
  reject: (id: string, orgId: string) => 
    api.post<Offer>(`/offers/${id}/reject?organizationId=${orgId}`),

  update: (id: string, data: any, orgId: string) =>
    api.patch<Offer>(`/offers/${id}?organizationId=${orgId}`, data),
};
