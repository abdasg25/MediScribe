# Clinical Documentation Assistant - Visual Architecture

## SYSTEM ARCHITECTURE DIAGRAM

```
┌──────────────────────────────────────────────────────────────────┐
│                         USERS/CLIENTS                            │
│                  (Doctors, Medical Professionals)                │
└──────────────────────────┬───────────────────────────────────────┘
                           │ Browser (HTTPS)
                           │
┌──────────────────────────▼───────────────────────────────────────┐
│                   FRONTEND LAYER (Vercel)                        │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Next.js Application                                    │    │
│  │  ├─ Landing Page                                       │    │
│  │  ├─ Auth Pages (Login/Signup)                          │    │
│  │  ├─ Dashboard                                          │    │
│  │  ├─ Recording Management                               │    │
│  │  ├─ Letter Generation & Management                     │    │
│  │  └─ User Profile                                       │    │
│  │                                                         │    │
│  │  Technology:                                            │    │
│  │  • React 18 (UI Components)                            │    │
│  │  • Next.js (Framework)                                 │    │
│  │  • Tailwind CSS (Styling)                              │    │
│  │  • React Hook Form (Forms)                             │    │
│  │  • jsPDF + docx (Document Export)                      │    │
│  │  • Axios (HTTP Client)                                 │    │
│  └─────────────────────────────────────────────────────────┘    │
└──────────────────────────┬───────────────────────────────────────┘
                           │ REST API (HTTPS)
                           │ ~25 Endpoints
                           │
┌──────────────────────────▼───────────────────────────────────────┐
│                   BACKEND LAYER (Railway)                        │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  FastAPI Application (Python)                           │    │
│  │                                                         │    │
│  │  ┌───────────────────────────────────────────────────┐ │    │
│  │  │ API Routes                                        │ │    │
│  │  │ ├─ /api/auth/* (Authentication)                 │ │    │
│  │  │ ├─ /api/audio/* (Audio Management)              │ │    │
│  │  │ ├─ /api/transcription/* (Speech-to-Text)        │ │    │
│  │  │ ├─ /api/letters/* (Letter CRUD)                 │ │    │
│  │  │ ├─ /api/templates/* (Template Management)       │ │    │
│  │  │ └─ /api/user/* (User Management)                │ │    │
│  │  └───────────────────────────────────────────────────┘ │    │
│  │                                                         │    │
│  │  ┌───────────────────────────────────────────────────┐ │    │
│  │  │ Services & Middleware                            │ │    │
│  │  │ ├─ JWT Authentication Middleware                 │ │    │
│  │  │ ├─ Pydantic Validation                           │ │    │
│  │  │ ├─ Error Handling                                │ │    │
│  │  │ ├─ CORS Configuration                            │ │    │
│  │  │ ├─ Rate Limiting                                 │ │    │
│  │  │ └─ Logging & Audit Trails                        │ │    │
│  │  └───────────────────────────────────────────────────┘ │    │
│  │                                                         │    │
│  │  ┌───────────────────────────────────────────────────┐ │    │
│  │  │ Core Services                                    │ │    │
│  │  │ ├─ AudioService (Upload, Processing)            │ │    │
│  │  │ ├─ TranscriptionService (Whisper Integration)   │ │    │
│  │  │ ├─ LetterService (AI Generation, CRUD)          │ │    │
│  │  │ ├─ ExportService (PDF/Word Generation)          │ │    │
│  │  │ ├─ AuthService (JWT, Hashing)                   │ │    │
│  │  │ └─ UserService (Profile, Settings)              │ │    │
│  │  └───────────────────────────────────────────────────┘ │    │
│  │                                                         │    │
│  │  Technology:                                            │    │
│  │  • FastAPI (Web Framework)                            │    │
│  │  • SQLAlchemy (ORM)                                   │    │
│  │  • Pydantic (Validation)                              │    │
│  │  • PyJWT (Authentication)                             │    │
│  │  • python-multipart (File Upload)                     │    │
│  │  • OpenAI Whisper (Speech-to-Text)                    │    │
│  │  • Anthropic SDK (Claude API)                         │    │
│  └─────────────────────────────────────────────────────────┘    │
└──────────────────────────┬───────────────────────────────────────┘
           │               │               │
           │ SQL           │ File Storage  │ API Calls
           │               │               │
    ┌──────▼─┐      ┌──────▼────────┐  ┌──▼──────────────┐
    │PostgreSQL     │ Server Storage │  │ External APIs  │
    │              │ (Audio files)   │  │                │
    │ - Users       │                │  │ ├─ Claude API  │
    │ - Audio       │ /uploads/      │  │ ├─ Whisper API │
    │ - Trans.      │ ├─ audio_1.mp3 │  │ └─ SMTP Email  │
    │ - Letters     │ ├─ audio_2.mp3 │  │                │
    │ - Templates   │ └─ audio_3.mp3 │  └────────────────┘
    │ - Audit logs  │                │
    │               │ Encrypted      │
    └───────────────┘ Backups        │
                      Automatic      │
```

