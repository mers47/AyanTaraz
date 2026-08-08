import axios from 'axios';

const A = process.env.NEXT_PUBLIC_API_URL || '';
// In production behind Nginx, NEXT_PUBLIC_API_URL is empty so the browser calls
// the relative "/api" path (proxied to the backend). This is what makes auth
// cookies + CORS work and avoids the admin infinite-refresh loop.
const apiBase = A ? `${A}/api` : '/api';

const api = axios.create({
  baseURL: apiBase,
  timeout: 30000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

let isRefreshing = false;
let refreshPromise: Promise<any> | null = null;

async function doRefresh(): Promise<any> {
  return axios.post(`${apiBase}/auth/refresh`, {}, { withCredentials: true });
}

api.interceptors.response.use(
  (r) => r,
  async (e) => {
    const status = e?.response?.status;
    const isNetwork = !e?.response; // no response => network/CORS/DNS error

    // Only attempt a single refresh on a real 401 from the server.
    if (status === 401 && !e.config?._retry && !isRefreshing) {
      e.config._retry = true;
      isRefreshing = true;
      try {
        refreshPromise = refreshPromise || doRefresh();
        await refreshPromise;
        refreshPromise = null;
        isRefreshing = false;
        return api(e.config); // retry the original request once
      } catch (err) {
        refreshPromise = null;
        isRefreshing = false;
        // Refresh failed => session truly expired. Redirect to home (NOT to the
        // current /admin page, which caused the infinite reload loop).
        if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
          window.location.href = '/?expired=1';
        }
        return Promise.reject(err);
      }
    }

    // For network errors (backend down / unreachable) do NOT redirect — let the
    // caller show a graceful message instead of looping the browser.
    return Promise.reject(e);
  },
);

export const authApi = {
  sendOTP: (p: string) => api.post('/auth/send-otp', { phone: p }),
  login: (p: string, c: string) => api.post('/auth/login', { phone: p, code: c }),
  refresh: () => api.post('/auth/refresh'),
  logout: () => api.post('/auth/logout'),
};

// Public tax law reference (topics + rules + versions) — no auth required
export const taxApi = {
  getTopics: () => api.get('/tax/topics'),
  getRules: (topicSlug?: string, page = 1, limit = 100) =>
    api.get('/tax/rules', { params: { topic: topicSlug, page, limit } }),
  getRule: (slug: string) => api.get(`/tax/rules/${slug}`),
};

export const taxAssistantApi = {
  startSession: (q?: string) => api.post('/tax-assistant/start', { questionId: q }),
  answerQuestion: (s: string, q: string, o: string, v: string) =>
    api.post('/tax-assistant/answer', { sessionId: s, questionId: q, optionId: o, optionValue: v }),
  getSession: (s: string) => api.get(`/tax-assistant/session/${s}`),
  resetSession: (s: string) => api.delete(`/tax-assistant/session/${s}`),
};

export const adminApi = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  getRecentActivity: (l?: number) => api.get('/admin/recent-activity', { params: { limit: l } }),
  getUsers: (p?: number, l?: number, s?: string) => api.get('/admin/users', { params: { page: p, limit: l, search: s } }),
  getAuditLogs: (pr?: any) => api.get('/admin/audit-logs', { params: pr }),
  // Chatbot Q&A
  getTaxQuestions: () => api.get('/admin/tax-questions'),
  createTaxQuestion: (d: any) => api.post('/admin/tax-questions', d),
  updateTaxQuestion: (id: string, d: any) => api.patch(`/admin/tax-questions/${id}`, d),
  deleteTaxQuestion: (id: string) => api.delete(`/admin/tax-questions/${id}`),
  createTaxQuestionOption: (d: any) => api.post('/admin/tax-question-options', d),
  updateTaxQuestionOption: (id: string, d: any) => api.patch(`/admin/tax-question-options/${id}`, d),
  deleteTaxQuestionOption: (id: string) => api.delete(`/admin/tax-question-options/${id}`),
  getTaxQuestionFlows: () => api.get('/admin/tax-question-flows'),
  createTaxQuestionFlow: (d: any) => api.post('/admin/tax-question-flows', d),
  deleteTaxQuestionFlow: (id: string) => api.delete(`/admin/tax-question-flows/${id}`),
  getTaxAssistantResults: () => api.get('/admin/tax-assistant-results'),
  createTaxAssistantResult: (d: any) => api.post('/admin/tax-assistant-results', d),
  updateTaxAssistantResult: (id: string, d: any) => api.patch(`/admin/tax-assistant-results/${id}`, d),
  deleteTaxAssistantResult: (id: string) => api.delete(`/admin/tax-assistant-results/${id}`),
  // Articles
  getArticles: (p?: number, l?: number, s?: string) => api.get('/admin/articles', { params: { page: p, limit: l, search: s } }),
  getArticle: (id: string) => api.get(`/admin/articles/${id}`),
  createArticle: (d: any) => api.post('/admin/articles', d),
  updateArticle: (id: string, d: any) => api.patch(`/admin/articles/${id}`, d),
  deleteArticle: (id: string) => api.delete(`/admin/articles/${id}`),
  getCategories: () => api.get('/admin/categories'),
  // Videos
  getVideos: (p?: number, l?: number, s?: string) => api.get('/admin/videos', { params: { page: p, limit: l, search: s } }),
  createVideo: (d: any) => api.post('/admin/videos', d),
  updateVideo: (id: string, d: any) => api.patch(`/admin/videos/${id}`, d),
  deleteVideo: (id: string) => api.delete(`/admin/videos/${id}`),
  // MiniBooks
  getMiniBooks: (p?: number, l?: number, s?: string) => api.get('/admin/minibooks', { params: { page: p, limit: l, search: s } }),
  createMiniBook: (d: any) => api.post('/admin/minibooks', d),
  updateMiniBook: (id: string, d: any) => api.patch(`/admin/minibooks/${id}`, d),
  deleteMiniBook: (id: string) => api.delete(`/admin/minibooks/${id}`),
  // Consultation Services
  getConsultationServices: () => api.get('/admin/consultation-services'),
  createConsultationService: (d: any) => api.post('/admin/consultation-services', d),
  updateConsultationService: (id: string, d: any) => api.patch(`/admin/consultation-services/${id}`, d),
  deleteConsultationService: (id: string) => api.delete(`/admin/consultation-services/${id}`),
};

