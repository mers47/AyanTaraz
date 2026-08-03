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

export interface DashboardStats { totalUsers: number; totalArticles: number; totalTaxRules: number; totalBookings: number; pendingBookings: number; confirmedBookings: number; totalQuestions: number; totalResults: number; }
export interface UserRow { id: string; phone: string; firstName: string | null; lastName: string | null; role: string; isActive: boolean; phoneVerified: boolean; createdAt: string; }
export interface AuditLog { id: string; userId: string; action: string; entityType: string; entityId: string; oldValue: string | null; newValue: string | null; ipAddress: string | null; createdAt: string; user?: { id: string; phone: string; firstName: string | null; lastName: string | null }; }
export interface RecentActivity { recentUsers: any[]; recentArticles: any[]; recentBookings: any[]; }
export interface PaginatedResponse<T> { data: T[]; total: number; page: number; limit: number; }
