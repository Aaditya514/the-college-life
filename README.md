# 🎓 The College Life We Didn't Have

> *An anonymous, emotionally resonant campus storytelling vault for confessions, unsaid words, and the bittersweet reality of university life.*

[![Build Status](https://github.com/Aaditya514/the-college-life/actions/workflows/ci.yml/badge.svg)](https://github.com/Aaditya514/the-college-life/actions/workflows/ci.yml)
[![GitHub Release](https://img.shields.io/github/v/release/Aaditya514/the-college-life?color=brightgreen&label=Release)](https://github.com/Aaditya514/the-college-life/releases/latest)
[![Download APK](https://img.shields.io/badge/Direct%20Download-Android%20APK%20(3.7%20MB)-success?style=for-the-badge&logo=android)](https://github.com/Aaditya514/the-college-life/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📱 Instant Download & Mobile Installation (100% Free)

You can download and run the mobile app directly on any Android smartphone without waiting for store approval:

1. 📥 **Download**: Click [**Download Latest APK**](https://github.com/Aaditya514/the-college-life/releases/latest) to get `TheCollegeLife-v1.0.0.apk` directly on your Android device (or download to PC and transfer via USB).
2. ⚙️ **Install**: Open the downloaded `.apk` from your notification bar or file manager. When prompted by Android, tap **Settings** and enable **"Allow from this source"**.
3. 🚀 **Launch**: Open **The College Life** from your app drawer. Experience instant anonymous pen-name generation, the emotional archive, and interactive Instagram-style memory collections.

> **🏪 Google Play Store Note**: The production Android App Bundle (`TheCollegeLife-PlayStore-v1.0.0.aab`) is pre-compiled, optimized, and signed. It is ready for upload to Google Play Console whenever an active Google Play Developer account is registered.

---

## 🏛️ System Architecture

```
┌───────────────────────────────────────────────────────────────────────────────────┐
│                           THE COLLEGE LIFE WE DIDN'T HAVE                         │
├─────────────────────────┬───────────────────────────────┬─────────────────────────┤
│    MOBILE & WEB CLIENT  │        REST API BACKEND       │   DATA & ML PIPELINE    │
│  • Angular 21 (Signals) │  • Spring Boot 3 (Java 20/21) │  • PostgreSQL 16        │
│  • Capacitor Android    │  • Spring Security 6 + JWT    │  • Flyway Migrations    │
│  • Safe-area inset pads │  • Rate Limiting (Bucket4j)   │  • Google Gemini AI     │
│  • Instagram Saves      │  • OWASP ASVS Hardened        │  • Docker Multi-stage   │
└─────────────────────────┴───────────────────────────────┴─────────────────────────┘
```

---

## ✨ Platform Highlights

### 1. ✍️ Story Authoring & Zero-Mangling Tag Chips
- **Dual Writing Modals**: Full-screen canvas (`/share`) and popup modal (`Spill it out`) with live preview.
- **Interactive Tag Input**: Tag chips generated with <kbd>Enter</kbd> or <kbd>,</kbd> (e.g. `#hostel_chai`, `#placement_stress`, `#LT2_glance`).
- **Pseudonym Dice Roller**: Roll randomized campus-native pen-names (e.g. `@terrace_poet_29`, `@chai_tapri_rebel`, `@convocation_dreamer_15`).
- **Trigger Warnings**: Content warnings for sensitive themes (academic burnout, mental health, placement anxiety).

### 2. 🏛️ Three Emotional Pillars
1. **The Life I Actually Lived**: The chaotic reality — midnight chai runs, 75% attendance panics, proxy lectures, mess food debates.
2. **The Life I Imagined**: What was promised vs. what came to pass — convocation bittersweetness, freshman dreams, adulthood transition.
3. **Things I Never Said**: The unspoken truths — library crushes, unsent apology notes, friendships that silently faded away.

### 3. 🔖 Instagram-Style Collections
- **Two-Tap Saving**: Save stories into personalized themed folders (e.g., "Late Night Chai Memories", "Campus Heartbreaks").
- **Smart Fallback**: Clicking outside auto-saves directly to the master "All Saved" archive.

### 4. 🛡️ Production Security & Automated Moderation
- **OWASP ASVS / MASVS Hardened**: Cryptographically random HMAC-SHA256 JWT key rotation, stateless session management, sanitized SQL queries.
- **Strict IDOR Protection**: Server enforces identity via authenticated JWT principal — preventing user ID spoofing.
- **AI Anti-Doxxing & Moderation**: Integrated with Google Gemini API for real-time safety classification, toxicity detection, and PII protection.
- **Defensive Android Styling**: 46px dynamic status-bar clearance with `max(env(safe-area-inset-top), 38px)` ensuring clean viewport clearance on Realme, Samsung, and Xiaomi camera cutouts.

---

## 🛠️ Technology Stack

| Layer | Technology | Key Capabilities |
|---|---|---|
| **Mobile App** | Capacitor 7 + Android SDK 35 | Native Android container, Haptic feedback, Status bar management |
| **Web Frontend** | Angular 21, TypeScript, HTML5, Vanilla CSS | Standalone components, Signals state management, Glassmorphic UI |
| **Backend API** | Spring Boot 3.4, Java 20/21 | Spring Data JPA, Spring Security, Flyway, Bucket4j rate limiting |
| **Database** | PostgreSQL 16 | Relational schemas, indexing, cursor pagination, automated migrations |
| **Containers** | Docker & Docker Compose | Multi-stage builder images, unprivileged runtime users |
| **CI/CD** | GitHub Actions | Automated test runners, release builds, APK & AAB distribution |

---

## 🚀 Running Locally

### Option 1: One-Click Launch via Docker Compose (Recommended)

```bash
# Clone the repository
git clone https://github.com/Aaditya514/the-college-life.git
cd the-college-life

# Copy environment variables template
cp backend/.env.example backend/.env

# Spin up Postgres, Spring Boot backend, and Angular frontend
docker compose up --build -d
```
- **Web App**: `http://localhost:80` (or `http://localhost:4200` in dev mode)
- **Backend API**: `http://localhost:8080/api`
- **Postgres DB**: `localhost:5432`

---

### Option 2: Run Services Individually

#### 1. Start PostgreSQL
```bash
# Ensure PostgreSQL is running on port 5432 with database 'collegelife_db'
```

#### 2. Start Spring Boot Backend
```bash
cd backend
# Set environment variables from .env
mvn spring-boot:run
```

#### 3. Start Angular Web Client
```bash
cd frontend
npm install
npm start
# Available at http://localhost:4200
```

#### 4. Run Mobile App on Android Device
```bash
cd frontend
npm run build
npx cap sync android
cd android
./gradlew.bat assembleDebug
# Generated APK: frontend/android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 🔄 Continuous Integration & Delivery (CI/CD)

The repository includes two automated GitHub Actions workflows:

1. **`ci.yml` (Continuous Integration)**:
   - Triggers on every `push` and `pull_request` to `main`.
   - Runs backend unit & integration tests (`mvn clean test`).
   - Builds Angular production bundle (`npm run build`).
   - Validates Android Gradle compilation (`./gradlew test assembleDebug`).

2. **`release.yml` (Continuous Delivery)**:
   - Triggers on version tags (`v*`) or manual click from the **GitHub Actions** tab.
   - Compiles and signs the installable Android APK (`TheCollegeLife-vX.X.X.apk`).
   - Builds the Google Play Store bundle (`TheCollegeLife-PlayStore-vX.X.X.aab`).
   - Packages the Spring Boot standalone microservice (`TheCollegeLife-backend-vX.X.X.jar`).
   - Automatically publishes an official GitHub Release with SHA-256 integrity checksums.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
