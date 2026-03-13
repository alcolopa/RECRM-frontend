import api from './client';

export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role: string;
  organizationId: string;
  organization?: {
    id: string;
    name: string;
    slug: string;
  };
}

export const userService = {
  getMe: () => api.get<UserProfile>('/users/me'),
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