---

## DATA FLOW DIAGRAMS

### Flow 1: Recording & Transcription

```
User
  │
  └─ Clicks "Record Consultation"
     │
     └─ /recording/new (Frontend)
        │
        ├─ Audio Recorder (Browser's MediaRecorder API)
        │  └─ Records audio from microphone
        │
        └─ Clicks "Upload"
           │
           ├─ POST /api/audio/upload
           │  │
           │  └─ FastAPI Backend
           │     │
           │     ├─ Validate file (type, size)
           │     ├─ Save to /uploads/ directory
           │     ├─ Create audio_files DB record
           │     ├─ Return file ID
           │     │
           │     └─ ASYNC: Start Transcription Job
           │        │
           │        ├─ Load Whisper model
           │        ├─ Process audio file
           │        ├─ Extract text
           │        ├─ Save to transcriptions table
           │        └─ Update audio_files status
           │
           └─ Frontend polls GET /api/audio/{id}
              │
              └─ Shows transcription when ready
                 │
                 └─ User sees text
                    ├─ Can edit transcription
                    └─ Can generate letter
```

### Flow 2: Letter Generation

```
User selects Recording + Template
  │
  └─ Clicks "Generate Letter"
     │
     ├─ POST /api/letters/generate
     │  │
     │  └─ FastAPI Backend
     │     │
     │     ├─ Get audio details
     │     ├─ Get transcription text
     │     ├─ Get template
     │     │
     │     ├─ Build AI Prompt:
     │     │  "You are a medical secretary.
     │     │   Convert this consultation:
     │     │   [transcription_text]
     │     │   Into this letter format:
     │     │   [template]"
     │     │
     │     ├─ Call Claude API (or local Ollama)
     │     │  └─ AI generates letter text
     │     │
     │     ├─ Save to letters table:
     │     │  ├─ user_id
     │     │  ├─ audio_id
     │     │  ├─ template_id
     │     │  ├─ generated_text (AI output)
     │     │  └─ status: "draft"
     │     │
     │     └─ Return generated letter
     │
     └─ Frontend displays letter
        │
        ├─ User can edit text
        │  └─ PUT /api/letters/{id}
        │     └─ Saves edited_text
        │
        └─ User can export
           ├─ POST /api/letters/{id}/export/pdf
           │  └─ Returns PDF file
           │
           └─ POST /api/letters/{id}/export/docx
              └─ Returns Word document
```

### Flow 3: User Authentication

```
New User
  │
  └─ Visits landing page
     │
     └─ Clicks "Sign Up"
        │
        ├─ /auth/signup page
        │
        ├─ Fills form:
        │  ├─ Email
        │  ├─ Password (validated: 8+ chars, uppercase, number, symbol)
        │  ├─ First Name
        │  └─ Last Name
        │
        ├─ Clicks "Create Account"
        │
        ├─ POST /api/auth/signup
        │  │
        │  └─ FastAPI Backend
        │     │
        │     ├─ Validate inputs
        │     ├─ Check email unique
        │     ├─ Hash password (bcrypt)
        │     ├─ Create user in DB
        │     │
        │     ├─ Generate JWT token:
        │     │  {
        │     │    "alg": "HS256",
        │     │    "sub": "user_id",
        │     │    "exp": timestamp_24h_from_now
        │     │  }
        │     │
        │     └─ Return:
        │        {
        │          "access_token": "eyJhbGc...",
        │          "user": {...}
        │        }
        │
        ├─ Frontend stores token
        │  └─ localStorage.setItem("token", access_token)
        │
        └─ Redirects to /dashboard
           │
           └─ All future requests include token:
              Headers: {
                "Authorization": "Bearer eyJhbGc..."
              }
```

---

## DATABASE RELATIONSHIP DIAGRAM

