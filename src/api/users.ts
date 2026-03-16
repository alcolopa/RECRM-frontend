import api from './client';

export interface Membership {
  id: string;
  role: string;
  organizationId: string;
  organization: {
    id: string;
    name: string;
    slug: string;
    logo?: string;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  phone?: string;
  unitPreference: 'METRIC' | 'IMPERIAL';
  memberships: Membership[];
  ownedOrganizations: any[];
  // Legacy fields for easier transition
  role?: string;
  organizationId?: string;
}

export const userService = {
  getMe: () => api.get<UserProfile>('/users/me'),
  getAll: (orgId: string) => api.get<UserProfile[]>('/users', { params: { organizationId: orgId } }),
  updateMe: (data: Partial<UserProfile> & { password?: string; oldPassword?: string }) => 
    api.patch<UserProfile>('/users/me', data),
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<{ avatar: string }>('/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
