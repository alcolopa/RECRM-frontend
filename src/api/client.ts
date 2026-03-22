import axios from 'axios';

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 10000,
});

// Add a request interceptor to attach the JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    if (config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Add a response interceptor to sanitize data
api.interceptors.response.use((response) => {
  if (response.data) {
    // 1. If it's a paginated response with an items property
    if (Object.prototype.hasOwnProperty.call(response.data, 'items')) {
      if (!Array.isArray(response.data.items)) {
        response.data.items = [];
      }
    }
    
    // 2. If the response is from a list-returning endpoint (like /users, /properties/features, etc.)
    // but the data is null/undefined or not an array, ensure it's an array if appropriate.
    // For userService.getAll which calls /users
    const listEndpoints = ['/users', '/properties/features', '/dashboard/stats', '/dashboard/recent-leads', '/dashboard/upcoming-tasks', '/dashboard/recent-activities', '/invitations', '/roles'];
    const url = response.config.url || '';
    
    if (listEndpoints.some(endpoint => url.includes(endpoint))) {
      if (!Array.isArray(response.data) && !Object.prototype.hasOwnProperty.call(response.data, 'items')) {
        // If it was supposed to be a direct array but isn't
        response.data = [];
      }
    }
  }
  return response;
}, (error) => {
  return Promise.reject(error);
});

export default api;
