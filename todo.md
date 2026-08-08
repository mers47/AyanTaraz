# Phase 6 — Production-Ready Enhancements

## Step 0 — Merge PR #7 to main
- [x] S0: Squash merge PR #7 (rebase merge — done, 14 commits on main)
- [x] S0b: Pull latest main, create new branch feat/phase6-production-enhancements

## Step 1 — Dynamic SEO (sitemap, robots, generateMetadata)
- [x] S1: Create `frontend/src/app/sitemap.ts` — dynamic sitemap from public content API
- [x] S2: Create `frontend/src/app/robots.ts` — dynamic robots.txt + sitemap link
- [x] S3: Create `frontend/src/app/articles/[slug]/page.tsx` — generateMetadata + article detail page
- [x] S4: Create `frontend/src/app/videos/[slug]/page.tsx` — generateMetadata + video detail page
- [x] S5: Create `frontend/src/app/minibooks/[slug]/page.tsx` — generateMetadata + minibook detail page
- [x] S6: Update article/video/minibook listing pages to link to [slug] routes
- [x] S7: Commit SEO batch, push (1d22afd) — frontend build verified locally

## Step 2 — Rate Limiting on OTP endpoints
- [x] R1: Install @nestjs/throttler v6.5, add ThrottlerModule (3 named throttlers) to app.module
- [x] R2: Add @Throttle to send-otp (3/min) and login (10/min), global ThrottlerGuard as APP_GUARD
- [x] R3: Commit rate limiting (cee58fd), push — backend build + tests pass locally

## Step 3 — Search UI on public content pages
- [ ] Q1: Add search input to articles page (connect to existing search API)
- [ ] Q2: Add search input to videos page
- [ ] Q3: Commit search UI, push, verify CI

## Step 4 — Stats dashboard in admin panel
- [ ] D1: Add stats endpoint to admin controller/service
- [ ] D2: Add stats tab to admin/page.tsx
- [ ] D3: Commit stats dashboard, push, verify CI

## Final
- [ ] F1: Create PR for all Phase 6 work, verify CI green
- [ ] F2: Summarize all deliverables
