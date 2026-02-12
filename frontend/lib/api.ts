import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
      error.message = 'Unable to connect to server. Please check your internet connection.';
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Only redirect if not already on login/signup pages
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/auth/')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/auth/login';
      }
    }

    // Format validation errors for better display
    if (error.response?.status === 422 && error.response?.data?.errors) {
      const errors = error.response.data.errors;
      const formattedMessage = errors
        .map((e: any) => {
          // Extract field name from location
          const field = e.loc?.[e.loc.length - 1] || 'field';
          const message = e.msg?.replace('Value error, ', '') || e.message || 'Invalid value';
          return `${field}: ${message}`;
        })
        .join('; ');
      
      // Store formatted message in detail for easy access
      error.response.data.formattedDetail = formattedMessage;
    }

    return Promise.reject(error);
  }
);

export default api;
