# 📋 Remaining Deliverables & Phased Implementation Spec

> **Project:** The College Life We Didn't Have  
> **Reference:** Original Project Blueprint & Phased Architecture Specification (Prompt 1)  
> **Current Status:** Phase 0 (Visual Shell, Layouts & Interactive Prototyping) Completed ✅  

---

## 🎯 High-Level Status Across Approved Phases

| Phase | Description | Architecture / Tech | Status |
|:---|:---|:---|:---:|
| **Phase 0** | **Inspect, Plan & Generate Main Layout** | Angular 21, Signals, Responsive CSS | **COMPLETED (100%)** |
| **Phase 1** | **Finalize Design System & Frontend Interactions** | Clickable tags, explore filters, quote cards | **COMPLETED (100%)** |
| **Phase 2** | **Backend & Database Architecture** | Java Spring Boot 3, PostgreSQL, Flyway, JPA | **COMPLETED (100%)** |
| **Phase 3** | **Authentication & Story Management** | Spring Security, JWT, ML Auto-Moderation | **REMAINING (0%)** |
| **Phase 4** | **Reactions & Discovery Engine** | Reaction persistence, full-text search, sort | **REMAINING (0%)** |
| **Phase 5** | **Reporting & Moderation Workbench** | Admin queue, audit logs, safety reports | **REMAINING (0%)** |
| **Phase 6** | **Security, Testing & Containerization** | Docker Compose, Vitest/JUnit tests, CI/CD | **REMAINING (0%)** |

---

## 🔍 Detailed Breakdown of Remaining Work by Phase

---

### 🎨 Phase 1 — Finalize Design System & Frontend Interactions
*Focus: Complete client-side interaction refinement before backend integration.*

#### ✅ Completed in Phase 1:
- [x] Complete editorial visual identity (warm paper aesthetic, serif headlines, ivory canvas).
- [x] Persistent responsive navigation sidebar with smooth hover expansion.
- [x] Three emotional pillars (`lived`, `imagined`, `unsaid`) and category taxonomy.
- [x] Dedicated interactive Tag Chip Input (<kbd>Enter</kbd> / comma chip generation, backspace removal).
- [x] Two-tap Instagram-style saved collections modal & collection customization (name/icon).
- [x] Full-page writer (`/share`) and floating confession modal (`CreateModalComponent`).
- [x] User profile with email authentication forms, avatar photo view/remove modal.
- [x] Removed obsolete academic batch fields and manual pending moderation review blockers.
- [x] **Clickable Hashtag Navigation**: Connected `#tag` chips on `StoryCardComponent` and `StoryDetailComponent` to filter the `/explore` feed automatically via URL query parameter `/explore?tag=...`.
- [x] **Explore Trending Tag Rail**: Dynamic tag rail in Explore bound to frequency signals.
- [x] **Direct Link Sharing**: Replaced canvas cards with native mobile Web Share and clipboard link copy.
- [x] **Frontend Accessibility & Interaction Polish**: Added global accessible `:focus-visible` focus rings, ARIA labels, and keyboard accessibility.

---

### ⚙️ Phase 2 — Backend & Database Architecture
*Focus: Build the persistent server foundation using Spring Boot and PostgreSQL as specified in the original blueprint.*

#### ✅ Completed in Phase 2:
- [x] **Spring Boot 3 Project Setup**:
  - Initialized Java 20 / Spring Boot 3.2.5 backend application in `/backend` with Maven.
  - Multi-profile configuration (`application-dev.yml` with file-backed H2 at `./data/collegelife_db` and `application-prod.yml` with PostgreSQL via environment variables).
  - CORS configuration enabling `http://localhost:4200` with credential support.
- [x] **Relational Database Schema & Migrations (`V1__init.sql`)**:
  - `users`, `stories`, `reactions`, `collections`, `collection_stories`, `reports`, `moderation_actions` with indexes and foreign keys.
- [x] **JPA Entities & Spring Data Repositories**:
  - Entities: `User`, `Story`, `Pillar`, `Reaction`, `ReactionType`, `Collection`, `Report`, `ModerationAction`.
  - Repositories: `StoryRepository`, `ReactionRepository`, `CollectionRepository`, `ReportRepository`, `UserRepository`.
  - Custom JPQL queries for filtered stories, category queries, and dynamic tag frequency aggregation (`findTagFrequencies`).
- [x] **REST API Layer & RFC 7807 Exception Handling**:
  - `StoryController` (`GET /api/stories`, `GET /api/stories/{id}`, `POST /api/stories`, `GET /api/stories/trending-tags`, `GET /api/stories/stats`).
  - `ReactionController` (`GET /api/stories/{id}/reactions`, `POST /api/stories/{id}/reactions` with toggle behavior).
  - `CollectionController` (`GET /api/collections`, `POST /api/collections`, `POST /api/collections/{id}/stories/{storyId}`, `DELETE /api/collections/{id}/stories/{storyId}`).
  - `ReportController` (`POST /api/stories/{id}/reports`).
  - RFC 7807 `@ControllerAdvice` global exception handling returning structured `ProblemDetail` errors.
- [x] **Frontend Integration & Live Data Flow**:
  - Angular `StoryService` wired to backend REST API via `provideHttpClient()`.
  - Optimistic UI updates with resilient fallback handling.
- [x] **Zero-Error Verification**:
  - Maven build passing cleanly: `the-college-life-backend-1.0.0-SNAPSHOT.jar` generated.
  - Angular production build passing cleanly (`npm run build`).

---


### 🔐 Phase 3 — Authentication & Story Lifecycle Management
*Focus: Secure user identity, pseudonym isolation, server-side story management, and automated ML ingestion.*

