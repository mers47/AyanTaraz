import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type {
  DashboardStats,
  RecentActivity,
  UserRow,
  AuditLog,
  PaginatedResponse,
  Article,
  Video,
  MiniBook,
  Category,
  TaxQuestion,
  TaxAssistantResultAdmin,
  TaxTopic,
  TaxSource,
  TaxRule,
  TaxRuleVersion,
  ConsultationService,
  ConsultationBooking,
  ContentSection,
  SiteStat,
  ContentStatus,
  TaxRuleStatus,
  TaxResultSeverity,
  TaxRuleVersionStatus,
} from '@/types';

/** Extends Axios config with the custom `_retry` flag used by the refresh interceptor. */
interface RetryableAxiosConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

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
let refreshPromise: Promise<void> | null = null;

async function doRefresh(): Promise<void> {
  await axios.post(`${apiBase}/auth/refresh`, {}, { withCredentials: true });
}

api.interceptors.response.use(
  (r) => r,
  async (e: AxiosError) => {
    const status = e?.response?.status;
    const isNetwork = !e?.response; // no response => network/CORS/DNS error

    // Only attempt a single refresh on a real 401 from the server.
    if (status === 401 && !(e.config as RetryableAxiosConfig)?._retry && !isRefreshing) {
      (e.config as RetryableAxiosConfig)._retry = true;
      isRefreshing = true;
      try {
        refreshPromise = refreshPromise || doRefresh();
        await refreshPromise;
        refreshPromise = null;
        isRefreshing = false;
        return api(e.config as RetryableAxiosConfig); // retry the original request once
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

// ---- DTO interfaces for admin write operations ----
export interface TaxQuestionInput {
  question: string; description?: string; sortOrder: number; isActive: boolean; slug?: string;
}
export interface TaxQuestionOptionInput {
  questionId: string; label: string; value: string; sortOrder: number;
}
export interface TaxQuestionFlowInput {
  questionId: string; nextQuestionId: string | null; optionId?: string | null;
}
export interface TaxAssistantResultInput {
  name: string; title: string; description: string; action: string;
  severity: TaxResultSeverity; isActive: boolean; ruleIds?: string[];
}
export interface ArticleInput {
  title: string; slug?: string; excerpt?: string; content: string;
  featuredImage?: string; status: ContentStatus; categoryId?: string;
}
export interface VideoInput {
  title: string; slug?: string; description?: string; url: string;
  thumbnail?: string; duration?: number; status: ContentStatus; categoryId?: string;
}
export interface MiniBookInput {
  title: string; slug?: string; description?: string; fileUrl: string;
  coverImage?: string; pageCount?: number; status: ContentStatus; categoryId?: string;
}
export interface ConsultationServiceInput {
  name: string; slug?: string; description: string; duration: number;
  price?: number; isActive: boolean; sortOrder: number;
}
export interface TaxTopicInput {
  name: string; slug?: string; description?: string; sortOrder: number; isActive: boolean;
}
export interface TaxSourceInput {
  name: string; url?: string; officialName?: string; description?: string; isActive: boolean;
}
export interface TaxRuleInput {
  topicId: string; name: string; slug?: string; description?: string;
  content?: string; sourceId?: string; effectiveFrom?: string; status: TaxRuleStatus;
}
export interface TaxRuleVersionInput {
  ruleId?: string; content?: string; status?: TaxRuleVersionStatus;
  effectiveFrom?: string; sourceId?: string;
}
export interface AuditLogParams {
  page?: number; limit?: number; action?: string; entityType?: string; userId?: string;
}

export const adminApi = {
  getDashboardStats: () => api.get<DashboardStats>('/admin/dashboard'),
  getRecentActivity: (l?: number) => api.get<RecentActivity>('/admin/recent-activity', { params: { limit: l } }),
  getUsers: (p?: number, l?: number, s?: string) => api.get<PaginatedResponse<UserRow>>('/admin/users', { params: { page: p, limit: l, search: s } }),
  getAuditLogs: (pr?: AuditLogParams) => api.get<PaginatedResponse<AuditLog>>('/admin/audit-logs', { params: pr }),
  // Chatbot Q&A
  getTaxQuestions: () => api.get<TaxQuestion[]>('/admin/tax-questions'),
  createTaxQuestion: (d: TaxQuestionInput) => api.post('/admin/tax-questions', d),
  updateTaxQuestion: (id: string, d: Partial<TaxQuestionInput>) => api.patch(`/admin/tax-questions/${id}`, d),
  deleteTaxQuestion: (id: string) => api.delete(`/admin/tax-questions/${id}`),
  createTaxQuestionOption: (d: TaxQuestionOptionInput) => api.post('/admin/tax-question-options', d),
  updateTaxQuestionOption: (id: string, d: Partial<TaxQuestionOptionInput>) => api.patch(`/admin/tax-question-options/${id}`, d),
  deleteTaxQuestionOption: (id: string) => api.delete(`/admin/tax-question-options/${id}`),
  getTaxQuestionFlows: () => api.get('/admin/tax-question-flows'),
  createTaxQuestionFlow: (d: TaxQuestionFlowInput) => api.post('/admin/tax-question-flows', d),
  deleteTaxQuestionFlow: (id: string) => api.delete(`/admin/tax-question-flows/${id}`),
  getTaxAssistantResults: () => api.get<TaxAssistantResultAdmin[]>('/admin/tax-assistant-results'),
  createTaxAssistantResult: (d: TaxAssistantResultInput) => api.post('/admin/tax-assistant-results', d),
  updateTaxAssistantResult: (id: string, d: Partial<TaxAssistantResultInput>) => api.patch(`/admin/tax-assistant-results/${id}`, d),
  deleteTaxAssistantResult: (id: string) => api.delete(`/admin/tax-assistant-results/${id}`),
  // Articles
  getArticles: (p?: number, l?: number, s?: string) => api.get<PaginatedResponse<Article>>('/admin/articles', { params: { page: p, limit: l, search: s } }),
  getArticle: (id: string) => api.get<Article>(`/admin/articles/${id}`),
  createArticle: (d: ArticleInput) => api.post('/admin/articles', d),
  updateArticle: (id: string, d: Partial<ArticleInput>) => api.patch(`/admin/articles/${id}`, d),
  deleteArticle: (id: string) => api.delete(`/admin/articles/${id}`),
  getCategories: () => api.get<Category[]>('/admin/categories'),
  // Videos
  getVideos: (p?: number, l?: number, s?: string) => api.get<PaginatedResponse<Video>>('/admin/videos', { params: { page: p, limit: l, search: s } }),
  createVideo: (d: VideoInput) => api.post('/admin/videos', d),
  updateVideo: (id: string, d: Partial<VideoInput>) => api.patch(`/admin/videos/${id}`, d),
  deleteVideo: (id: string) => api.delete(`/admin/videos/${id}`),
  // MiniBooks
  getMiniBooks: (p?: number, l?: number, s?: string) => api.get<PaginatedResponse<MiniBook>>('/admin/minibooks', { params: { page: p, limit: l, search: s } }),
  createMiniBook: (d: MiniBookInput) => api.post('/admin/minibooks', d),
  updateMiniBook: (id: string, d: Partial<MiniBookInput>) => api.patch(`/admin/minibooks/${id}`, d),
  deleteMiniBook: (id: string) => api.delete(`/admin/minibooks/${id}`),
  // Consultation Services
  getConsultationServices: () => api.get<ConsultationService[]>('/admin/consultation-services'),
  createConsultationService: (d: ConsultationServiceInput) => api.post('/admin/consultation-services', d),
  updateConsultationService: (id: string, d: Partial<ConsultationServiceInput>) => api.patch(`/admin/consultation-services/${id}`, d),
  deleteConsultationService: (id: string) => api.delete(`/admin/consultation-services/${id}`),
  // Consultation Bookings (admin can see all — passes empty phone which backend allows for admins)
  getAllBookings: () => api.get<ConsultationBooking[]>('/consultation/bookings'),
  // Tax Topics
  getTaxTopicsAdmin: () => api.get<TaxTopic[]>('/admin/tax-topics'),
  createTaxTopic: (d: TaxTopicInput) => api.post('/admin/tax-topics', d),
  updateTaxTopic: (id: string, d: Partial<TaxTopicInput>) => api.patch(`/admin/tax-topics/${id}`, d),
  deleteTaxTopic: (id: string) => api.delete(`/admin/tax-topics/${id}`),
  // Tax Sources
  getTaxSources: () => api.get<TaxSource[]>('/admin/tax-sources'),
  createTaxSource: (d: TaxSourceInput) => api.post('/admin/tax-sources', d),
  updateTaxSource: (id: string, d: Partial<TaxSourceInput>) => api.patch(`/admin/tax-sources/${id}`, d),
  deleteTaxSource: (id: string) => api.delete(`/admin/tax-sources/${id}`),
  // Tax Rules
  getTaxRulesAdmin: (topicId?: string) => api.get<PaginatedResponse<TaxRule>>('/admin/tax-rules', { params: { topicId } }),
  createTaxRule: (d: TaxRuleInput) => api.post('/admin/tax-rules', d),
  updateTaxRule: (id: string, d: Partial<TaxRuleInput>) => api.patch(`/admin/tax-rules/${id}`, d),
  deleteTaxRule: (id: string) => api.delete(`/admin/tax-rules/${id}`),
  // Tax Rule Versions
  createTaxRuleVersion: (d: TaxRuleVersionInput) => api.post('/admin/tax-rule-versions', d),
  updateTaxRuleVersion: (id: string, d: Partial<TaxRuleVersionInput>) => api.patch(`/admin/tax-rule-versions/${id}`, d),
  deleteTaxRuleVersion: (id: string) => api.delete(`/admin/tax-rule-versions/${id}`),
};

export const contentApi = {
  getAll: () => api.get<Record<string, ContentSection>>('/content'),
  get: (k: string) => api.get<ContentSection>(`/content/${k}`),
  save: (k: string, d: ContentSection) => api.put(`/content/${k}`, d),
  autoFill: () => api.post<{ message?: string }>('/content/autofill'),
  /** Fetch the public homepage stats (stored as content_site_stats in AdminSetting). */
  getSiteStats: () => api.get<SiteStat[]>('/content/site_stats'),
};

// Public content (articles, videos, minibooks) — no auth required
export const publicContentApi = {
  getArticles: (p?: number, l?: number, s?: string) => api.get<PaginatedResponse<Article>>('/content/articles', { params: { page: p, limit: l, search: s } }),
  getArticle: (slug: string) => api.get<Article>(`/content/articles/${slug}`),
  getVideos: (p?: number, l?: number, s?: string) => api.get<PaginatedResponse<Video>>('/content/videos', { params: { page: p, limit: l, search: s } }),
  getVideo: (slug: string) => api.get<Video>(`/content/videos/${slug}`),
  getMiniBooks: (p?: number, l?: number, s?: string) => api.get<PaginatedResponse<MiniBook>>('/content/minibooks', { params: { page: p, limit: l, search: s } }),
  getMiniBook: (slug: string) => api.get<MiniBook>(`/content/minibooks/${slug}`),
  getCategories: () => api.get<Category[]>('/content/categories'),
};

export const consultationApi = {
  getServices: () => api.get<ConsultationService[]>('/consultation/services'),
  getAvailability: (sid: string) => api.get(`/consultation/availability/${sid}`),
  book: (d: { serviceId: string; date: string; time: string; phone: string; name: string; notes?: string }) =>
    api.post('/consultation/book', d),
  getBookings: (phone: string) => api.get<ConsultationBooking[]>('/consultation/bookings', { params: { phone } }),
  getBooking: (id: string) => api.get<ConsultationBooking>(`/consultation/booking/${id}`),
  uploadReceipt: (bookingId: string, fileBase64: string, fileName: string) =>
    api.post('/consultation/upload-receipt', { bookingId, fileBase64, fileName }),
};

export default api;
