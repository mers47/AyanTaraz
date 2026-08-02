# Ayan Taraz — Production-Ready Accounting & Tax Advisory Platform

## 📋 Overview

**Ayan Taraz** is a comprehensive, production-ready website for professional accounting and tax advisory services. Built with a modern, mobile-first approach, the platform offers:

- ✅ Premium black/gold design system
- ✅ Phone + SMS OTP authentication
- ✅ Interactive deterministic tax chatbot (no AI)
- ✅ Traceable tax content with official sources
- ✅ Articles, videos, and MiniBooks
- ✅ Consultation booking system
- ✅ Full admin panel with audit logging
- ✅ Strong SEO foundation
- ✅ High performance and security

## 🏗️ Architecture

```
USER
 ↓
CDN/WAF/HTTPS (Nginx)
 ↓
Next.js (Frontend)
 ↓
REST/NestJS (Backend)
 ├─ PostgreSQL + Prisma (Source of Truth)
 ├─ Redis (OTP, Rate Limiting, Caching)
 └─ Object Storage (Media Files)
```

### Project Structure

```
ayan-taraz/
├── backend/                 # NestJS Modular Monolith
│   ├── src/
│   │   ├── modules/         # Business modules
│   │   │   ├── auth/        # Phone OTP authentication
│   │   │   ├── users/       # User management
│   │   │   ├── content/     # Articles, videos, mini-books
│   │   │   ├── media/       # File uploads
│   │   │   ├── tax/         # Tax rules and topics
│   │   │   ├── tax-assistant/ # Deterministic tax chatbot
│   │   │   ├── consultation/ # Booking system
│   │   │   ├── seo/         # SEO configurations
│   │   │   ├── admin/       # Admin panel
│   │   │   └── audit/       # Audit logging
│   │   ├── common/          # Shared utilities
│   │   │   ├── decorators/
│   │   │   ├── guards/
│   │   │   └── redis/
│   │   └── prisma/          # Database layer
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.ts         # Initial data
│   └── Dockerfile
│
├── frontend/                # Next.js Application
│   ├── src/
│   │   ├── app/            # App Router pages
│   │   ├── components/     # Reusable components
│   │   ├── lib/            # Utilities and API client
│   │   ├── styles/         # Global styles
│   │   └── types/          # TypeScript types
│   └── Dockerfile
│
├── infra/                  # Infrastructure
│   ├── docker-compose.yml
│   └── nginx.conf
│
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ 
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+

### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mers47/AyanTaraz.git
   cd AyanTaraz
   ```

2. **Start the development environment:**
   ```bash
   docker-compose up -d
   ```

3. **Access the services:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000
   - API Docs: http://localhost:4000/api/docs
   - PostgreSQL: localhost:5432
   - Redis: localhost:6379

4. **Initialize the database:**
   ```bash
   cd backend
   npm run prisma:migrate
   npm run db:seed
   ```

### Environment Variables

Create `.env` files in both `backend/` and `frontend/` directories based on the `.env.example` templates.

#### Backend (.env)
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ayan_taraz?schema=public"
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
PORT=4000
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## 📦 Tech Stack

### Backend
- **Framework:** NestJS 10+
- **Language:** TypeScript
- **Database:** PostgreSQL + Prisma ORM
- **Cache:** Redis (ioredis)
- **Authentication:** JWT + Phone OTP
- **Validation:** class-validator + Zod
- **API Docs:** Swagger

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Query
- **Forms:** React Hook Form + Zod
- **Icons:** React Icons (Fi - Feather)

