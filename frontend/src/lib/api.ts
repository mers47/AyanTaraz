import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Required for cross-origin cookie handling
});

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add auth token if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized (token expired or invalid)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (typeof window !== 'undefined') {
        try {
          // Attempt to refresh the token
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            const response = await axios.post(
              `${API_BASE_URL}/api/auth/refresh`,
              { refreshToken },
              { withCredentials: true }
            );

            const { accessToken } = response.data;
            localStorage.setItem('accessToken', accessToken);

            // Retry the original request with the new token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            }
            return api(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed, redirect to login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }

    // Handle other errors
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  sendOTP: (phone: string, type?: 'PHONE_VERIFICATION' | 'BOOKING_VERIFICATION') =>
    api.post('/auth/send-otp', { phone, type }),

  verifyOTP: (phone: string, code: string, type?: 'PHONE_VERIFICATION' | 'BOOKING_VERIFICATION') =>
    api.post('/auth/verify-otp', { phone, code, type }),

  login: (phone: string, code: string) =>
    api.post('/auth/login', { phone, code }),

  logout: (allSessions?: boolean) =>
    api.post('/auth/logout', { allSessions }),

  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),

  getMe: () => api.get('/auth/me'),
};

// User API
export const userApi = {
  getMe: () => api.get('/users/me'),
  updateMe: (data: { firstName?: string; lastName?: string; avatar?: string }) =>
    api.patch('/users/me', data),
  getById: (id: string) => api.get(`/users/${id}`),
  getAll: (page?: number, limit?: number) =>
    api.get('/users', { params: { page, limit } }),
};

// Content API
export const contentApi = {
  // Articles
  getArticles: (page?: number, limit?: number, category?: string, tag?: string, status?: string) =>
    api.get('/content/articles', { params: { page, limit, category, tag, status } }),

  getArticleBySlug: (slug: string) =>
    api.get(`/content/articles/${slug}`),

  getFeaturedArticles: (limit?: number) =>
    api.get('/content/articles/featured', { params: { limit } }),

  getRelatedArticles: (id: string, limit?: number) =>
    api.get(`/content/articles/${id}/related`, { params: { limit } }),

  // Categories
  getCategories: () => api.get('/content/categories'),

  // Tags
  getTags: () => api.get('/content/tags'),
};

// Tax API
export const taxApi = {
  getTaxRules: (page?: number, limit?: number, topic?: string, status?: string) =>
    api.get('/tax/rules', { params: { page, limit, topic, status } }),

  getTaxRuleBySlug: (slug: string) =>
    api.get(`/tax/rules/${slug}`),

  getEffectiveRule: (topicSlug: string, asOf?: string) =>
    api.get(`/tax/rules/${topicSlug}/effective`, { params: { asOf } }),

  // Topics
  getTaxTopics: () => api.get('/tax/topics'),
};

// Tax Assistant API
export const taxAssistantApi = {
  startSession: (questionId?: string, answers?: Record<string, string>) =>
    api.post('/tax-assistant/start', { questionId, answers }),

  answerQuestion: (sessionId: string, questionId: string, optionValue: string) =>
    api.post('/tax-assistant/answer', { sessionId, questionId, optionValue }),
};

// Consultation API
export const consultationApi = {
  getServices: (active?: boolean) =>
    api.get('/consultation/services', { params: { active } }),

  getServiceBySlug: (slug: string) =>
    api.get(`/consultation/services/${slug}`),

  getAvailability: (serviceId: string, date: string) =>
    api.get(`/consultation/services/${serviceId}/availability`, { params: { date } }),

  createBooking: (data: {
    serviceId: string;
    slotId: string;
    phone: string;
    otpCode: string;
    notes?: string;
  }) => api.post('/consultation/bookings', data),

  getBooking: (id: string) => api.get(`/consultation/bookings/${id}`),

  getMyBookings: () => api.get('/consultation/my-bookings'),

  cancelBooking: (id: string) => api.post(`/consultation/bookings/${id}/cancel`),
};

// SEO API
export const seoApi = {
  getSEOConfig: (path: string) => api.get(`/seo/config/${path}`),
  getSitemap: () => api.get('/seo/sitemap'),
  getRobotsTxt: () => api.get('/seo/robots.txt'),
};

// Admin API
export const adminApi = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  getRecentActivity: (limit?: number) =>
    api.get('/admin/recent-activity', { params: { limit } }),
  getAdminUsers: () => api.get('/admin/users/admin'),
  createAdminUser: (data: { phone: string; firstName: string; lastName: string; role?: string }) =>
    api.post('/admin/users/admin', data),
  updateAdminUser: (id: string, data: { firstName?: string; lastName?: string; role?: string; isActive?: boolean }) =>
    api.post(`/admin/users/admin/${id}`, data),
  getAuditLogs: (params?: {
    page?: number;
    limit?: number;
    action?: string;
    userId?: string;
    entityType?: string;
    entityId?: string;
    startDate?: string;
    endDate?: string;
  }) => api.get('/admin/audit-logs', { params }),
};

// Media API
export const mediaApi = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getById: (id: string) => api.get(`/media/${id}`),
  delete: (id: string) => api.delete(`/media/${id}`),
  getAll: (params?: { page?: number; limit?: number; mimeType?: string; uploadedById?: string }) =>
    api.get('/media', { params }),
};

// Health Check
export const healthApi = {
  check: () => api.get('/health'),
  checkDB: () => api.get('/health/db'),
};

export default api;