import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

import showToast from '../utils/toast';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 30000, // 30 second timeout
});

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage
    const token = localStorage.getItem('access_token');

    // Add token to headers if it exists
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle network errors (offline)
    if (!error.response) {
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        showToast.error('Request timeout. Please try again.');
      } else if (error.message === 'Network Error') {
        showToast.error('Network error. Please check your connection.');
      }
      return Promise.reject(error);
    }

    const status = error.response?.status;

    // If error is 401 (Unauthorized) and we haven't retried yet
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem('refresh_token');

        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const { access_token } = response.data;

          // Save new token
          localStorage.setItem('access_token', access_token);

          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
          }

          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        showToast.error('Session expired. Please login again.');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle other HTTP errors
    if (status === 403) {
      showToast.error('Access denied. You do not have permission.');
    } else if (status === 404) {
      showToast.error('Resource not found.');
    } else if (status === 429) {
      showToast.error('Too many requests. Please slow down.');
    } else if (status === 500) {
      showToast.error('Server error. Please try again later.');
    } else if (status === 503) {
      showToast.error('Service unavailable. Please try again later.');
    }

    return Promise.reject(error);
  }
);

export default api;
