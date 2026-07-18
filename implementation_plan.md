# Resume Analyzer – Full MERN Stack Implementation Plan

## Overview

A professional-grade, full-stack Resume Analyzer web application built on the MERN stack. This project is designed to be **interview-ready** and **production-quality**, showcasing advanced skills in React.js, Node.js, Express.js, MongoDB, JWT Auth, Role-Based Access Control, Hybrid NLP scoring, and beautiful data visualization.

Designed for **concurrent multi-user usage** — each user's data is fully isolated by their JWT identity and MongoDB `userId` references.

---

## Open Questions

> [!IMPORTANT]
> **No blockers.** All requirements are well-defined. The plan below captures every major decision.

> [!NOTE]
> **Hybrid NLP Strategy (Primary: TF-IDF → Fallback: LLM)**:
> 1. **Primary** — `natural` (TF-IDF + cosine similarity) + curated skills dictionary. Fast, free, fully offline.
> 2. **Fallback (LLM)** — If TF-IDF confidence is low (e.g. resume text too short < 100 words, or extracted skills < 3, or score is ambiguous), the system automatically calls **Google Gemini API** (free tier) to get a more intelligent score + reasoning. The frontend shows a badge "AI-Assisted Analysis" when LLM was used.
> 3. This hybrid approach is architecturally clean and great to explain in interviews.

> [!NOTE]
> **Shortlisting Verdict**: Every analysis result includes a clear **SHORTLISTED / REJECTED / BORDERLINE** verdict with a confidence percentage and a one-line reason — mimicking real ATS behavior.

> [!NOTE]
> **Multi-User Architecture**: All MongoDB queries are scoped by `userId`/`adminId` from JWT. Concurrent uploads use unique filenames (`uuid`). No user can access another's data.

> [!NOTE]
> **File Storage**: Resume PDFs are parsed server-side using `pdf-parse` and `mammoth` (DOCX). Files stored in `uploads/` locally. S3 is a natural future upgrade.

---

## Proposed Changes

### 📁 Project Structure

```
Resume Analyser/
├── server/                     # Node.js + Express backend
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── middleware/
│   │   ├── authMiddleware.js   # JWT verify
│   │   └── roleMiddleware.js   # Admin/User guard
│   ├── models/
│   │   ├── User.js
│   │   ├── Resume.js
│   │   ├── Job.js
│   │   └── AnalysisReport.js
│   ├── routes/
│   │   ├── authRoutes.js       # /api/auth
│   │   ├── resumeRoutes.js     # /api/resumes
│   │   ├── jobRoutes.js        # /api/jobs
│   │   └── analysisRoutes.js  # /api/analysis
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── resumeController.js
│   │   ├── jobController.js
│   │   └── analysisController.js
│   ├── services/
│   │   └── nlpService.js       # TF-IDF + skill matching engine
│   ├── uploads/                # Uploaded resumes (gitignored)
│   ├── .env
│   ├── package.json
│   └── server.js
│
└── client/                     # React.js frontend
    ├── public/
    ├── src/
    │   ├── api/
    │   │   └── axios.js        # Axios instance + interceptors
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── Sidebar.jsx
    │   │   ├── ResumeDropzone.jsx
    │   │   ├── ScoreCard.jsx
    │   │   ├── SkillsChart.jsx
    │   │   ├── RadarChart.jsx
    │   │   ├── SuggestionList.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── pages/
    │   │   ├── LandingPage.jsx
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── Dashboard.jsx      # User dashboard
    │   │   ├── UploadResume.jsx
    │   │   ├── AnalysisResult.jsx
    │   │   ├── AdminDashboard.jsx # Admin-only
    │   │   ├── ManageJobs.jsx     # Admin: create/view jobs
    │   │   └── AllReports.jsx     # Admin: all reports
    │   ├── context/
    │   │   └── AuthContext.jsx    # Global auth state
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── package.json
    └── vite.config.js
```

---

### 🔧 Backend Components

#### [NEW] `server/server.js`
- Express app entry point, CORS, routes, error handler

#### [NEW] `server/config/db.js`
- Mongoose connection to MongoDB Atlas (or local)

#### [NEW] `server/models/User.js`
- Fields: username, email, password (bcrypt hashed), role (user/admin), timestamps

#### [NEW] `server/models/Resume.js`
- Fields: userId (ref), fileName, fileUrl, parsedText, skills[], education, experience, uploadedAt

#### [NEW] `server/models/Job.js`
- Fields: adminId (ref), title, description, requiredSkills[], createdAt

