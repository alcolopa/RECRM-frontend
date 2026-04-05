import { useState, useEffect, useCallback } from 'react';
import { subscriptionApi, type Subscription } from '../api/subscription';

export const useSubscription = (organizationId: string | null) => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    try {
      const data = await subscriptionApi.getSubscription(organizationId);
      setSubscription(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch subscription');
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const updateSeats = async (seats: number) => {
    if (!organizationId) return;
    try {
      const updated = await subscriptionApi.updateSubscription({ seats, organizationId });
      setSubscription(updated);
      return updated;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to update seats');
    }
  };

  const changePlan = async (planId: string, seats?: number) => {
    if (!organizationId) return;
    try {
      const updated = await subscriptionApi.updateSubscription({ planId, seats, organizationId });
      setSubscription(updated);
      return updated;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to change plan');
    }
  };

  return { subscription, loading, error, fetchSubscription, updateSeats, changePlan };
};