#### ⏳ Remaining Tasks:
- [ ] **Authentication Engine**:
  - Spring Security integration with JWT (or secure HTTP-only cookies).
  - Password hashing with BCrypt.
  - Endpoints: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`.
- [ ] **Privacy & Pseudonym Isolation (Requirement 5 & 9)**:
  - Enforce server-side separation: Public endpoints must **never** return user email addresses, real IDs, or private data.
  - Backend pen-name generator ensuring pseudonyms remain unique and consistent for authors.
- [ ] **Story Lifecycle & Ownership Controls**:
  - Story creation endpoint with server-side validation.
  - Story editing and deletion restricted exclusively to the original author (or admin).
  - Draft/rejected story isolation: Unapproved content must never be accessible via public queries.
- [ ] **Automated ML Moderation / Ingestion (As Specified)**:
  - Automated screening on story submission before publishing.
  - Automated Toxicity & Hate Speech filter (auto-rejects abusive content).
  - Automated Anti-Doxxing filter: regex and NLP detection for phone numbers, roll numbers, hostel room numbers, or real full names.
  - Automatic pillar classification (*The Life I Actually Lived*, *The Life I Imagined*, *Things I Never Said*).

---

### 🔍 Phase 4 — Reactions & Discovery Engine
*Focus: Scalable engagement, full-text search, and multi-criteria exploration.*

#### ⏳ Remaining Tasks:
- [ ] **Reaction Engine**:
  - Endpoints: `POST /api/stories/{id}/reactions`, `DELETE /api/stories/{id}/reactions`.
  - Atomic counter updates and duplicate reaction prevention (one reaction per user per story, or togglable reactions).
  - Reaction summary aggregations on story fetch.
- [ ] **Discovery & Full-Text Search**:
  - Full-text search endpoint querying story titles, narratives, and tags (`GET /api/stories?search=...`).
  - Filter by emotional pillar (`pillar=lived`) and category slug.
  - Sorting strategies:
    - **Latest**: Ordered by `createdAt DESC`.
    - **Popular**: Weighted score calculated from total reactions (`relatable * 2 + feltThis * 2 + support + laugh`).
- [ ] **Pagination & Performance**:
  - Keyset / Cursor or Pageable pagination (`page`, `size`) with total element counts.
- [ ] **Rate Limiting (Requirement 9)**:
  - Rate limiting on story creation, reactions, and reports (Bucket4j / Redis token bucket) to prevent spam.

---

### 🛡️ Phase 5 — Reporting & Moderation Workbench
*Focus: Community trust & safety, report lifecycle, and admin oversight.*

#### ⏳ Remaining Tasks:
- [ ] **Community Reporting API**:
  - Endpoint: `POST /api/stories/{id}/reports`.
  - Validated report reasons: Harassment, Real Personal Information / Doxxing, Hate Speech, Spam, Other.
- [ ] **Restricted Admin Authentication**:
  - Role-based authorization (`@PreAuthorize("hasRole('ADMIN')")`).
  - Backend enforcement: `/api/admin/**` protected against non-admin tokens.
- [ ] **Moderation Queue & Resolution Workflow**:
  - `GET /api/admin/reports` with queue filtering (`pending`, `reviewed`, `dismissed`).
  - `POST /api/admin/reports/{id}/resolve` (Actions: Dismiss report, Hide story, Permanently delete story, Suspend author).
- [ ] **Audit Trail**:
  - Record every moderator action into `ModerationAction` table with timestamp and moderator ID.

---

### 🚀 Phase 6 — Security, Testing & Deployment Readiness
*Focus: Hardening, comprehensive test suites, Docker containers, and CI/CD pipelines.*

#### ⏳ Remaining Tasks:
- [ ] **Security Auditing & Hardening (Requirement 9)**:
  - Sanitize all markdown / rich content against XSS (OWASP Java HTML Sanitizer / DOMPurify).
  - CSRF protection for cookie-based sessions.
  - SQL injection prevention (parameterized JPA queries).
  - IDOR security tests ensuring users cannot delete or edit other users' stories or collections.
- [ ] **Automated Testing Suite**:
  - **Frontend**: Unit tests for Angular services, components, and signal state using Vitest / Karma (`npm test`).
  - **Backend**: JUnit 5 + Mockito unit tests for service layer.
  - **Integration**: Spring Boot `@SpringBootTest` + Testcontainers with real PostgreSQL instance.
- [ ] **Containerization**:
  - `Dockerfile` for Angular frontend (multi-stage build with Nginx).
  - `Dockerfile` for Spring Boot backend (multi-stage build with Eclipse Temurin JDK/JRE).
  - `docker-compose.yml` linking:
    - `frontend` (port 80)
    - `backend` (port 8080)
    - `postgres` (port 5432)
- [ ] **CI/CD Automation**:
  - GitHub Actions workflow (`.github/workflows/ci.yml`) to automatically lint, build, and test frontend and backend on pull requests and pushes.

---

## 📱 Additional Mobile Delivery (From User Request)

- [ ] **PWA / Installable Phone App**:
  - Web App Manifest (`manifest.webmanifest`) with icons (192px, 512px).
  - Offline asset caching via Service Worker.
  - Native "Install App" prompt on mobile devices.
  - (Optional) Capacitor mobile build for Google Play Store packaging.

---

## 📌 Next Action Plan (How to Proceed)

1. **Option A (Complete Phase 1 Polish)**:
   - Connect clickable `#tag` chips directly to `/explore?tag=...` navigation and add the 9:16 quote card generator.
2. **Option B (Initialize Phase 2 Backend)**:
   - Scaffold the Spring Boot 3 + PostgreSQL backend in a `/backend` directory, define the JPA entities, and start building the REST API.
