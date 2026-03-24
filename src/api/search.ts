import api from './client';

export interface SearchResult {
  id: string;
  type: 'LEAD' | 'CONTACT' | 'PROPERTY' | 'TASK' | 'DEAL';
  title: string;
  subtitle?: string;
  link: string;
}

export const searchService = {
  search: (query: string, orgId: string) =>
    api.get<SearchResult[]>('/search', { params: { q: query, organizationId: orgId } }),
};
