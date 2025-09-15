// API Configuration constants
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  
  // Shopify endpoints
  STORES: '/shopify/stores',
  CONNECT_STORE: '/shopify/connect',
  
  // Metrics endpoints
  SUMMARY: (tenantId) => `/metrics/${tenantId}/summary`,
  REVENUE_OVER_TIME: (tenantId) => `/metrics/${tenantId}/revenue-over-time`,
  TOP_CUSTOMERS: (tenantId) => `/metrics/${tenantId}/top-customers`,
  ADVANCED_METRICS: (tenantId) => `/metrics/${tenantId}/advanced-metrics`,
  REVENUE_TRENDS: (tenantId) => `/metrics/${tenantId}/revenue-trends`,
  ORDERS_BY_DATE: (tenantId) => `/metrics/${tenantId}/orders-by-date`
};

export const CHART_COLORS = {
  PRIMARY: 'rgba(54, 162, 235, 0.6)',
  PRIMARY_BORDER: 'rgba(54, 162, 235, 1)',
  SECONDARY: 'rgba(255, 99, 132, 0.6)',
  SECONDARY_BORDER: 'rgba(255, 99, 132, 1)',
  SUCCESS: 'rgba(75, 192, 192, 0.6)',
  SUCCESS_BORDER: 'rgba(75, 192, 192, 1)',
  WARNING: 'rgba(255, 205, 86, 0.8)',
  INFO: 'rgba(153, 102, 255, 0.8)',
  CHART_PALETTE: [
    'rgba(255, 99, 132, 0.8)',
    'rgba(54, 162, 235, 0.8)',
    'rgba(255, 205, 86, 0.8)',
    'rgba(75, 192, 192, 0.8)',
    'rgba(153, 102, 255, 0.8)'
  ]
};