#### [NEW] `server/models/AnalysisReport.js`
- Fields: resumeId (ref), jobId (ref), matchScore, matchedSkills[], missingSkills[], suggestions, sectionScores (object), createdAt

#### [NEW] `server/services/nlpService.js`
- **Primary**: TF-IDF cosine similarity (`natural` library) + curated 300+ tech skills dictionary
- **Fallback trigger**: if `extractedSkills.length < 3` OR `resumeWordCount < 100` OR `confidence < 0.4` → call LLM
- **LLM fallback**: Gemini API with structured prompt returning JSON (score, skills, verdict, reason)
- Returns: `{ matchScore, matchedSkills[], missingSkills[], sectionScores, suggestions[], verdict, verdictReason, usedLLM }`

#### [NEW] `server/services/geminiService.js`
- Wraps `@google/generative-ai` SDK
- Sends `{ resumeText, jobDescription, jobSkills }` → structured prompt
- Parses JSON response safely with fallback
- Returns same shape as TF-IDF output for a clean single interface

#### [NEW] `server/controllers/authController.js`
- `POST /api/auth/register` – bcrypt + JWT
- `POST /api/auth/login` – verify + JWT
- `GET /api/auth/me` – get logged in user

#### [NEW] `server/controllers/resumeController.js`
- `POST /api/resumes/upload` – multer upload, pdf-parse/mammoth extract, skill extraction, save to DB
- `GET /api/resumes` – get all resumes for logged-in user
- `GET /api/resumes/:id` – single resume

#### [NEW] `server/controllers/jobController.js`
- `POST /api/jobs` – Admin only: create job
- `GET /api/jobs` – All users: view available jobs
- `DELETE /api/jobs/:id` – Admin only

#### [NEW] `server/controllers/analysisController.js`
- `POST /api/analysis` – Run NLP comparison, save report
- `GET /api/analysis/:reportId` – Get single report
- `GET /api/analysis/user/all` – All reports for logged-in user
- `GET /api/analysis/admin/all` – Admin: all reports

---

### 🎨 Frontend Components

#### Design System
- **Color Palette**: Deep navy `#0A0F1E`, electric violet `#7C3AED`, cyan accent `#06B6D4`, emerald green `#10B981`
- **Font**: `Inter` from Google Fonts
- **Style**: Glassmorphism cards, gradient borders, smooth animations

#### [NEW] `client/src/pages/LandingPage.jsx`
- Hero section with animated text
- Feature highlights with icons
- CTA buttons for Login/Register

#### [NEW] `client/src/pages/Dashboard.jsx`
- Summary stats (total resumes, analyses, avg score)
- Recent analyses list
- Quick action buttons

#### [NEW] `client/src/pages/UploadResume.jsx`
- Drag-and-drop resume upload (react-dropzone)
- Job description selector
- Animated upload progress

#### [NEW] `client/src/pages/AnalysisResult.jsx`
- **Verdict Banner** — prominent `SHORTLISTED ✅` / `BORDERLINE ⚠️` / `REJECTED ❌` card with reason
- **Animated circular score gauge** (counts up on load)
- **Radar chart** for section scores (Chart.js)
- **Bar chart** for skill match breakdown
- **Matched/Missing skill tags** with color coding
- **AI-Assisted badge** shown if LLM fallback was used
- **Suggestion cards** with priority levels
- **PDF Export** button (jsPDF)

#### [NEW] `client/src/pages/AdminDashboard.jsx`
- Analytics overview (total users, resumes, reports)
- All analysis reports table
- Charts for aggregate stats

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite, React Router v6, Axios |
| UI | Vanilla CSS (Glassmorphism design) |
| Charts | Chart.js + react-chartjs-2 |
| File Upload | react-dropzone |
| Backend | Node.js, Express.js |
| Auth | JWT + bcryptjs |
| Multi-User | UUID filenames, JWT-scoped DB queries |
| Database | MongoDB + Mongoose |
| File Parsing | multer, pdf-parse, mammoth |
| NLP (Primary) | `natural` (TF-IDF + cosine similarity) |
| NLP (Fallback) | Google Gemini API (`@google/generative-ai`) |
| PDF Export | jsPDF |

---

## Verification Plan

### Automated
- Start both servers, test all API endpoints with browser and form flows

### Manual Browser Testing
1. Register as User → Upload resume → Select job → View analysis result with charts
2. Register as Admin → Create job → View all reports
3. JWT token expiry and protected route redirect
4. PDF export download
5. Responsive layout on mobile/tablet

### Quality Gates
- Beautiful landing page (first impression)
- Smooth score animation
- Role-based nav and route guards
- Real NLP scoring (not fake/random)
