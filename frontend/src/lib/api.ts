import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const api: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`, timeout: 30000, headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('accessToken'); window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export const authApi = {
  sendOTP: (phone: string) => api.post('/auth/send-otp', { phone }),
  verifyOTP: (phone: string, code: string) => api.post('/auth/verify-otp', { phone, code }),
  login: (phone: string, code: string) => api.post('/auth/login', { phone, code }),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

export const taxAssistantApi = {
  startSession: (questionId?: string, answers?: Record<string, string>) => api.post('/tax-assistant/start', { questionId, answers }),
  answerQuestion: (sessionId: string, questionId: string, optionId: string, optionValue: string) => api.post('/tax-assistant/answer', { sessionId, questionId, optionId, optionValue }),
};

export const adminApi = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  getRecentActivity: (limit?: number) => api.get('/admin/recent-activity', { params: { limit } }),
  getUsers: (page?: number, limit?: number, search?: string) => api.get('/admin/users', { params: { page, limit, search } }),
  getAdminUsers: () => api.get('/admin/users/admin'),
  createAdminUser: (data: { phone: string; firstName: string; lastName: string; role?: string }) => api.post('/admin/users/admin', data),
  updateAdminUser: (id: string, data: any) => api.patch(`/admin/users/admin/${id}`, data),
  getAuditLogs: (params?: any) => api.get('/admin/audit-logs', { params }),
};

export default api;
