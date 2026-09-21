# Complete Database Guide — Tekzow Exam Portal

This document provides a comprehensive reference for the database architecture, setup, migration, seeding, and management of the **Tekzow Exam Portal**.

---

## 1. Database Architecture & Schema Models

The portal uses **Prisma ORM** with full relational integrity. All models are defined to support both **PostgreSQL** (for production / cloud serverless) and **SQLite** (for local offline development).

### Entity Relationship Overview

```text
┌──────────────┐          ┌──────────────┐          ┌────────────────┐
│    Admin     │          │    Course    │─────────<│    Question    │
└──────────────┘          └──────┬───────┘          └───────┬────────┘
                                 │ 1                        │
                                 │                          │
                                 │ *                        │ *
                          ┌──────┴───────┐                  │
                          │     Exam     │──────────────────┘
                          └──────┬───────┘
                                 │ 1
                                 │
                                 │ *
┌──────────────┐ 1      * ┌──────┴───────┐ 1      1 ┌────────────────┐
│   Student    │─────────<│ ExamAttempt  │─────────>│  Certificate   │
└──────────────┘          └──────────────┘          └────────────────┘
```

---

### Data Models Reference

| Model | Purpose | Key Attributes |
| :--- | :--- | :--- |
| **`Admin`** | Management users & trainers | `id`, `name`, `email` (unique), `passwordHash` (bcrypt), `role` (`SUPER_ADMIN`/`ADMIN`) |
| **`Course`** | Curriculum programs | `id`, `courseName`, `courseCode` (unique, e.g. `ML15`), `duration`, `trainerName`, `trainerDesignation`, `status` |
| **`Exam`** | Assessment configuration | `id`, `courseId`, `title`, `duration` (mins), `totalQuestions`, `passingPercentage`, `randomizeQuestions`, `randomizeOptions`, `fullscreenRequired`, `tabSwitchWarning`, `maxTabSwitches` |
| **`Question`** | MCQ Question bank | `id`, `courseId`, `examId`, `question`, `optionA`, `optionB`, `optionC`, `optionD`, `correctAnswer` (A/B/C/D), `explanation`, `marks`, `difficulty`, `topic` |
| **`Student`** | Candidate profiles | `id`, `name`, `registrationNumber` (indexed), `college`, `department`, `email`, `phone` |
| **`ExamAttempt`** | Timed test session & audit | `id`, `studentId`, `examId`, `startedAt`, `expiresAt`, `submittedAt`, `answers` (JSON), `score`, `percentage`, `result` (`PASSED`/`FAILED`), `tabSwitchCount`, `fullscreenExitCount`, `eventsLog` (JSON) |
| **`Certificate`** | Accredited digital credentials | `id`, `certificateId` (unique, e.g. `TZ-ML15-2026-995217`), `studentId`, `courseId`, `examAttemptId` (unique), `issueDate`, `verificationStatus` (`VALID`/`REVOKED`) |

---

## 2. Choosing Your Database Engine

| Environment | Recommended Database | Provider | URL Format |
| :--- | :--- | :--- | :--- |
| **Cloud Production (Vercel)** | **PostgreSQL** (Vercel Postgres / Neon / Supabase) | `postgresql` | `postgresql://user:pass@ep-host.region.neon.tech/dbname?sslmode=require` |
| **Local Development (Offline)** | **SQLite** (`prisma/dev.db`) | `sqlite` | `file:./dev.db` |

The repository contains pre-configured schemas for both:
- `prisma/schema.postgres.prisma` (PostgreSQL)
- `prisma/schema.sqlite.prisma` (SQLite)
- `prisma/schema.prisma` (Active schema)

---

## 3. Option A: Setup Cloud Database (PostgreSQL) — For Production / Vercel

### Choice 1: Vercel Postgres / Prisma Postgres (Recommended & 1-Click)
1. On your Vercel Project Dashboard, navigate to the **Storage** tab.
2. Click **Create Database** → Select **Postgres** (or **Prisma Postgres**).
3. Choose your database name and region, then click **Create**.
4. Click **Connect to Project** and select your `ExamPortal` project.
5. Vercel automatically populates the `DATABASE_URL` environment variable.

