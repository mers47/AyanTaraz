# Phase 6 — Production-Ready Enhancements

## Step 0 — Merge PR #7 to main
- [x] S0: Squash merge PR #7 (rebase merge — done, 14 commits on main)
- [x] S0b: Pull latest main, create new branch feat/phase6-production-enhancements

## Step 1 — Dynamic SEO (sitemap, robots, generateMetadata)
- [ ] S1: Create `frontend/src/app/sitemap.ts` — dynamic sitemap from public content API
- [ ] S2: Create `frontend/src/app/robots.ts` — dynamic robots.txt + sitemap link
- [ ] S3: Create `frontend/src/app/articles/[slug]/page.tsx` — generateMetadata + article detail page
- [ ] S4: Create `frontend/src/app/videos/[slug]/page.tsx` — generateMetadata + video detail page
- [ ] S5: Create `frontend/src/app/minibooks/[slug]/page.tsx` — generateMetadata + minibook detail page
- [ ] S6: Update article/video/minibook listing pages to link to [slug] routes
- [ ] S7: Commit SEO batch, push, verify CI

## Step 2 — Rate Limiting on OTP endpoints
- [ ] R1: Install @nestjs/throttler, add ThrottlerModule to app.module
- [ ] R2: Add ThrottlerGuard to send-otp and login endpoints
- [ ] R3: Commit rate limiting, push, verify CI

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
