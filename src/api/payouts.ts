import api from './client';

export interface PayoutSummary {
  totalSales: number;
  totalCommissions: number;
  agentPayouts: number;
  totalProfit: number;
}

export interface PayoutDeal {
  id: string;
  title: string;
  value: number;
  agentCommission: number;
  isPaid: boolean;
  paidAt: string | null;
  createdAt: string;
}

export interface AgentPayoutStats {
  id: string;
  name: string;
  email: string;
  totalSales: number;
  pendingPayout: number;
  paidPayout: number;
  deals: PayoutDeal[];
}

export interface AdminPayoutStats {
  summary: PayoutSummary;
  agents: AgentPayoutStats[];
}

export interface PersonalPayoutStats {
  totalSales: number;
  targetSales: number;
  totalEarned: number;
  pendingPayout: number;
  totalPaid: number;
  deals: PayoutDeal[];
}

export const payoutsService = {
  getAdminStats: (orgId: string, startDate?: string, endDate?: string) =>
    api.get<AdminPayoutStats>('/payouts/admin-stats', {
      params: { organizationId: orgId, startDate, endDate }
    }),

  getAgentStats: (orgId: string, startDate?: string, endDate?: string) =>
    api.get<PersonalPayoutStats>('/payouts/agent-stats', {
      params: { organizationId: orgId, startDate, endDate }
    }),

  markPaid: (dealId: string, orgId: string) =>
    api.post(`/payouts/mark-paid/${dealId}`, {}, {
      params: { organizationId: orgId }
    }),

  markAllPaid: (agentId: string, orgId: string) =>
    api.post(`/payouts/mark-all-paid/${agentId}`, {}, {
      params: { organizationId: orgId }
    }),

  markSelectedPaid: (dealIds: string[], orgId: string) =>
    api.post('/payouts/mark-selected-paid', { dealIds }, {
      params: { organizationId: orgId }
    }),
};
