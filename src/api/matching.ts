import api from './client';
import { type Property } from './properties';
import { type Contact } from './contacts';
import { type Lead } from './leads';

export interface MatchedPropertyResult {
  propertyId: string;
  property: Property;
  score: number;
  matchReasons: string[];
}

export interface MatchedClientResult {
  clientId: string;
  isLead: boolean;
  contact?: Contact;
  lead?: Lead;
  score: number;
  matchReasons: string[];
}

export const getMatchedPropertiesForClient = async (
  organizationId: string,
  type: 'contact' | 'lead',
  id: string
): Promise<MatchedPropertyResult[]> => {
  const response = await api.get(`/matching/clients/${type}/${id}/properties`, {
    params: { organizationId },
  });
  return response.data;
};

export const getMatchedClientsForProperty = async (
  organizationId: string,
  propertyId: string
): Promise<MatchedClientResult[]> => {
  const response = await api.get(`/matching/properties/${propertyId}/clients`, {
    params: { organizationId },
  });
  return response.data;
};
