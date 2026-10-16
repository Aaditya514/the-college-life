# 🎓 The College Life We Didn't Have

> *An anonymous, emotionally resonant storytelling platform for confessions, unsaid words, and the bittersweet reality of campus life.*

---

## 📌 Phase 0 — Core Architecture & Feature Milestones

**Phase 0** establishes the foundational platform experience, responsive design, anonymous storytelling pipeline, editorial aesthetics, and Instagram-style collection curation.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PHASE 0 ARCHITECTURE                            │
├───────────────────┬────────────────────────────┬───────────────────────┤
│  AUTH & IDENTITY  │     STORY ARCHIVE          │     CURATION & TAGS   │
│  • Email-only     │  • 3 Emotional Pillars     │  • Tag Chip Input     │
│  • Pseudonym Gen  │  • Automated Ingestion ML  │  • Instagram Saves    │
│  • Avatar Modal   │  • Content Warnings        │  • Custom Collections │
└───────────────────┴────────────────────────────┴───────────────────────┘
```

---

## 🚀 Key Features Implemented in Phase 0

### 1. ✍️ Story Authoring & Interactive Tag Input
- **Dual Writing Surfaces**:
  - Full-page longform writer at `/share` with live reader preview.
  - Quick popup modal (`Spill it out`) accessible from any page.
- **Interactive Tag Chip System**:
  - Dedicated tag entry below narrative canvas.
  - Type tag keyword and press <kbd>Enter</kbd> or <kbd>,</kbd> to generate hashtag chips (e.g., `#hostel_chai`, `#placement_stress`).
  - Supports up to 5 tags with quick `✕` chip removal and backspace deletion.
  - Automatic commit of pending tag text upon clicking **"Post Anonymously"**.
  - **Zero Content Mangling**: Narrative text remains 100% clean and intact without regex stripping or garbling.
- **Pseudonym Generator**:
  - Generates campus-native pen names with a single dice roll (e.g. `@terrace_poet_29`, `@chai_tapri_rebel`, `@convocation_dreamer_15`).
- **Trigger Warnings**:
  - Optional inline content notices for sensitive themes (burnout, mental health, placement anxiety).

### 2. 🏛️ Three Emotional Pillars & Taxonomy
Stories are structured into three poignant categories reflecting the universal student condition:
1. **The Life I Actually Lived**:
   - The chaotic reality: hostel midnight chai, proxy attendance, bunked lectures, mess food banter, and exam panic.
2. **The Life I Imagined**:
   - The expectations vs. reality: pristine dreams of college versus the sudden chill of convocation and stepping into adulthood.
3. **Things I Never Said**:
   - The unspoken: LT-2 crushes, unreturned library glances, apologies to drifting friends, and unsent goodbyes.

### 3. 🔖 Instagram-Style Collections & Bookmarking
- **Two-Tap Saving Flow**:
  - Clicking **Save** displays a sleek modal to pick an existing collection or create a new one.
  - Clicking outside automatically saves directly into the master **"All Saved"** collection without interrupting reading.
- **Collection Management**:
  - `+ New Collection` button integrated into header for clean spacing.
  - Collection personalization: edit collection names and assign custom icons directly in the collection view.
  - Modal-based un-save confirmation retaining stories in the general saved archive.

### 4. 👤 Authentication & Profiles
- **Streamlined Email Auth**:
  - Simplified registration and login exclusively with email (no unnecessary phone number verification).
  - Clean authentication pages with validation and responsive card layouts.
- **Profile & Account Separation**:
  - Distinct `/profile` route for account settings, email, and pen-name management.
  - Distinct `/my-stories` route for author-specific story management and deletion.
  - Ergonomic layout: Moved **Logout** away from "Write Story" to prevent accidental clicks.
- **Avatar Management**:
  - Full-screen photo view modal.
  - Image upload and removal support.
  - Removed outdated academic "Batch" fields across profile and story cards.

