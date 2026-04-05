import api from './client';

export interface Plan {
  id: string;
  name: string;
  priceMonthly: number;
  priceYearly?: number;
  maxSeats: number;
  features: string[];
}

export interface Subscription {
  id: string;
  organizationId: string;
  planId: string;
  status: 'TRIAL' | 'ACTIVE' | 'INACTIVE' | 'CANCELED';
  seats: number;
  usedSeats: number;
  trialStartDate: string;
  trialEndDate: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  plan?: Plan;
}

export const subscriptionApi = {
  getSubscription: async (organizationId: string): Promise<Subscription> => {
    const { data } = await api.get('/subscription', {
      params: { organizationId }
    });
    return data;
  },

  getPlans: async (): Promise<Plan[]> => {
    const { data } = await api.get('/subscription/plans');
    return data;
  },

  subscribe: async (planId: string, seats: number, organizationId: string): Promise<Subscription> => {
    const { data } = await api.post('/subscription/subscribe', {
      planId,
      seats,
      organizationId
    });
    return data;
  },

  updateSubscription: async (data: { planId?: string; seats?: number; organizationId: string }): Promise<Subscription> => {
    const { data: responseData } = await api.patch('/subscription', data);
    return responseData;
  }
};
