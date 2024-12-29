// src/api.js
import axios from 'axios';
import { ErrorCodes, handleApiError, createErrorResponse } from './utils/apiErrorHandler';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Add request ID for tracking
    config.headers['X-Request-ID'] = crypto.randomUUID();
    
    // Add timestamp for monitoring
    config.metadata = { startTime: new Date() };
    
    return config;
  },
  (error) => {
    return Promise.reject(createErrorResponse(error));
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Add response time metadata
    const duration = new Date() - response.config.metadata.startTime;
    response.duration = duration;

    // Log slow requests (over 1 second)
    if (duration > 1000) {
      console.warn('Slow API call:', {
        url: response.config.url,
        duration,
        method: response.config.method,
      });
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const errorResponse = createErrorResponse(error);

    // Log all errors
    console.error('API Error:', {
      url: originalRequest.url,
      method: originalRequest.method,
      status: error.response?.status,
      error: errorResponse,
      duration: new Date() - originalRequest.metadata.startTime,
    });

    // Handle token expiration
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Get refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Attempt to refresh token
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/auth/refresh-token`,
          { refreshToken }
        );

        const { accessToken, newRefreshToken } = response.data;

        // Update tokens
        localStorage.setItem('token', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        api.defaults.headers['Authorization'] = `Bearer ${accessToken}`;

        // Retry original request
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear tokens and reject
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        return Promise.reject(createErrorResponse(refreshError, 'Session expired'));
      }
    }

    // Handle recoverable errors with retry
    if (errorResponse.recoverable && !originalRequest._retryCount) {
      return handleApiError(
        error,
        () => api(originalRequest),
        3 // Max retries
      );
    }

    // Handle rate limiting
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'];
      if (retryAfter) {
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        return api(originalRequest);
      }
    }

    return Promise.reject(errorResponse);
  }
);

// API instance methods with error handling
const apiWithErrorHandling = {
  async get(url, config = {}) {
    try {
      const response = await api.get(url, config);
      return response.data;
    } catch (error) {
      throw createErrorResponse(error);
    }
  },

  async post(url, data = {}, config = {}) {
    try {
      const response = await api.post(url, data, config);
      return response.data;
    } catch (error) {
      throw createErrorResponse(error);
    }
  },

  async put(url, data = {}, config = {}) {
    try {
      const response = await api.put(url, data, config);
      return response.data;
    } catch (error) {
      throw createErrorResponse(error);
    }
  },

  async delete(url, config = {}) {
    try {
      const response = await api.delete(url, config);
      return response.data;
    } catch (error) {
      throw createErrorResponse(error);
    }
  },

  async upload(url, file, onProgress = () => {}, config = {}) {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post(url, formData, {
        ...config,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        },
      });
      return response.data;
    } catch (error) {
      throw createErrorResponse(error);
    }
  },
};

// Error status check helpers
export const isUnauthorized = (error) => {
  return error.code === ErrorCodes.UNAUTHORIZED || 
         error.code === ErrorCodes.TOKEN_EXPIRED;
};

export const isNetworkError = (error) => {
  return error.code === ErrorCodes.NETWORK_ERROR || 
         error.code === ErrorCodes.TIMEOUT;
};

export const isServerError = (error) => {
  return error.code === ErrorCodes.INTERNAL_ERROR || 
         error.code === ErrorCodes.SERVICE_UNAVAILABLE;
};

export default apiWithErrorHandling;