### Choice 2: Free Serverless Neon Postgres ([neon.tech](https://neon.tech))
1. Sign up for free at [neon.tech](https://neon.tech).
2. Click **Create Project** (select region closest to your users).
3. In your Dashboard, copy the **Connection string**:
   ```env
   DATABASE_URL="postgresql://neondb_owner:npg_xxxx@ep-cool-cloud-12345.us-east-2.aws.neon.tech/neondb?sslmode=require"
   ```
4. Paste this into your `.env` file locally or into Vercel **Project Settings → Environment Variables**.

### Choice 3: Free Supabase Postgres ([supabase.com](https://supabase.com))
1. Create a free project at [supabase.com](https://supabase.com).
2. Go to **Project Settings** → **Database** → **Connection string** → **URI**.
3. Use the Connection Pooling (Port 6543) or Direct (Port 5432) URI:
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxx.supabase.co:6543/postgres?pgbouncer=true"
   ```

---

## 4. Applying Schema & Seeding Data to PostgreSQL

Once your `DATABASE_URL` is set in your `.env` or cloud environment:

### Step 1: Ensure active schema is set to PostgreSQL
```bash
# Using the built-in switch script:
node scripts/switch-db.js postgres
```

### Step 2: Push database tables
```bash
npx prisma db push
```
*This instantly creates all 7 tables, foreign keys, indexes, and cascades in your PostgreSQL database.*

### Step 3: Seed initial Admin, Course, and Question Bank
```bash
node prisma/seed.js
```
*Output:*
```text
🌱 Seeding Tekzow Exam Portal database...
✓ Admin created: admin@tekzow.com
✓ Course created: Machine Learning (ML15)
✓ Exam configured: Machine Learning Final Assessment
✓ Seeded 36 Machine Learning examination questions.
🚀 Seeding completed successfully!
```

---

## 5. Option B: Local Setup with SQLite (Zero-Config Offline)

If developing locally without any internet connection or cloud database:

### Step 1: Switch schema to SQLite
```bash
node scripts/switch-db.js sqlite
```

### Step 2: Push to local database file
```bash
npx prisma db push
```
*This creates `prisma/dev.db` locally.*

### Step 3: Seed local database
```bash
node prisma/seed.js
```

---

## 6. Inspecting & Managing Data (Prisma Studio)

Prisma includes an interactive web GUI to view, edit, and filter rows across all tables:

```bash
npx prisma studio
```
Open **`http://localhost:5555`** in your browser to inspect:
- View student registrations and live exam attempt logs.
- Add or edit course codes and question options.
- Inspect emitted certificate IDs.

---

## 7. Automated Vercel Build Pipeline (`scripts/vercel-build.js`)

When deploying to Vercel, you do **not** need to manually run `prisma db push` or `seed.js`.

The automated pipeline in [`scripts/vercel-build.js`](scripts/vercel-build.js) executes automatically during every Vercel build:
1. Runs `npx prisma generate` to construct the type-safe client.
2. Detects whether `DATABASE_URL` is set to a remote PostgreSQL database.
3. Automatically applies the schema (`prisma db push --accept-data-loss`).
4. Seeds the default admin account, `ML15` course, and 36 questions if not already present.
5. Builds and optimizes all Next.js App Router pages.

---

## 8. Common Troubleshooting

### Error: `P1001: Can't reach database server at...`
- **Cause**: Network firewall, incorrect password, or expired connection pooler.
- **Fix**: Verify `DATABASE_URL` in `.env`. For Neon or Supabase, ensure `?sslmode=require` is appended to the connection string.

### Error: `EPERM: operation not permitted, rename query_engine-windows.dll`
- **Cause**: Windows file lock when Next.js dev server is actively running while `prisma generate` is called.
- **Fix**: Stop the local Next.js server (`Ctrl+C`), run `npx prisma generate`, then restart the server.

### Error: `SQLITE_READONLY: attempt to write a readonly database`
- **Cause**: Attempting to run SQLite in a Vercel Serverless Function (Lambda containers have read-only filesystems).
- **Fix**: Switch to PostgreSQL for Vercel deployment using the steps in Section 3 & 4.
