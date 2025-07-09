import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Update this to your actual Replit app URL
const API_BASE_URL = 'https://your-replit-app.replit.app/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('mobile-token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear storage and redirect to login
      await AsyncStorage.multiRemove(['mobile-token', 'mobile-user']);
      // You can emit an event or use a global state manager to handle logout
    }
    return Promise.reject(error);
  }
);

export default api;

// Utility functions for common API patterns
export const apiRequest = async (method: string, url: string, data?: any) => {
  try {
    const response = await api({
      method,
      url,
      data,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'API request failed');
  }
};

// Specific API functions for mobile app
export const mobileAPI = {
  // Authentication
  login: (credentials: any) => apiRequest('POST', '/mobile/auth/login', credentials),
  logout: () => apiRequest('POST', '/mobile/auth/logout'),
  checkAuth: () => apiRequest('GET', '/mobile/auth/check'),

  // Coach APIs
  coach: {
    getDashboard: () => apiRequest('GET', '/mobile/coach/dashboard'),
    getTodayClasses: () => apiRequest('GET', '/mobile/coach/today-classes'),
    getClasses: () => apiRequest('GET', '/mobile/coach/classes'),
    getStudents: () => apiRequest('GET', '/mobile/coach/students'),
    markAttendance: (data: any) => apiRequest('POST', '/mobile/coach/attendance', data),
    getAttendanceHistory: () => apiRequest('GET', '/mobile/coach/attendance-history'),
    getProfile: () => apiRequest('GET', '/mobile/coach/profile'),
    updateProfile: (data: any) => apiRequest('PUT', '/mobile/coach/profile', data),
    checkIn: (data: any) => apiRequest('POST', '/mobile/coach/check-in', data),
    checkOut: (data: any) => apiRequest('POST', '/mobile/coach/check-out', data),
  },

  // Student APIs
  student: {
    getDashboard: () => apiRequest('GET', '/mobile/student/dashboard'),
    getSchedule: () => apiRequest('GET', '/mobile/student/schedule'),
    getAttendance: () => apiRequest('GET', '/mobile/student/attendance'),
    getPayments: () => apiRequest('GET', '/mobile/student/payments'),
    getBadges: () => apiRequest('GET', '/mobile/student/badges'),
    getProfile: () => apiRequest('GET', '/mobile/student/profile'),
    updateProfile: (data: any) => apiRequest('PUT', '/mobile/student/profile', data),
    makePayment: (data: any) => apiRequest('POST', '/mobile/student/payment', data),
  },

  // Common APIs
  common: {
    uploadFile: (formData: FormData) => apiRequest('POST', '/mobile/upload', formData),
    getNotifications: () => apiRequest('GET', '/mobile/notifications'),
    markNotificationRead: (id: number) => apiRequest('PUT', `/mobile/notifications/${id}/read`),
  },
};

export { API_BASE_URL };