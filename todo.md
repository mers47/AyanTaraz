# Phase 5: Admin Panel Content Management & Frontend Features

## Branch: feat/admin-panel-content-management

## Tasks (Group A — Admin Panel, in order):

### A1: Chatbot Q&A Management (tab + backend CRUD)
- [x] Backend: admin endpoints for TaxQuestion, TaxQuestionOption, TaxQuestionFlow, TaxAssistantResult CRUD
- [x] Frontend: admin page new tab for chatbot management
- [x] Commit

### A2: Articles Management (tab + backend CRUD)
- [x] Backend: article CRUD endpoints (list, create, update, delete)
- [x] Frontend: admin page new tab for article management
- [x] Commit

### A3: Videos Management (tab + backend CRUD)
- [x] Backend: video CRUD endpoints
- [x] Frontend: admin page new tab for video management
- [x] Commit

### A4: MiniBooks Management (tab + backend CRUD)
- [x] Backend: minibook CRUD endpoints
- [x] Frontend: admin page new tab for minibook management
- [x] Commit

### A5: Consultation Services Management (tab + backend CRUD)
- [x] Backend: consultation service CRUD endpoints (edit price/description)
- [x] Frontend: admin page new tab for consultation service management
- [x] Commit

## Group B (Frontend public) — in order, commit each:

### B1: Public content endpoints (backend) + public API methods (frontend)
- [x] Backend: add public GET endpoints for published articles/videos/minibooks to existing content module
- [x] Frontend: add publicApi methods to api.ts
- [x] Commit (96dcf03)

### B2: Connect articles page to API
- [ ] Frontend: replace hardcoded static data in articles/page.tsx with API fetch
- [ ] Commit

### B3: Connect videos page to API + video player component
- [ ] Frontend: add video player component (HTML5 video with brand styling)
- [ ] Frontend: replace static data in videos/page.tsx with API fetch + player
- [ ] Commit

### B4: Connect minibooks page to API
- [ ] Frontend: replace hardcoded static data in minibooks/page.tsx with API fetch
- [ ] Commit

### B5: Login UI (SMS OTP modal/form)
- [ ] Frontend: create login modal with phone to OTP flow using existing authApi
- [ ] Commit

### B6: SMS .env production guide
- [ ] Documentation: create SMS setup guide for production (env vars, provider config)
- [ ] Commit

## Rules:
- Do NOT change architecture (no new modules if existing ones can hold the code)
- Add endpoints in existing admin controller or existing module controllers
- Keep it simple, no over-engineering
