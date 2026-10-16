# 🗺️ Master Product Roadmap & Implementation Plan

> **Project:** The College Life We Didn't Have  
> **Framework:** Phased Architecture Specification (Derived from Master Blueprint / Prompt 1)  
> **Current Milestone:** Phase 1 & Phase 2 Completed ✅ | Ready for Phase 3: Authentication & Story Lifecycle Management  

---

## 🧭 The Non-Negotiable Workflow

As established in the original project specification:
1. Work is executed **one phase at a time** in strict chronological sequence.
2. No skipping phases or merging phases without explicit user approval.
3. Each phase concludes with a **Phase Completion Report** covering:
   - Specific features implemented
   - Important files changed
   - Verification tests and builds actually executed
   - Known issues and limitations
   - Preview instructions
   - Next phase proposal
4. Work stops at each phase boundary until explicit user sign-off is granted.

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 MASTER IMPLEMENTATION ROADMAP                                   │
├───────────────┬───────────────┬───────────────┬───────────────┬────────────────┬────────────────┤
│    PHASE 1    │    PHASE 2    │    PHASE 3    │    PHASE 4    │    PHASE 5     │    PHASE 6     │
│ Finalize UI & │   Backend &   │ Auth & Story  │  Reactions &  │  Reporting &   │  Security, CI  │
│  Design System│   Database    │  Management   │   Discovery   │   Moderation   │  & Containers  │
│  (Angular 21) │(Spring Boot 3)│ (JWT + Spring)│(Search & Rate)│ (Admin Queue)  │(Docker Compose)│
└───────────────┴───────────────┴───────────────┴───────────────┴────────────────┴────────────────┘
```

---

## 📌 Phase 0 — Inspect, Plan, and Generate Main Layout
**Status: COMPLETED (100%)** ✅

### Objectives Achieved:
- [x] Inspected workspace and established Angular 21 with Standalone Components and Signals.
- [x] Defined product vision, 3 emotional pillars (*The Life I Actually Lived*, *The Life I Imagined*, *Things I Never Said*), and campus category taxonomy.
- [x] Built the editorial design system (ivory background `#FAF8F5`, warm charcoal `#1E2022`, serif headlines, and responsive typography).
- [x] Generated the complete visual shell with representative development stories for all 11 planned routes:
  - `/` (Home feed with responsive layout and emotional reactions)
  - `/explore` (Explore feed with search input and live filtering)
  - `/stories/:id` (Editorial reader with content warnings and report modal)
  - `/share` (Full-page writer with interactive tag chips and live preview)
  - `/categories/:slug` (Category archive)
  - `/login` & `/register` (Email-only authentication forms)
  - `/profile` (User avatar view, upload, and remove modal)
  - `/my-stories` (Author contributions workspace)
  - `/saved` (Instagram-style two-tap collections with custom folders and icons)
  - `/guidelines` & `/privacy` (Community code and privacy charter)
  - `/admin/moderation` (Moderation review workbench shell)
- [x] Added floating Quick Confession Modal (`CreateModalComponent`) with interactive tag chips.
- [x] Verified zero text mangling during story authoring.

---

## 📌 Phase 1 — Finalize the Design System & Frontend Interactions
**Status: COMPLETED (100%)** ✅

### Objective:
Refine the approved visual design, interactive states, accessible interactions, and ensure a seamless experience across mobile, tablet, and desktop before backend integration begins.

### Roadmap Items:
- [x] Shared navigation with expanding hover dock on desktop and mobile bottom bar.
- [x] Full-page writer and floating modal with dedicated tag chips (<kbd>Enter</kbd> / `,` to create, backspace / `✕` to delete).
- [x] Instagram-style two-tap saved modal and collection creation/customization.
- [x] Email authentication screens and profile avatar management.
- [x] **Clickable Hashtag Discovery**:
  - Connected tag chips on `StoryCardComponent` and `StoryDetailComponent` so clicking `#tag` automatically filters `/explore?tag=...`.
- [x] **Explore Trending Tag Rail**:
  - Horizontal scrolling pill rail for top campus tags (`#HostelMischief`, `#Proxy`, `#LateNightChai`, `#PlacementStress`, `#Convocation`, `#Adulthood`, `#CollegeHumor`, `#Nostalgia`) with interactive toggling and active filter chips.
- [x] **Aesthetic Quote Card Export**:
  - Reusable `QuoteCardModalComponent` rendering high-resolution 1080x1920 (9:16) portrait quote cards via HTML5 Canvas with ornamental borders, warm paper texture, and direct PNG download and Web Share API.
- [x] **Accessibility (a11y) & Interaction Hardening**:
  - Global `:focus-visible` accessible focus rings, screen reader ARIA labels, and keyboard dismissals.
- [x] **Verification**:
  - Zero compilation errors (`npm run build` succeeds cleanly in < 5s).
  - Clean cross-device responsive layout.

**Exit Gate:** All Phase 1 deliverables completed and verified. Ready for Phase 2 (Spring Boot 3 + PostgreSQL backend).