### 5. 🛡️ Automated Content Ingestion & Moderation
- **Streamlined Publication**:
  - Removed legacy "pending review" queues and manual moderation holding blocks.
  - Prepared for ML-based automated classification and sentiment analysis on ingestion.
- **Community Safety**:
  - In-app reporting modal allowing readers to flag inappropriate content with categorization (harassment, hate speech, spam, real personal info).

### 6. 📱 Mobile-First Responsive Design
- Crafted with modern editorial aesthetics:
  - Custom typography (warm serif headings paired with clean sans body).
  - Glassmorphic backdrops and micro-animations.
  - Responsive layouts tailored for mobile phones, tablets, and desktops.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Angular 21 (Standalone Components, Signals API) |
| **State Management** | Angular Signals (`signal`, `computed`, `update`) |
| **Styling** | Vanilla CSS Design System with CSS variables |
| **Routing** | Angular Router (`app.routes.ts`) |
| **Tooling** | Vite / Angular CLI build pipeline |

---

## 📂 Project Structure

```
THE COLLEGE LIFE WE DIDN'T HAVE/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── create-modal/     # Floating story creation modal
│   │   │   │   ├── header/           # Navigation header
│   │   │   │   ├── report-modal/     # Community safety reporting
│   │   │   │   ├── save-modal/       # Instagram-style collections modal
│   │   │   │   └── sidebar/          # Responsive navigation sidebar
│   │   │   ├── models/
│   │   │   │   └── story.model.ts    # TypeScript interfaces & types
│   │   │   ├── pages/
│   │   │   │   ├── auth/             # Login & Register views
│   │   │   │   ├── collection-detail/# Specific saved collection view
│   │   │   │   ├── home/             # Story feed & pillar tabs
│   │   │   │   ├── my-stories/       # Author's published submissions
│   │   │   │   ├── profile/          # User profile & avatar management
│   │   │   │   ├── saved/            # Collections overview
│   │   │   │   ├── share/            # Full-page story drafting canvas
│   │   │   │   └── story-detail/     # Single story reading experience
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts   # User authentication & session state
│   │   │   │   └── story.service.ts  # Story state, collections & reactions
│   │   │   ├── app.routes.ts         # Application routing configuration
│   │   │   └── app.component.ts      # Root shell
│   │   ├── styles.css                # Global design system & typography tokens
│   │   └── index.html                # App entrypoint
│   ├── package.json
│   └── angular.json
└── README.md                         # Phase 0 Documentation
```

---

## 🏃 Getting Started Locally

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation & Run

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch development server:
   ```bash
   npm start
   ```

4. Open in browser:
   ```
   http://localhost:4200/
   ```

---

## 🔮 Remaining Implementation & Deliverables

For the exhaustive specification aligned with the original blueprint prompt across all remaining engineering phases, see:
- 📑 **[REMAINING.md](./REMAINING.md)** — Comprehensive breakdown of remaining tasks, JPA entities, APIs, ML ingestion, security controls, and tests (Phases 1 through 6).
- 🗺️ **[ROADMAP.md](./ROADMAP.md)** — High-level milestone checklist and timeline.

### Summary of Remaining Phases:
- **Phase 1 (In Progress)**: Clickable hashtag discovery, URL query routing, trending tag rail, and social quote card export.
- **Phase 2 (Remaining)**: Spring Boot 3 REST API, PostgreSQL database, Flyway migrations, and JPA entities (`User`, `Story`, `Reaction`, `Collection`, `Report`).
- **Phase 3 (Remaining)**: Spring Security + JWT authentication, pseudonym isolation, server-side story lifecycle, and automated ML moderation & anti-doxxing.
- **Phase 4 (Remaining)**: Persistent atomic reactions, full-text search, weighted popular sorting, cursor pagination, and rate limiting.
- **Phase 5 (Remaining)**: Reporting API, restricted admin moderation queue, resolution actions, and audit trail.
- **Phase 6 (Remaining)**: Security hardening (XSS/CSRF/SQLi/IDOR), automated Vitest + JUnit test suites, Docker Compose multi-container setup, and GitHub Actions CI/CD.


