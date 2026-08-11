export interface User {
  id: string; phone: string; phoneVerified: boolean;
  firstName: string | null; lastName: string | null; avatar: string | null;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN'; isActive: boolean; createdAt: string; updatedAt: string;
}

export interface LoginResponse { accessToken: string; expiresIn: number; user: User; }

export interface TaxAssistantQuestion { id: string; question: string; description: string | null; options: TaxAssistantOption[]; }
export interface TaxAssistantOption { id: string; label: string; value: string; }
export interface TaxAssistantResult { id: string; name: string; title: string; description: string; ruleIds: string[]; action: string | null; severity: 'INFO' | 'WARNING' | 'CRITICAL' | 'NEEDS_REVIEW'; }
export interface TaxAssistantSession { sessionId: string; question: TaxAssistantQuestion; }

export interface ContentStats {
  articles: { published: number; draft: number; review: number; archived?: number; total: number };
  videos: { published: number; draft: number; review: number; total: number };
  minibooks: { published: number; draft: number; total: number };
  categories: { total: number; active: number };
}
export interface DashboardStats { totalUsers: number; totalArticles: number; totalTaxRules: number; totalBookings: number; pendingBookings: number; confirmedBookings: number; totalQuestions: number; totalResults: number; content?: ContentStats; }

export interface UserRow { id: string; phone: string; firstName: string | null; lastName: string | null; role: string; isActive: boolean; phoneVerified: boolean; createdAt: string; }
export interface AuditLog { id: string; userId: string; action: string; entityType: string; entityId: string; oldValue: string | null; newValue: string | null; ipAddress: string | null; createdAt: string; user?: { id: string; phone: string; firstName: string | null; lastName: string | null }; }
export interface PaginatedResponse<T> { data: T[]; total: number; page: number; limit: number; }

export interface ConsultationService {
  id: string; name: string; slug: string; description: string; duration: number; price: number | null; isActive: boolean; sortOrder: number;
}

export interface ConsultationBooking {
  id: string; slotId: string; serviceId: string; userId: string; phone: string;
  status: string; notes: string | null;
  paymentStatus: 'UNPAID' | 'PENDING' | 'PAID' | 'VERIFIED' | 'REJECTED';
  receiptUrl: string | null; receiptFileName: string | null;
  amount: number | null; paidAt: string | null;
  createdAt: string; updatedAt: string;
  service?: ConsultationService;
}

// ---- Content management types ----
export interface Category {
  id: string; name: string; slug: string; description?: string | null; isActive?: boolean;
}

export type ContentStatus = 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED';
export type TaxRuleStatus = 'DRAFT' | 'REVIEW' | 'APPROVED' | 'PUBLISHED' | 'SUPERSEDED';
export type TaxRuleVersionStatus = 'DRAFT' | 'REVIEW' | 'APPROVED' | 'PUBLISHED';
export type TaxResultSeverity = 'INFO' | 'WARNING' | 'CRITICAL' | 'NEEDS_REVIEW';

export interface Article {
  id: string; title: string; slug: string; excerpt: string | null; content: string;
  featuredImage: string | null; status: ContentStatus; categoryId: string | null;
  createdAt: string; updatedAt: string;
  category?: Category | null;
}

export interface Video {
  id: string; title: string; slug: string; description: string | null; url: string;
  thumbnail: string | null; duration: number | null; status: ContentStatus; categoryId: string | null;
  createdAt: string; updatedAt: string;
  category?: Category | null;
}

export interface MiniBook {
  id: string; title: string; slug: string; description: string | null; fileUrl: string;
  coverImage: string | null; pageCount: number | null; status: ContentStatus; categoryId: string | null;
  createdAt: string; updatedAt: string;
  category?: Category | null;
}

// ---- Tax assistant admin types ----
export interface TaxQuestionOption {
  id: string; questionId: string; label: string; value: string; sortOrder: number;
}

export interface TaxQuestion {
  id: string; question: string; description: string | null; sortOrder: number; isActive: boolean;
  options?: TaxQuestionOption[];
}

export interface TaxAssistantResultAdmin {
  id: string; name: string; title: string; description: string; action: string;
  severity: TaxResultSeverity; isActive: boolean; ruleIds?: string[];
}

// ---- Tax laws admin types ----
export interface TaxTopic {
  id: string; name: string; slug: string; description: string | null; sortOrder: number; isActive: boolean;
  _count?: { rules: number };
}

export interface TaxSource {
  id: string; name: string; url: string | null; officialName: string | null;
  description: string | null; isActive: boolean;
  _count?: { rules: number };
}

export interface TaxRuleVersion {
  id: string; ruleId: string; version: number; content: string; status: TaxRuleVersionStatus;
  effectiveFrom: string; sourceId: string | null;
}

export interface TaxRule {
  id: string; topicId: string; name: string; slug: string; description: string | null;
  status: TaxRuleStatus; createdAt: string; updatedAt: string;
  topic?: TaxTopic | null;
  versions?: TaxRuleVersion[];
}

// ---- Recent activity (dashboard) ----
export interface RecentUser {
  id: string; firstName: string | null; lastName: string | null; phone: string; createdAt: string;
}

export interface RecentArticle {
  id: string; title: string; slug: string; createdAt: string;
}

export interface RecentBooking {
  id: string; status: string; service?: { name: string } | null;
  user?: { firstName: string | null; lastName: string | null } | null;
}

export interface RecentActivity {
  recentUsers: RecentUser[];
  recentArticles: RecentArticle[];
  recentBookings: RecentBooking[];
}

// ---- Content settings (site text editor) ----
export interface ContentSection {
  title: string;
  hero: string;
  subtitle: string;
  description: string;
}

// ---- Public site stats (homepage) ----
export interface SiteStat {
  value: string;
  label: string;
}