```
┌─────────────────────┐
│      USERS          │
├─────────────────────┤
│ id (UUID)           │◄─────┐
│ email (UNIQUE)      │      │
│ password_hash       │      │
│ firstName           │      │
│ lastName            │      │
│ role                │      │
│ specialization      │      │
│ created_at          │      │
└─────────────────────┘      │
           │                 │
           │ 1:N (owns)      │
           │                 │
    ┌──────┴──────────────────┴──────────────┐
    │                                        │
    ▼                                        ▼
┌──────────────────────┐         ┌─────────────────────┐
│   AUDIO_FILES        │         │ LETTERS             │
├──────────────────────┤         ├─────────────────────┤
│ id (UUID)            │         │ id (UUID)           │
│ user_id (FK) ────┐   │         │ user_id (FK) ──┐   │
│ file_name        │   │         │ audio_id (FK) ──┘   │
│ file_path        │   │         │ template_id (FK) ──┐
│ duration         │   │         │ generated_text     │
│ status           │   │         │ edited_text        │
│ uploaded_at      │   │         │ status             │
└──────────────────┘   │         │ created_at         │
         │             │         └─────────────────────┘
         │ 1:N         │                  │
         │             │                  │
         ▼             │                  │ N:1 (uses)
    ┌──────────────────┼──┐               │
    │ TRANSCRIPTIONS   │  │               │
    ├──────────────────┤  │         ┌─────┴──────────────┐
    │ id (UUID)        │  │         │                    ▼
    │ audio_id (FK) ───┘  │    ┌──────────────────────┐
    │ text               │    │   TEMPLATES          │
    │ language           │    ├──────────────────────┤
    │ created_at         │    │ id (UUID)            │
    └────────────────────┘    │ name                 │
                              │ description          │
                              │ category             │
                              │ base_prompt          │
                              │ variables (JSON)     │
                              │ is_active            │
                              │ created_at           │
                              └──────────────────────┘

┌─────────────────────────────────────────────────────┐
│            AUDIT_LOGS (GDPR Compliance)            │
├─────────────────────────────────────────────────────┤
│ id (UUID)                                           │
│ user_id (FK to USERS)                              │
│ action (user.login, audio.uploaded, letter.gen)   │
│ resource_type (user, audio, letter)                │
│ resource_id (UUID)                                 │
│ ip_address                                          │
│ created_at                                          │
└─────────────────────────────────────────────────────┘

Relationships:
- USERS → AUDIO_FILES (1:N) - User has many audio files
- USERS → LETTERS (1:N) - User has many letters
- AUDIO_FILES → TRANSCRIPTIONS (1:N) - Audio has one transcription
- AUDIO_FILES → LETTERS (1:N) - Audio can be used for multiple letters
- TEMPLATES → LETTERS (1:N) - Template used for multiple letters
- USERS → AUDIT_LOGS (N:1) - All actions logged for user
```

---

## COMPONENT TREE STRUCTURE

```
App
├─ AuthContext (Global state)
├─ Layout
│  ├─ Header
│  │  ├─ Logo
│  │  ├─ Navigation
│  │  └─ UserMenu
│  │     ├─ Profile Link
│  │     ├─ Settings Link
│  │     └─ Logout Button
│  │
│  ├─ Sidebar (if authenticated)
│  │  ├─ Dashboard Link
│  │  ├─ Recording Link
│  │  ├─ Letter Link
│  │  ├─ Template Link
│  │  └─ Profile Link
│  │
│  └─ Main Content
│     │
│     ├─ if (/landing) LandingPage
│     │  ├─ Hero
│     │  ├─ Features
│     │  ├─ HowItWorks
│     │  └─ Footer
│     │
│     ├─ if (/auth/login) LoginPage
│     │  └─ LoginForm
│     │     ├─ EmailInput
│     │     ├─ PasswordInput
│     │     ├─ SubmitButton
│     │     └─ ErrorAlert
│     │
│     ├─ if (/dashboard) DashboardPage
│     │  ├─ StatsCard (x4)
│     │  ├─ QuickActions
│     │  │  ├─ NewRecordingButton
│     │  │  └─ NewLetterButton
│     │  └─ RecentActivity
│     │
│     ├─ if (/recording/new) RecordingPage
│     │  └─ AudioRecorder
│     │     ├─ Microphone Input
│     │     ├─ Timer
│     │     ├─ Waveform Visualization
│     │     ├─ StartButton
│     │     ├─ StopButton
│     │     └─ UploadButton
│     │
│     ├─ if (/recording/list) RecordingListPage
│     │  ├─ FilterButtons
│     │  ├─ SearchBar
│     │  ├─ RecordingList
│     │  │  ├─ RecordingCard (x N)
│     │  │  │  ├─ FileName
│     │  │  │  ├─ Duration
│     │  │  │  ├─ Status Badge
│     │  │  │  └─ ActionButtons
│     │  │  └─ Pagination
│     │
│     ├─ if (/letter/new) LetterGeneratorPage
│     │  ├─ Step 1: RecordingSelector
│     │  ├─ Step 2: TemplateSelector
│     │  │  ├─ TemplateCard (x5)
│     │  │  │  ├─ Name
│     │  │  │  ├─ Description
│     │  │  │  └─ SelectButton
│     │  ├─ Step 3: GeneratingLoader
│     │  └─ Step 4: LetterEditor
│     │     ├─ RichTextEditor
│     │     ├─ SaveButton
│     │     └─ ExportButtons
│     │
│     └─ if (/profile) ProfilePage
│        ├─ ProfileForm
│        │  ├─ FirstNameInput
│        │  ├─ LastNameInput
│        │  ├─ SpecializationInput
│        │  └─ SaveButton
│        ├─ PasswordChangeForm
│        └─ DangerZone
│           ├─ ExportDataButton
│           └─ DeleteAccountButton
```

