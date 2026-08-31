# ROLEVIA v2 Master Capability Matrix

This matrix catalogs all page routes, APIs, component files, database models, and interactive components. Each item is classified by its current functional status.

---

## 1. Authentication & Security Flows

| Feature | Component/Route | Status | Notes |
| :--- | :--- | :--- | :--- |
| **User Registration** | `/register` | **WORKING** | Persists new users to PostgreSQL database with secure password hashing. |
| **User Login** | `/login` | **WORKING** | Standard credentials login via Auth.js with Google OAuth support. |
| **RBAC Matrix** | `src/lib/auth/admin.ts` | **WORKING** | Server-side role resolution (`USER`, `ADMIN`, `OWNER`) and authorization guards. |
| **Platform Owner Entitlement** | `getAuthenticatedUser()` | **WORKING** | `chaitanyakumarsahu00@gmail.com` receives real database `OWNER` role and `PRO` plan via `OWNER_GRANT`. |
| **Forgot Password** | `/forgot-password` | **WORKING** | Generates secure reset tokens with console link fallback. |
| **Reset Password** | `/reset-password` | **WORKING** | Single-use time-limited reset tokens. |
| **IDOR Guard** | Scoped queries | **WORKING** | Queries filter on authenticated session `userId`. |

---

## 2. Global Navigation & Copilot

| Feature | Component/Route | Status | Notes |
| :--- | :--- | :--- | :--- |
| **Sidebar Menu Groups** | `Sidebar.tsx` | **WORKING** | HOME, BUILD, TARGET, PRACTICE, GROW, TOOLS, and SYSTEM groups. |
| **Career Copilot** | `/dashboard/copilot` & `/api/copilot` | **WORKING** | Grounded career intelligence assistant answering ATS, skill gaps, target jobs, and interview inquiries from real user records. |
| **Mobile Navigation** | `Sidebar.tsx` | **WORKING** | Responsive drawer and bottom tab navigation. |
| **Global Theme System** | `globals.css` | **WORKING** | Warm editorial paper styling (`#FAF8F5`, charcoal ink `#1A1A1A`, emerald highlights). |

---

## 3. Resume Studio & Intelligence

| Feature | Component/Route | Status | Notes |
| :--- | :--- | :--- | :--- |
| **Guest ATS Scan** | `/api/ats/guest-scan` & `/` | **WORKING** | In-memory ephemeral parser providing instant score and top 3 issues with zero data leaks. |
| **Resume Upload & Scan**| `/api/resumes/upload` | **WORKING** | Parses PDF/DOCX metadata with scanning stage animations. |
| **ATS Simulator** | `[reportId]/page.tsx` | **WORKING** | Renders raw ASCII text structure output to preview parser visibility. |
| **Evidence Checklist** | `CheckList.tsx` | **WORKING** | Displays check rules under Why, Where, Impact, and Fix. |
| **Job Keyword Matrix** | `KeywordMatrix.tsx` | **WORKING** | Clickable keyword tokens to reveal exact sentence evidence in resume. |
| **Resume Version Control** | `[id]/page.tsx` | **WORKING** | Stores duplicate/target versions linked to distinct Job Targets. |
| **A/B Resume Lab** | `ab-testing/page.tsx` | **WORKING** | Evaluates two parsed reports side-by-side on ATS, career evidence, and quality. |
| **Design Controls** | `SectionsPanel.tsx` | **WORKING** | Margin presets, custom font selects, page format, and color accent selectors are fully connected. |

---

## 4. Job Matches & Autopilot

| Feature | Component/Route | Status | Notes |
| :--- | :--- | :--- | :--- |
| **Job Matches List** | `/dashboard/jobs` | **WORKING** | Compiles matched items. |
| **Job Match Details** | `/dashboard/jobs/[id]` | **WORKING** | Lists JD details and required/preferred competency mappings. |
| **Application Tracker** | `/dashboard/applications` | **WORKING** | CRUD pipeline with timeline, application stage moves, notes, and deadlines. |
| **Cover Letter Builder** | `/dashboard/tools/cover-letter` | **WORKING** | Extracts bullet proofs and constructs letters. |
| **Application Autopilot**| `/dashboard/jobs/autopilot` | **WORKING** | Computes composite readiness index ($\text{Job} \times \text{Resume} \times \text{Skills} \times \text{Interview}$) for saved target jobs. |

---

## 5. Grow & Practice Arena

| Feature | Component/Route | Status | Notes |
| :--- | :--- | :--- | :--- |
| **Skill Gaps Radar** | `skills/gaps/page.tsx` | **WORKING** | Radar metric tracking required vs preferred competencies. |
| **Skill Evidence Graph** | `skills/gaps/page.tsx` | **WORKING** | Connects Experience, Projects, Assessments, and Job requirements in visual trees. |
| **30/60/90 Day Roadmap** | `roadmap/page.tsx` | **WORKING** | Syncs milestones and tasks directly to Prisma. |
| **Career Passport** | `passport/page.tsx` | **WORKING** | Verified skills, educations, experiences, projects, certifications, assessments, and coding solutions. |
| **Assessments** | `assess/page.tsx` | **WORKING** | Evaluates attempts, updates streaks/XP, and triggers Career Readiness calculations. |
| **Coding Arena** | `code/page.tsx` | **WORKING** | Executes JavaScript tests against seeded problems inside Node's VM context. |
| **Achievements** | `achievements/page.tsx` | **WORKING** | Displays streaks, XP progression logs, and verification badges. |
| **Gamification Hub** | `readiness/page.tsx` | **WORKING** | Dynamic Daily Missions checkboxes; claims task completion, increments levels/XP, and updates Postgres. |

---

## 6. Mock Interview Lab

| Feature | Component/Route | Status | Notes |
| :--- | :--- | :--- | :--- |
| **Adaptive Orchestration**| `InterviewOrchestrator.ts` | **WORKING** | Intercepts turn payloads and adaptively scores candidate responses. |
| **Offline Engine Fallback**| `InterviewQuestionEngine.ts`| **WORKING** | Compares response terms to keyword banks when external AI keys are missing. |
| **Evaluation Dashboard** | `[id]/evaluation/page.tsx` | **WORKING** | Charts score progress, compiles historical averages, and flags recurring gaps. |

---

## 7. Monetization & Admin Controls

| Feature | Component/Route | Status | Notes |
| :--- | :--- | :--- | :--- |
| **Credit Enforcement** | `credits.ts` | **WORKING** | Server-side `UsageLedger` auditing and plan consumption gating. |
| **Admin Command Center**| `/admin` | **WORKING** | Private dashboard with 403 security guard, live telemetry, user management, audit logs, and bug reporting. |
| **Admin APIs** | `/api/admin/*` | **WORKING** | Overview analytics, user search/suspend/grant, system health, and audit trail. |
| **Feedback & Bug Tracking**| `/api/feedback` & `/api/bugs`| **WORKING** | Persistent submission and admin resolution workflows. |