export const contentApi = {
  getAll: () => api.get('/content'),
  get: (k: string) => api.get(`/content/${k}`),
  save: (k: string, d: any) => api.put(`/content/${k}`, d),
  autoFill: () => api.post('/content/autofill'),
};

// Public content (articles, videos, minibooks) — no auth required
export const publicContentApi = {
  getArticles: (p?: number, l?: number, s?: string) => api.get('/content/articles', { params: { page: p, limit: l, search: s } }),
  getArticle: (slug: string) => api.get(`/content/articles/${slug}`),
  getVideos: (p?: number, l?: number, s?: string) => api.get('/content/videos', { params: { page: p, limit: l, search: s } }),
  getVideo: (slug: string) => api.get(`/content/videos/${slug}`),
  getMiniBooks: (p?: number, l?: number, s?: string) => api.get('/content/minibooks', { params: { page: p, limit: l, search: s } }),
  getMiniBook: (slug: string) => api.get(`/content/minibooks/${slug}`),
  getCategories: () => api.get('/content/categories'),
};

export const consultationApi = {
  getServices: () => api.get('/consultation/services'),
  getAvailability: (sid: string) => api.get(`/consultation/availability/${sid}`),
  book: (d: { serviceId: string; date: string; time: string; phone: string; name: string; notes?: string }) =>
    api.post('/consultation/book', d),
  getBookings: (phone: string) => api.get('/consultation/bookings', { params: { phone } }),
  getBooking: (id: string) => api.get(`/consultation/booking/${id}`),
  uploadReceipt: (bookingId: string, fileBase64: string, fileName: string) =>
    api.post('/consultation/upload-receipt', { bookingId, fileBase64, fileName }),
};

export default api;
