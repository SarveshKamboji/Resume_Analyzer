# 📄 Resume Analyzer

> An AI-powered Resume Analyzer built using the **MERN Stack** that compares resumes against job descriptions using **Hybrid NLP (TF-IDF + Google Gemini AI)** to generate ATS-like scores, skill gap analysis, and personalized improvement suggestions.

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![React](https://img.shields.io/badge/Frontend-React-blue)
![Node.js](https://img.shields.io/badge/Backend-Node.js-green)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-success)
![Express](https://img.shields.io/badge/Framework-Express-lightgrey)

---

## 🚀 Features

### 👤 Authentication
- User Registration & Login
- JWT Authentication
- Password Hashing using bcrypt
- Protected Routes
- Role-Based Access Control (User/Admin)

### 📄 Resume Management
- Upload Resume (PDF/DOCX)
- Resume Parsing
- Resume Storage
- Resume History

### 💼 Job Management
- Admin can Create Jobs
- View Available Jobs
- Delete Jobs
- Job Description Management

### 🤖 AI Resume Analysis

#### Hybrid NLP Pipeline

**Primary Analysis**
- TF-IDF Similarity
- Cosine Similarity
- Skill Extraction
- ATS Score Generation

**AI Fallback**
- Google Gemini API
- Intelligent Resume Evaluation
- AI-generated Suggestions
- Confidence-based Analysis

### 📊 Analysis Report

- ATS Match Score
- Shortlisted / Borderline / Rejected Verdict
- Skill Match Analysis
- Missing Skills Detection
- Resume Improvement Suggestions
- Section-wise Score Breakdown
- AI-Assisted Analysis Badge

### 📈 Dashboard

#### User Dashboard

- Total Uploaded Resumes
- Analysis History
- Average ATS Score
- Recent Reports

#### Admin Dashboard

- Total Users
- Total Resumes
- Total Reports
- Overall Analytics
- Manage Jobs

---

# 🏗️ System Architecture

```
                    User
                      │
                      ▼
          React + Vite Frontend
                      │
                Axios API Calls
                      │
                      ▼
         Node.js + Express Backend
          │        │          │
          │        │          │
          ▼        ▼          ▼
   MongoDB     Resume NLP   Gemini AI
    Atlas      (TF-IDF)     (Fallback)
```

---

# 🛠️ Tech Stack

## Frontend

- React.js
- Vite
- React Router DOM
- Axios
- Chart.js
- React ChartJS 2
- React Dropzone
- Vanilla CSS

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Multer
- pdf-parse
- Mammoth
- Natural (TF-IDF)
- Google Gemini API

## Database

- MongoDB Atlas

---

# 📂 Project Structure

```
Resume_Analyzer
│
├── client
│   ├── public
│   └── src
│       ├── api
│       ├── components
│       ├── context
│       ├── pages
│       ├── App.jsx
│       └── main.jsx
│
├── server
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── services
│   ├── uploads
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/SarveshKamboji/Resume_Analyzer.git

cd Resume_Analyzer
```

---

## Backend Setup

```bash
cd server

npm install
```

Create a `.env` file inside the `server` folder:

```env
PORT=5000

MONGO_URI=your_mongodb_connection

JWT_SECRET=your_secret_key

GEMINI_API_KEY=your_google_gemini_api_key
```

Start the backend:

```bash
npm run dev
```

---

## Frontend Setup

```bash
cd client

npm install

npm run dev
```

---

# 🔐 Environment Variables

```env
PORT=

MONGO_URI=

JWT_SECRET=

GEMINI_API_KEY=
```

---

# 📊 Analysis Workflow

```
Resume Upload
      │
      ▼
Extract Resume Text
      │
      ▼
Skill Extraction
      │
      ▼
TF-IDF Similarity
      │
      │
      ├─────────────── High Confidence
      │
      ▼
Generate ATS Report
      │
      │
      └─────────────── Low Confidence
                      │
                      ▼
              Google Gemini API
                      │
                      ▼
          AI Enhanced Resume Analysis
                      │
                      ▼
               Final Analysis Report
```

---

# 📸 Screenshots

> Screenshots will be added after the UI is completed.

- Landing Page
- Login
- Dashboard
- Resume Upload
- Analysis Result
- Admin Dashboard

---

# 🚀 Future Enhancements

- AWS S3 / Cloudinary Storage
- Docker Deployment
- CI/CD using GitHub Actions
- Redis Caching
- Resume Version History
- Email Notifications
- Interview Question Generator
- Company-wise ATS Templates
- Multi-language Resume Support

---

# 🎯 Learning Outcomes

This project demonstrates:

- Full Stack MERN Development
- REST API Development
- Authentication & Authorization
- Role-Based Access Control
- MongoDB Data Modeling
- Resume Parsing
- Natural Language Processing
- Google Gemini API Integration
- Data Visualization
- Secure File Upload
- Production-ready Architecture

---

# 👨‍💻 Author

**Sarvesh Kamboji**

- GitHub: https://github.com/SarveshKamboji
- LinkedIn: www.linkedin.com/in/sarveshkamboji

---

# ⭐ Support

If you found this project helpful, consider giving it a ⭐ on GitHub.
