// User Types
export interface User {
  id: string;
  phone: string;
  phoneVerified: boolean;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Auth Types
export interface LoginResponse {
  accessToken: string;
  expiresIn: number;
  user: User;
}

export interface OTPSendResponse {
  message: string;
}

export interface OTPVerifyResponse {
  message: string;
}

// Content Types
export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  status: 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED';
  featuredImage: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  categoryId: string;
  authorId: string;
  category?: Category;
  author?: User;
  tags?: Tag[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface Video {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  url: string;
  thumbnail: string | null;
  duration: number | null;
  status: 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MiniBook {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  fileUrl: string;
  coverImage: string | null;
  pageCount: number | null;
  status: 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Tax Types
export interface TaxTopic {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface TaxSource {
  id: string;
  name: string;
  url: string | null;
  officialName: string | null;
  description: string | null;
  isActive: boolean;
}

export interface TaxRule {
  id: string;
  topicId: string;
  name: string;
  slug: string;
  description: string | null;
  status: 'DRAFT' | 'REVIEW' | 'APPROVED' | 'PUBLISHED' | 'SUPERSEDED';
  createdAt: string;
  updatedAt: string;
  topic?: TaxTopic;
  versions?: TaxRuleVersion[];
}

export interface TaxRuleVersion {
  id: string;
  ruleId: string;
  version: number;
  content: string;
  sourceId: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  status: 'DRAFT' | 'REVIEW' | 'APPROVED' | 'PUBLISHED';
  reviewNotes: string | null;
  reviewedById: string | null;
  reviewedAt: string | null;
  publishedById: string | null;
  publishedAt: string | null;
  source?: TaxSource;
}

// Tax Assistant Types
export interface TaxAssistantQuestion {
  id: string;
  question: string;
  description: string | null;
  options: {
    id: string;
    label: string;
    value: string;
  }[];
}

export interface TaxAssistantResult {
  id: string;
  name: string;
  title: string;
  description: string;
  ruleIds: string[];
  action: string | null;
  severity: 'INFO' | 'WARNING' | 'CRITICAL' | 'NEEDS_REVIEW';
}

export interface TaxAssistantSession {
  sessionId: string;
  question: TaxAssistantQuestion;
}

export interface TaxAssistantResponse {
  question: TaxAssistantQuestion | null;
  result: TaxAssistantResult | null;
  completed: boolean;
}

// Consultation Types
export interface ConsultationService {
  id: string;
  name: string;
  slug: string;
  description: string;
  duration: number;
  price: number | null;
  isActive: boolean;
  sortOrder: number;
}

export interface ConsultationSlot {
  id: string;
  availabilityId: string;
  date: string;
  startTime: string;
  endTime: string;
  maxBookings: number;
  isActive: boolean;
}

export interface ConsultationBooking {
  id: string;
  slotId: string;
  serviceId: string;
  userId: string | null;
  phone: string;
  otpVerified: boolean;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  slot?: ConsultationSlot;
  service?: ConsultationService;
}

// SEO Types
export interface SEOConfig {
  id: string;
  path: string;
  title: string | null;
  description: string | null;
  canonical: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  ogUrl: string | null;
  twitterCard: string | null;
  twitterTitle: string | null;
  twitterDescription: string | null;
  twitterImage: string | null;
  schemaMarkup: string | null;
  indexable: boolean;
  followLinks: boolean;
}

export interface Redirect {
  id: string;
  fromPath: string;
  toPath: string;
  statusCode: number;
  isActive: boolean;
}

// Admin Types
export interface DashboardStats {
  totalUsers: number;
  totalArticles: number;
  totalVideos: number;
  totalMiniBooks: number;
  totalTaxRules: number;
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
}

export interface AdminUser {
  id: string;
  phone: string;
  firstName: string | null;
  lastName: string | null;
  role: 'ADMIN' | 'SUPER_ADMIN';
  isActive: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue: string | null;
  newValue: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user?: User;
}

// Media Types
export interface Media {
  id: string;
  name: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  dimensions: string | null;
  altText: string | null;
  description: string | null;
  uploadedById: string;
  createdAt: string;
  uploadedBy?: User;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ErrorResponse {
  statusCode: number;
  message: string;
  error: string;
}

// Form Types
export interface SendOTPForm {
  phone: string;
}

export interface VerifyOTPForm {
  phone: string;
  code: string;
}

export interface LoginForm {
  phone: string;
  code: string;
}

export interface ProfileForm {
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

export interface BookingForm {
  serviceId: string;
  slotId: string;
  phone: string;
  otpCode: string;
  notes?: string;
}
