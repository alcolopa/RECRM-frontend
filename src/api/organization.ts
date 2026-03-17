import api from './client';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  accentColor?: string;
  ownerId?: string;
  owner?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export const organizationService = {
  get: () => api.get<Organization>('/organization'),
  update: (data: Partial<Organization>) => 
    api.patch<Organization>('/organization', data),
  uploadLogo: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<{ logo: string }>('/organization/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
