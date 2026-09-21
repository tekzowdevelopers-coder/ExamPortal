# Tekzow — Online MCQ Examination & Certificate Portal

![Tekzow Banner](public/images/tekzow-logo.png)

A modern, responsive, and secure examination platform built with **Next.js 14 App Router, TypeScript, Tailwind CSS, Prisma ORM, and Client-Side PDF Certificate Generation**. 

Designed for educational institutions and corporate trainers to conduct supervised online examinations, enforce strict anti-cheating controls, evaluate results instantly on the backend, and mint verifiable digital certificates with dynamic QR codes.

---

## 📑 Table of Contents
1. [Portal Architecture & Core Workflows](#-portal-architecture--core-workflows)
2. [Key Features](#-key-features)
3. [Technology Stack](#-technology-stack)
4. [Complete Database Setup](#-complete-database-setup)
5. [Quick Start (Local Development)](#-quick-start-local-development)
6. [Deploying to Vercel](#-deploying-to-vercel)
7. [API Route Reference](#-api-route-reference)
8. [Anti-Cheating & Security Controls](#-anti-cheating--security-controls)
9. [Default Credentials](#-default-credentials)

---

## 🏛 Portal Architecture & Core Workflows

The platform contains two completely isolated portals:

```text
               ┌──────────────────────────────────────────┐
               │          TEKZOW EXAM PLATFORM            │
               └────────────────────┬─────────────────────┘
                                    │
         ┌──────────────────────────┴──────────────────────────┐
         │                                                     │
         ▼                                                     ▼
┌─────────────────────────────────┐           ┌─────────────────────────────────┐
│         STUDENT PORTAL          │           │       ADMIN & TRAINER PORTAL    │
├─────────────────────────────────┤           ├─────────────────────────────────┤
│ 1. Validate Course Code (ML15)  │           │ 1. Secure Authentication (JWT)  │
│ 2. Register Candidate Details   │           │ 2. Dashboard KPIs & Analytics   │
│ 3. Agree to Anti-Cheating Rules │           │ 3. Course & Unique Code Manager │
│ 4. Fullscreen Timed Assessment  │           │ 4. Exam Duration & Rules Engine │
│ 5. Immediate Server Evaluation  │           │ 5. 36+ ML Question Bank (CSV)   │
│ 6. Download Verifiable PDF      │           │ 6. Candidate Audit & Logs       │
│ 7. Certificate Lookup by Reg No │           │ 7. Certificate Registry Manager │
└─────────────────────────────────┘           └─────────────────────────────────┘
```

---

## ✨ Key Features

### 🎓 Student Examination Experience
- **Course Code Validation**: Instant verification of course codes (e.g. `ML15`) displaying course overview, trainer details, question count, and passing threshold.
- **Candidate Registration**: Collects Candidate Name, Registration / Roll Number, College, Department, and optional contact info with protection against duplicate submissions.
- **Distraction-Free Exam Interface**:
  - Fullscreen enforcement with warning modals on exit.
  - Disabled clipboard actions (`Ctrl+C`, `Ctrl+V`), text selection, and right-click context menu.
  - Tab-switching detection (`visibilitychange`, `window.blur`) logged to server incident timeline.
  - Server-authoritative countdown timer with automated submission upon expiry.
  - Real-time auto-saving of answers upon every option selection.
  - Multi-state question palette (Answered, Not Visited, Marked for Review, Current).
- **Automated Server Evaluation**: Authoritative score, percentage, and pass/fail calculation.
- **Verifiable PDF Certificate**: High-resolution landscape certificate minted automatically upon passing (>= 50%), featuring official Tekzow branding, trainer signature, and dynamic QR code linking directly to public verification.
- **Public Verification & Lookup**: Anyone can verify certificate authenticity at `/verify/[certificateId]`, and students can retrieve past credentials via `/lookup`.

### 🛠 Administrator & Trainer Portal (`/admin`)
- **Dashboard Analytics**: Real-time KPI cards (Total Courses, Students, Exams, Attempts, Pass Rate, Certificates), score distribution histogram, and recent exam logs.
- **Course & Code Management**: Course creation, automatic unique code generator, status toggles (Draft / Published / Closed), and trainer assignment.
- **Exam Configuration**: Custom durations, question limits, marks per question, negative marking, passing marks, and security switches (randomization, fullscreen requirement, tab-switch warning).
- **Machine Learning Question Bank**:
  - Pre-populated with **36 comprehensive MCQs** spanning AI/ML fundamentals, Python/NumPy/Pandas, Data Preprocessing, Regression, Classification, Ensemble Trees/Random Forest/XGBoost, Evaluation Metrics, Regularization/Overfitting, and Unsupervised K-Means/PCA.
  - Bulk CSV Import with live syntax & validation error preview before committing.
  - 1-click CSV Export of the entire question repository.
- **Candidate Audit Sheets**: Review candidate responses side-by-side with ground-truth answers, along with a complete timestamped incident audit log of tab switches and fullscreen exits.

---

## 💻 Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Database ORM** | Prisma ORM |
| **Supported Databases** | PostgreSQL (Production) / SQLite (Local) |
| **Authentication** | JSON Web Tokens (JWT) + BcryptJS |
| **PDF & Canvas** | jsPDF + html2canvas |
| **Icons & Visuals** | Lucide React + Canvas Confetti |

---

## 🗄 Complete Database Setup

The database layer supports **PostgreSQL** (for production / Vercel serverless) and **SQLite** (for zero-config local offline testing).

> 📖 **For complete step-by-step instructions, see the dedicated [DATABASE_GUIDE.md](DATABASE_GUIDE.md).**

### Quick Switch Command
Use the built-in switch script to switch between database engines instantly:

```bash
# Switch to PostgreSQL (Production / Cloud):
node scripts/switch-db.js postgres

# Switch to SQLite (Local Offline):
node scripts/switch-db.js sqlite
```

### 1. Cloud PostgreSQL Setup (Neon / Supabase / Vercel Postgres)
1. Get your connection string from [Neon.tech](https://neon.tech), [Supabase](https://supabase.com), or Vercel Storage.
2. In your `.env` file, configure `DATABASE_URL`:
   ```env
   DATABASE_URL="postgresql://user:password@host:port/dbname?sslmode=require"
   JWT_SECRET="your-secure-jwt-secret-key"
   NEXT_PUBLIC_APP_URL="https://your-domain.vercel.app"
   ```
3. Push schema and seed data:
   ```bash
   npx prisma db push
   node prisma/seed.js
   ```

### 2. Local SQLite Setup (Zero-Config)
```bash
node scripts/switch-db.js sqlite
npx prisma db push
node prisma/seed.js
```

### Visual Database GUI (Prisma Studio)
Inspect students, questions, attempts, and certificates directly in your browser:
```bash
npx prisma studio
# Opens at http://localhost:5555
```

---

## 🚀 Quick Start (Local Development)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/tekzowdevelopers-coder/ExamPortal.git
cd ExamPortal
pnpm install
```

### 2. Initialize Database
```bash
npx prisma db push
node prisma/seed.js
```

### 3. Run Development Server
```bash
pnpm dev
```
Open **`http://localhost:3000`** in your browser.

---

## ☁ Deploying to Vercel

The repository includes an automated build pipeline in [`scripts/vercel-build.js`](scripts/vercel-build.js) that automatically pushes tables and seeds initial assessment questions into your cloud database during deployment.

> 📖 **For detailed deployment steps, see [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md).**

1. Import `tekzowdevelopers-coder/ExamPortal` into [Vercel](https://vercel.com/new).
2. Connect a PostgreSQL database via Vercel **Storage** tab (or set `DATABASE_URL` in Environment Variables).
3. Set `JWT_SECRET` and `NEXT_PUBLIC_APP_URL`.
4. Click **Deploy**. Vercel will automatically compile, push the schema, seed the 36 questions, and deploy your live site!

---

## 🔒 Anti-Cheating & Security Controls

| Anti-Cheating Control | Implementation |
| :--- | :--- |
| **Fullscreen Enforcement** | Requests `requestFullscreen()`. Exiting triggers a modal prompt and increments violation count. |
| **Tab Switching Detection** | Tracks `visibilitychange` and `window.blur` events with real-time incident warnings and persistent server logging. |
| **Answer Randomization** | Questions and options (A, B, C, D) are scrambled per candidate session using pseudo-random seeds. |
| **Clipboard Protection** | Disables `copy`, `cut`, `paste`, context menu (`contextmenu`), and hotkeys (`Ctrl+C`, `Ctrl+V`, `Ctrl+U`). |
| **Authoritative Timer** | Countdown is authoritatively enforced on the backend. Late submissions are rejected. |
| **Auto-Save Engine** | Every selected option is saved asynchronously via `POST /api/exams/[id]/save-answer`. |
| **Secret Sanitization** | Correct answers and ground-truth options are strictly excluded from all student-facing API payloads until official evaluation. |

---

## 🔑 Default Credentials

- **Admin Login Portal**: `http://localhost:3000/admin/login`
- **Initial Admin Email**: `admin@tekzow.com`
- **Initial Admin Password**: `admin123`
- **Demo Course Code**: `ML15`
- **Public Verification**: `http://localhost:3000/verify`
- **Candidate Lookup**: `http://localhost:3000/lookup`