### Infrastructure
- **Containerization:** Docker
- **Reverse Proxy:** Nginx
- **HTTPS:** Self-signed certificates (production: Let's Encrypt)

## 🎯 Features

### Authentication
- Phone number OTP verification
- Secure JWT sessions
- Rate limiting and abuse protection
- Session management

### Content Management
- Articles with categories and tags
- Videos with thumbnails
- MiniBooks (PDFs)
- SEO metadata for all content
- Content workflow (Draft → Review → Published → Archived)

### Tax System
- Tax topics and categories
- Tax rules with versioning
- Official source references
- Effective date tracking
- Tax rule workflow (Draft → Review → Approved → Published → Superseded)

### Tax Assistant
- Deterministic decision engine (no AI)
- Interactive question-answer flow
- Rule-based recommendations
- Source references for all results
- Session management

### Consultation Booking
- Service catalog
- Availability management
- Time slot booking
- OTP verification for bookings
- Booking management (confirm, cancel, reschedule)

### Admin Panel
- Dashboard with statistics
- User management
- Content management
- Tax rule management
- Booking management
- Audit logging
- Settings management

### SEO
- Automatic sitemap generation
- robots.txt
- Structured data (JSON-LD)
- Open Graph tags
- Canonical URLs
- Breadcrumb navigation

## 🔒 Security

- Input validation on all endpoints
- Rate limiting for OTP and API
- JWT authentication with secure cookies
- CSRF protection
- XSS protection
- SQL injection prevention (Prisma ORM)
- IDOR protection
- Audit logging for sensitive actions
- Secure headers

## ⚡ Performance

- Server-first rendering (Next.js)
- Minimal client-side JavaScript
- Optimized images
- Lazy loading for heavy content
- Redis caching for frequent queries
- Database indexing for critical queries

## 📱 Mobile-First Design

- Responsive design (Mobile → Tablet → Desktop)
- Touch-friendly UI
- Optimized for small screens
- Fast loading on mobile networks

## 🎨 Design System

### Colors
- **Primary:** Black (#000000)
- **Secondary:** Deep Dark (#1a1a1a)
- **Accent:** Gold (#ca8a04)
- **Text:** White (#ffffff)
- **Muted:** Gray (#9ca3af)

### Typography
- **Font Family:** Inter
- **Weights:** 400, 500, 600, 700, 800
- **Responsive sizing**

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP to phone
- `POST /api/auth/verify-otp` - Verify OTP code
- `POST /api/auth/login` - Login with phone and OTP
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/me` - Get profile
- `PATCH /api/users/me` - Update profile
- `GET /api/users/:id` - Get user by ID
- `GET /api/users` - List users (paginated)

### Content
- `GET /api/content/articles` - List articles
- `POST /api/content/articles` - Create article (Admin)
- `GET /api/content/articles/:slug` - Get article by slug
- `GET /api/content/articles/featured` - Get featured articles
- `GET /api/content/articles/:id/related` - Get related articles

### Tax
- `GET /api/tax/rules` - List tax rules
- `POST /api/tax/rules` - Create tax rule (Admin)
- `GET /api/tax/rules/:slug` - Get tax rule by slug
- `GET /api/tax/rules/:topicSlug/effective` - Get effective rule

### Tax Assistant
- `POST /api/tax-assistant/start` - Start session
- `POST /api/tax-assistant/answer` - Answer question

### Consultation
- `GET /api/consultation/services` - List services
- `GET /api/consultation/services/:slug` - Get service by slug
- `GET /api/consultation/services/:serviceId/availability` - Get availability
- `POST /api/consultation/bookings` - Create booking
- `GET /api/consultation/bookings/:id` - Get booking
- `GET /api/consultation/my-bookings` - Get user's bookings
- `POST /api/consultation/bookings/:id/cancel` - Cancel booking

### SEO
- `GET /api/seo/config/:path` - Get SEO config
- `GET /api/seo/sitemap` - Get sitemap XML
- `GET /api/seo/robots.txt` - Get robots.txt

### Admin
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/recent-activity` - Recent activity
- `GET /api/admin/users/admin` - List admin users
- `POST /api/admin/users/admin` - Create admin user (Super Admin)
- `POST /api/admin/users/admin/:id` - Update admin user (Super Admin)
- `GET /api/admin/audit-logs` - Get audit logs

### Audit
- `GET /api/audit/logs` - Get audit logs
- `GET /api/audit/tax-rules` - Get tax rule changes
- `GET /api/audit/content` - Get content changes

### Media
- `POST /api/media/upload` - Upload file
- `GET /api/media/:id` - Get media
- `DELETE /api/media/:id` - Delete media (Admin)
- `GET /api/media` - List media (Admin)

### Health
- `GET /api/health` - Health check
- `GET /api/health/db` - Database health check

## 📊 Database Schema

The database uses PostgreSQL with Prisma ORM. Key models include:

- **User** - User accounts with phone verification
- **Session** - Authentication sessions
- **OTP** - One-time passwords
- **Article** - Blog articles
- **Video** - Video content
- **MiniBook** - PDF guides
- **Category** - Content categories
- **Tag** - Content tags
- **TaxTopic** - Tax categories
- **TaxRule** - Tax rules
- **TaxRuleVersion** - Versioned tax rules
- **TaxSource** - Official tax sources
- **TaxQuestion** - Tax assistant questions
- **TaxQuestionOption** - Question options
- **TaxQuestionFlow** - Decision tree flows
- **TaxAssistantResult** - Tax assistant results
- **ConsultationService** - Booking services
- **ConsultationAvailability** - Service availability
- **ConsultationSlot** - Time slots
- **ConsultationBooking** - User bookings
- **SEOConfig** - SEO configurations
- **Redirect** - URL redirects
- **AdminAction** - Audit logs
- **AdminSetting** - Admin settings
- **Media** - Uploaded files

## 🧪 Testing

### Backend Tests
```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Frontend Tests
```bash
# Lint
npm run lint

# Type check
npm run type-check
```

## 🚀 Deployment

### Docker Production Build

1. Build images:
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml build
   ```

2. Start services:
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

### Manual Deployment

1. **Backend:**
   ```bash
   cd backend
   npm ci --only=production
   npm run build
   npm run prisma:generate
   node dist/main
   ```

2. **Frontend:**
   ```bash
   cd frontend
   npm ci --only=production
   npm run build
   npm start
   ```

## 📄 License

MIT License - Feel free to use this project as a template for your own applications.

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Follow the existing code style
2. Add tests for new features
3. Update documentation as needed
4. Keep commits atomic and well-described
5. Follow the architecture principles outlined in the spec

## 📞 Support

For questions or issues, please open a GitHub issue or contact the maintainers.

---

**Built with ❤️ for the financial services industry**