---

## DEPLOYMENT ARCHITECTURE

```
┌─────────────────────────────────────────────────────────┐
│                   INTERNET / USERS                      │
└──────────┬──────────────────────────────────┬───────────┘
           │ HTTPS                            │ HTTPS
           │                                  │
┌──────────▼─────────────────┐    ┌──────────▼──────────────┐
│  Vercel (Frontend CDN)      │    │ Railway (Backend)       │
│                             │    │                        │
│  ├─ yourapp.com            │    │ ├─ api.yourapp.com     │
│  ├─ Static Files           │    │ ├─ FastAPI Server      │
│  ├─ Next.js Optimization   │    │ ├─ Auto-Restart        │
│  ├─ Global CDN             │    │ ├─ Logs & Monitoring   │
│  ├─ Environment Variables  │    │ └─ Environment Vars    │
│  │  - NEXT_PUBLIC_API_URL  │    │                        │
│  └─ Auto Deploy on Push    │    │ Auto Deploy on Push    │
│                             │    └──────────┬─────────────┘
│                             │               │ SQL
│                             │               │
│                             │    ┌──────────▼──────────────┐
│                             │    │  PostgreSQL (Railway)   │
│                             │    │                        │
│                             │    │  ├─ Automated Backups  │
│                             │    │  ├─ SSL Encryption     │
│                             │    │  ├─ Point-in-time      │
│                             │    │  │  Recovery           │
│                             │    │  ├─ Tables:            │
│                             │    │  │  - users            │
│                             │    │  │  - audio_files      │
│                             │    │  │  - transcriptions   │
│                             │    │  │  - letters          │
│                             │    │  │  - templates        │
│                             │    │  │  - audit_logs       │
│                             │    │  └─ Connections: 20    │
│                             │    └─────────────────────────┘
│                             │
│                             └─ Storage: /uploads/
│                                ├─ Audio files
│                                ├─ Exports (temp)
│                                └─ Size: Growing
```

---

## SECURITY LAYERS

```
Layer 1: Network
├─ HTTPS Only (TLS 1.3)
├─ Vercel DDoS Protection
└─ Railway Firewall

Layer 2: Frontend
├─ JWT Token Storage (localStorage)
├─ XSS Protection (Sanitization)
├─ CSRF Token (if needed)
└─ Input Validation

Layer 3: API
├─ JWT Verification
├─ Rate Limiting (100 req/min)
├─ CORS Whitelist
├─ Input Validation (Pydantic)
├─ SQL Injection Prevention (ORM)
└─ Audit Logging

Layer 4: Database
├─ Password Hashing (bcrypt)
├─ Encrypted Connections
├─ Row-level Security
├─ Automatic Backups
└─ ACID Compliance

Layer 5: Application
├─ Error Handling (no leaks)
├─ Secrets Management (env vars)
├─ Dependency Scanning
└─ Regular Updates
```

---

## SCALABILITY ROADMAP

```
Current (MVP Phase):
├─ Single server instance
├─ PostgreSQL on Railway
├─ File storage local
└─ ~100 concurrent users

Phase 2 (Growth):
├─ Load balancer
├─ Multiple server instances
├─ CDN for file storage (S3)
├─ Database read replicas
└─ ~1000 concurrent users

Phase 3 (Scale):
├─ Kubernetes orchestration
├─ Microservices (auth, audio, letters)
├─ Database clustering
├─ Queue system (Redis)
├─ Caching layer (Redis)
└─ ~10,000+ concurrent users
```

---

This architecture is:
- ✅ Secure (HTTPS, JWT, encryption)
- ✅ Scalable (microservices ready)
- ✅ Maintainable (clear separation of concerns)
- ✅ Professional (healthcare-grade)
- ✅ GDPR-compliant (audit logs, data export)
