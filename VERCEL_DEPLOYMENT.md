# Deploying Tekzow Exam Portal to Vercel 🚀

This repository is pre-configured for deployment on **Vercel** with Next.js 14 App Router, Prisma ORM, and automated database provisioning.

---

## ⚡ Method 1: Deploy via Vercel Dashboard (Recommended)

### Step 1: Import Project to Vercel
1. Go to [vercel.com/new](https://vercel.com/new).
2. Connect your GitHub account and find **`tekzowdevelopers-coder/ExamPortal`**.
3. Click **Import**.

---

### Step 2: Add Database (1-Click Free Postgres via Vercel Storage)
Serverless functions on Vercel require a cloud PostgreSQL database:
1. In your Vercel Project Dashboard, navigate to the **Storage** tab.
2. Click **Create Database** → select **Postgres** (powered by Neon).
3. Choose your closest region and click **Create**.
4. Once created, click **Connect to Project** and select your `ExamPortal` deployment.
   - Vercel automatically injects `DATABASE_URL`, `POSTGRES_PRISMA_URL`, etc. into your Environment Variables!

*(Alternative: You can also use a free PostgreSQL database from [Neon.tech](https://neon.tech) or [Supabase.com](https://supabase.com) and paste the connection string into `DATABASE_URL` in the Environment Variables tab).*

---

### Step 3: Configure Environment Variables
In your Vercel Project Settings → **Environment Variables**, ensure the following are configured:

| Key | Example Value | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | *(Auto-set if using Vercel Postgres)* | PostgreSQL connection URI |
| `JWT_SECRET` | `tekzow-secret-key-2026-production` | Secret key for signing admin authentication tokens |
| `NEXT_PUBLIC_APP_URL` | `https://your-project.vercel.app` | Your live Vercel domain for QR code generation |

---

### Step 4: Build & Deploy
1. Click **Deploy**.
2. Vercel automatically runs the automated `vercel-build` pipeline:
   - ✅ Generates Prisma Client.
   - ✅ Pushes tables to your PostgreSQL database (`prisma db push`).
   - ✅ Seeds initial administrator credentials (`admin@tekzow.com` / `admin123`).
   - ✅ Seeds the `ML15` Machine Learning course and **36-question question bank**.
   - ✅ Compiles and optimizes all Next.js App Router dynamic routes.

---

## 💻 Method 2: Deploy via Vercel CLI

If you prefer using the command line:

```bash
# 1. Login to your Vercel account
vercel login

# 2. Link & Deploy
vercel

# 3. For Production release
vercel --prod
```

---

## 🔐 Default Admin Credentials

- **Email**: `admin@tekzow.com`
- **Password**: `admin123`
- **Initial Course Code**: `ML15`