---

## 📌 Phase 2 — Backend Architecture & Database Integration
**Status: COMPLETED (100%)** ✅

### Objective:
Build the persistent server foundation using Java Spring Boot and PostgreSQL, establishing migrations, data models, repositories, and REST APIs.

### Technology Stack:
- **Runtime:** Java 20 / Spring Boot 3.2.5
- **Database:** PostgreSQL (production profile) & file-backed H2 (`data/collegelife_db`)
- **ORM / Data Access:** Spring Data JPA / Hibernate
- **Architecture:** Layered Controller-Service-Repository architecture with strict DTO validation

### Roadmap Items:
- [x] **Backend Project Initialization**:
  - Scaffold Spring Boot 3 application in `/backend` with Maven.
  - Configure `application-dev.yml` (file-backed H2 `./data/collegelife_db`) and `application-prod.yml` (PostgreSQL with env variables).
- [x] **Database Schema & Migrations (`V1__init.sql`)**:
  - `users`: `id` (UUID), `email` (unique), `password_hash`, `public_pseudonym`, `avatar_url`, `role`, `created_at`.
  - `stories`: `id` (UUID), `author_id` (foreign key), `title`, `content`, `excerpt`, `pillar`, `category_slug`, `pseudonym`, `content_warning`, `tags` (array/collection), `status`, `reading_time`, `created_at`.
  - `reactions`: `id`, `story_id`, `user_id`, `reaction_type` (Enum), `created_at`. Unique on `(story_id, user_id, reaction_type)`.
  - `collections`: `id`, `user_id`, `name`, `icon_emoji`, `created_at`.
  - `collection_stories`: `collection_id`, `story_id`, `added_at`.
  - `reports`: `id`, `story_id`, `reporter_id`, `reason`, `details`, `status`, `created_at`.
  - `moderation_actions`: `id`, `report_id`, `moderator_id`, `action_type`, `notes`, `created_at`.
- [x] **JPA Entities & Spring Data Repositories**:
  - Mapped entity relationships, indexes, and custom pagination & aggregation queries.
  - Dynamic tag frequencies query powering the trending campus tags rail.
- [x] **Service Layer & REST Controllers**:
  - `StoryController`: `GET /api/stories`, `GET /api/stories/{id}`, `POST /api/stories`, `GET /api/stories/trending-tags`, `GET /api/stories/stats`.
  - `ReactionController`: `GET /api/stories/{id}/reactions`, `POST /api/stories/{id}/reactions`.
  - `CollectionController`: `GET /api/collections`, `POST /api/collections`, `POST /api/collections/{id}/stories/{storyId}`, `DELETE /api/collections/{id}/stories/{storyId}`.
  - `ReportController`: `POST /api/stories/{id}/reports`.
  - DTOs with `@Valid`, `@NotBlank`, `@Size` validation annotations.
  - RFC 7807 Global Exception Handling (`@ControllerAdvice`).
- [x] **Frontend Integration**:
  - Connected Angular `StoryService` HTTP client to live Spring Boot endpoints with optimistic updates and fallback resilience.

**Exit Gate:** Real stories persist in persistent database; frontend reads and displays real backend data. Clean builds on both backend and frontend.

---

## 📌 Phase 3 — Authentication & Story Lifecycle Management
**Status: PENDING (0%)** ⏳

### Objective:
Implement secure authentication, pseudonym protection, server-side story lifecycle controls, and automated content ingestion.

