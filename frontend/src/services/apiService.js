import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { API_BASE_URL, API_ENDPOINTS } from '../constants/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth API calls
export const authAPI = {
  login: async (email, password) => {
    const response = await apiClient.post(API_ENDPOINTS.LOGIN, { email, password });
    return response.data;
  },

  register: async (userData) => {
    const response = await apiClient.post(API_ENDPOINTS.REGISTER, userData);
    return response.data;
  },

  getCurrentUser: () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      return jwtDecode(token);
    }
    return null;
  }
};

// Shopify API calls
export const shopifyAPI = {
  getStores: async (tenantId) => {
    const response = await apiClient.get(`${API_ENDPOINTS.STORES}/${tenantId}`);
    return response.data;
  },

  connectStore: async (storeData) => {
    const response = await apiClient.post(API_ENDPOINTS.CONNECT_STORE, storeData);
    return response.data;
  },

  syncStoreData: async (storeId) => {
    const response = await apiClient.post('/api/sync/full', { storeId });
    return response.data;
  }
};

// Metrics API calls
export const metricsAPI = {
  getSummary: async (tenantId, params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.SUMMARY(tenantId), { params });
    return response.data;
  },

  getRevenueOverTime: async (tenantId, params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.REVENUE_OVER_TIME(tenantId), { params });
    return response.data;
  },

  getTopCustomers: async (tenantId, params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.TOP_CUSTOMERS(tenantId), { params });
    return response.data;
  },

  getAdvancedMetrics: async (tenantId, params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.ADVANCED_METRICS(tenantId), { params });
    return response.data;
  },

  getRevenueTrends: async (tenantId, params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.REVENUE_TRENDS(tenantId), { params });
    return response.data;
  },

  getOrdersByDate: async (tenantId, params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.ORDERS_BY_DATE(tenantId), { params });
    return response.data;
  }
};

export default apiClient;
