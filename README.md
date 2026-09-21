# TEKZOW EXAM PORTAL
## Online MCQ Examination & Digital Certification Platform

### Overview
Tekzow Exam Portal is a secure, responsive, full-stack online examination and certification platform built using **Next.js 14, TypeScript, Tailwind CSS, Prisma ORM with SQLite, and client-side PDF certificate generation**. The application enforces strict academic integrity, anti-cheating deterrence, server-authoritative scoring and timing, and instant digital credentialing.

---

### Key Features

#### 1. Official Tekzow Branding & Identity
- **Logo Integration**: Official Tekzow logo integrated across all headers, exam navigation, result summaries, printable certificates, public verification pages, and admin consoles.
- **Brand Aesthetic**: Clean educational theme with white backgrounds, dark typography, and vibrant Tekzow blue/cyan gradient accents (`#0B192C`, `#1E3E62`, `#007BFF`, `#00A3FF`).

#### 2. Student Examination Portal
- **Course Code Access**: Real-time course code validation (e.g. `ML15`).
- **Student Registration**: Capture candidate Name, Registration / Roll Number, College, Department, and optional contact info.
- **Pre-Exam Instructions**: Comprehensive testing rules, passing criteria, and explicit anti-cheating agreement.
- **Distraction-Free Exam Interface**:
  - Fullscreen enforcement with exit detection modals.
  - Clipboard copy (`Ctrl+C`), paste (`Ctrl+V`), right-click context menu, and text selection disabled.
  - Tab-switching detection (`visibilitychange`, `blur`) with live warning alerts and persistent server logging.
  - Server-authoritative countdown timer with automatic exam submission on expiry.
  - Real-time auto-saving of answers upon every option click.
  - Multi-state question palette: Not Visited, Visited, Answered, Marked for Review, Current.
  - Review & Submit confirmation dialog with answered/unanswered counts.

#### 3. Automatic Evaluation & Results
- **Authoritative Server Scoring**: Scores, percentages, correct/wrong/unanswered counts calculated strictly on the backend.
- **Question Answer Review**: Detailed explanation review viewable by candidates when enabled by exam administrators.
- **Confetti Celebration**: Immediate visual feedback upon achieving passing grade (>= 50%).

#### 4. Verifiable PDF Certificate System
- **Unique Certificate ID**: Automatically minted in format `TZ-[COURSE]-[YEAR]-[RANDOM_6_DIGITS]` (e.g. `TZ-ML15-2026-995217`).
- **High-Resolution Landscape Certificate**:
  - Official Tekzow logo
  - Candidate Name & Registration Number
  - Course Name & Course Code
  - Trainer Name & AI Trainer Designation
  - Completion Date & Grade Percentage
  - Dynamic QR Code linking directly to the public verification URL
  - Direct 1-click **Download PDF Certificate** using `html2canvas` and `jsPDF`.
- **Public Verification Portal**: Accessible at `/verify/[certificateId]` or `/verify` allowing universities and employers to validate certificate authenticity without logging in.

#### 5. Administrator & Trainer Portal (`/admin`)
- **Secure Authentication**: Bcrypt password hashing and JWT sessions. Default login: `admin@tekzow.com` / `admin123`.
- **Dashboard Analytics**: Metrics cards (Total Courses, Students, Exams, Attempts, Pass Rate %, Certificates Minted), score distribution histogram, pass/fail ratio, and recent exams table.
- **Course & Code Management**: Course creation, auto or manual course code generation, trainer assignment, status toggling, and instant code clipboard copying.
- **Exam Configuration**: Custom durations, question limits, marks per question, negative marking, passing percentages, and security switches (randomization, fullscreen requirement, tab switch detection, show answers).
- **15-Hour Machine Learning Question Bank**:
  - Pre-populated with 36+ comprehensive MCQs across all required domains: Fundamentals, Python/NumPy/Pandas, Preprocessing, Regression metrics, Classification, Ensemble Trees/Random Forest/XGBoost, Model Evaluation, Regularization/Overfitting, and Unsupervised K-Means/PCA.
  - Full CRUD operations.
  - **CSV Bulk Import & Export**: CSV question upload with validation preview (showing valid count, invalid count, and row-level error reasons before insertion).
- **Candidate Directory**: Searchable candidate roster with college, department, attempt records, and CSV export.
- **Attempt Audits & Anti-Cheating Logs**: Full audit view per attempt showing question-by-question candidate selections vs. ground truth, tab switch count, fullscreen exit count, and timestamped event timeline.
- **Certificate Registry**: List of all issued certificates with quick links to public verification and status revocation.

---

### Running the Application

1. **Install Dependencies**:
   ```bash
   pnpm install
   ```

2. **Database Setup & Seeding**:
   ```bash
   npx prisma db push
   node prisma/seed.js
   ```

3. **Start Development Server**:
   ```bash
   pnpm dev
   ```

4. **Build & Start Production Server**:
   ```bash
   pnpm build
   pnpm start -p 3000
   ```

### Default Credentials
- **Student Course Code**: `ML15`
- **Admin Email**: `admin@tekzow.com`
- **Admin Password**: `admin123`
- **Public URL**: `http://localhost:3000`
- **Admin Portal**: `http://localhost:3000/admin`
- **Public Verification**: `http://localhost:3000/verify`
- **Candidate Lookup**: `http://localhost:3000/lookup`