### Roadmap Items:
- [ ] **Authentication Engine**:
  - Spring Security with BCrypt password hashing.
  - JWT token generation or secure HTTP-only cookies.
  - Endpoints: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`.
- [ ] **Pseudonym Isolation & Privacy Enforcement**:
  - Enforce server-side separation: Public endpoints must **never** expose user emails, legal names, or internal IDs.
  - Backend pen-name generator to ensure consistent, campus-authentic pseudonyms.
- [ ] **Story Lifecycle & Ownership**:
  - Story creation with automatic author linking.
  - Story editing and deletion restricted strictly to author or admin (`@PreAuthorize`).
  - Draft and rejected stories completely hidden from public queries.
- [ ] **Automated ML Ingestion / Moderation (As Specified)**:
  - Replace manual "pending review" queues with automated ML evaluation.
  - Automated toxicity & abuse classifier (auto-rejects harassment).
  - Anti-Doxxing filter: regex and NLP detection blocking phone numbers, roll numbers, hostel room numbers, and real names.
  - Automated classification for the 3 emotional pillars.

**Exit Gate:** User registers, logs in, drafts a story, sees it automatically approved/published or rejected, and can edit/delete their own story.

---

## 📌 Phase 4 — Reactions & Discovery Engine
**Status: PENDING (0%)** ⏳

### Objective:
Implement persistent reactions, full-text search, multi-criteria filtering, and performance rate limiting.

### Roadmap Items:
- [ ] **Reaction Engine**:
  - Endpoints: `POST /api/stories/{id}/reactions`, `DELETE /api/stories/{id}/reactions`.
  - Atomic counter updates with duplicate reaction prevention (one reaction per user per story).
  - Reaction aggregation returned in story DTOs.
- [ ] **Search & Multi-Criteria Filtering**:
  - Backend full-text search across story titles, narratives, and tags (`GET /api/stories?search=...`).
  - Filter by emotional pillar (`pillar=lived`) and category slug.
  - Sort by:
    - **Latest**: `createdAt DESC`.
    - **Popular**: Weighted score calculated from reactions (`relatable*2 + feltThis*2 + support + laugh`).
- [ ] **Pagination & Performance**:
  - Keyset / Cursor pagination for infinite feed scrolling.
- [ ] **Rate Limiting**:
  - Enforce rate limits on story posting, reaction toggling, and reporting (Bucket4j / Redis token bucket) to protect against bots and spam.

**Exit Gate:** Reaction counts remain perfectly synchronized and persistent across reloads; full-text search and sorting return fast, accurate results.

---

## 📌 Phase 5 — Reporting & Moderation Workbench
**Status: PENDING (0%)** ⏳

### Objective:
Implement community safety reporting and a secure administrative moderation workbench.

### Roadmap Items:
- [ ] **Reporting Workflow**:
  - Endpoint: `POST /api/stories/{id}/reports`.
  - Reasons: Harassment, Real Personal Info / Doxxing, Hate Speech, Spam, Other.
- [ ] **Restricted Admin Authentication**:
  - Strict role-based security (`hasRole('ADMIN')`) guarding `/api/admin/**`.
- [ ] **Moderator Workbench Backend**:
  - Reports queue API (`GET /api/admin/reports?status=pending`).
  - Resolution actions (`POST /api/admin/reports/{id}/resolve`):
    - Dismiss report
    - Hide story from public feed
    - Permanently delete story
    - Suspend author account
- [ ] **Audit Logging**:
  - Record every moderation action, moderator ID, reason, and timestamp in `moderation_actions` table.

**Exit Gate:** Flagged stories appear in the restricted admin queue; resolving a report immediately updates the story's public visibility and logs an audit record.

---

## 📌 Phase 6 — Security, Testing, and Deployment Readiness
**Status: PENDING (0%)** ⏳

### Objective:
Perform rigorous security auditing, automated testing, containerization, and prepare production deployment pipelines.

### Roadmap Items:
- [ ] **Security Hardening**:
  - XSS defense: Sanitize narrative content with OWASP Java HTML Sanitizer / DOMPurify.
  - CSRF protection for cookie-based authentication.
  - Parameterized queries to prevent SQL injection.
  - IDOR security testing across all edit, delete, and bookmark endpoints.
  - Audit logging for sensitive operations.
- [ ] **Automated Test Suites**:
  - **Frontend:** Vitest unit tests for Angular services, signals state, and routing (`npm test`).
  - **Backend:** JUnit 5 + Mockito unit tests for service layer business logic.
  - **Integration:** `@SpringBootTest` + Testcontainers with a real PostgreSQL container.
- [ ] **Containerization & Infrastructure**:
  - Multi-stage `Dockerfile` for Angular frontend (Nginx production build).
  - Multi-stage `Dockerfile` for Spring Boot backend (Eclipse Temurin JRE).
  - Root `docker-compose.yml` orchestrating `frontend` (:80), `backend` (:8080), and `postgres` (:5432).
- [ ] **CI/CD Automation**:
  - GitHub Actions workflow (`.github/workflows/ci.yml`) running builds, lints, and test suites on pull requests.
- [ ] **Production Deployment Documentation**:
  - Environment variable checklist, production deployment runbook, and verification guide.

**Exit Gate:** `docker compose up --build` launches the full multi-tier platform locally with all tests passing.

---

## 📱 Mobile App Delivery (PWA & Native Distribution)

*Aligned with user requirement for a seamless phone application:*
- [ ] **PWA Manifest & Service Worker**: `manifest.webmanifest`, splash screens, responsive icons (192px, 512px, maskable), and offline reading cache.
- [ ] **Install Prompt**: In-app "Install to Home Screen" banner on Android and iOS.
- [ ] **Capacitor Mobile Build**: (Optional) Package as native Android `.apk` / `.aab` for Google Play Store release.

---

## 🚦 Current Phase Sign-Off & Next Steps

```
[Phase 0: Layout & Shell] ──────> [Phase 1: UI Polish] ──────> [Phase 2: Spring Boot & DB]
       COMPLETED                       CURRENT                        UPCOMING
```

### Immediate Options:
1. **Option 1 (Complete Phase 1 Polish)**: Connect clickable `#tag` chips directly to `/explore?tag=...` navigation and add the 9:16 quote card generator.
2. **Option 2 (Proceed to Phase 2)**: Grant sign-off on Phase 1 and begin scaffolding the **Spring Boot 3 + PostgreSQL backend**.
