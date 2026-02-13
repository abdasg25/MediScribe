# MediScribe

AI-powered Clinical Documentation Assistant for Healthcare Professionals

## Overview

MediScribe is a comprehensive medical documentation platform that streamlines the creation of clinical letters and medical records. Using advanced AI technologies including OpenAI Whisper for speech-to-text transcription and Google Gemini API for intelligent letter generation, MediScribe transforms audio recordings of medical consultations into professional, formatted clinical documentation.

## Key Features

### Authentication & User Management
- Secure user registration and login with JWT authentication
- Password strength validation and secure hashing (bcrypt)
- User profile management
- Password change functionality
- Protected routes and authorization

### Audio Recording & Transcription
- **Browser-based recording**: Record consultations directly in your browser
- **File upload**: Upload existing audio files (MP3, WAV, M4A, WEBM)
- **AI Transcription**: Powered by OpenAI Whisper for accurate medical transcription
- **Pause/Resume**: Full control over recording sessions
- **Audio preview**: Listen before uploading
- Real-time status tracking

### Medical Letter Generation
- **7 Letter Types**:
  - Referral Letters
  - Consultation Notes
  - Discharge Summaries
  - Medical Reports
  - Prescriptions
  - Sick Notes
  - Custom Letters

- **AI-Powered Generation**: Using Google Gemini API (cloud-based)
- **Patient Information**: Include patient demographics
- **Custom Instructions**: Guide AI output with specific requirements
- **Rich Editing**: Edit generated letters with markdown support
- **Multiple Export Formats**:
  - PDF (formatted documents)
  - DOCX (Microsoft Word)
  - TXT (plain text)

### Dashboard & Analytics
- Real-time statistics:
  - Total recordings count
  - Total letters generated
  - Estimated time saved
  - Weekly activity metrics
- Quick action shortcuts
- Recent activity overview

### User Interface
- Clean, professional medical-grade interface
- Responsive design (desktop and tablet)
- Toast notifications for user feedback
- Loading states and error handling
- Accessible components

## Technology Stack

### Backend
- **Framework**: FastAPI 0.115.6
- **Database**: SQLAlchemy 2.0.46 with SQLite/PostgreSQL
- **Authentication**: JWT with python-jose
- **Password Security**: bcrypt 4.1.2
- **AI/ML**:
  - OpenAI Whisper (base model) for transcription
  - Google Gemini API (gemini-1.5-flash) for letter generation
- **Validation**: Pydantic 2.12.5
- **Server**: Uvicorn (ASGI)

### Frontend
- **Framework**: Next.js 14.1.0
- **UI Library**: React 18.2.0
- **Language**: TypeScript 5.3.3
- **Styling**: Tailwind CSS 3.4.1
- **Forms**: React Hook Form 7.49.3
- **HTTP Client**: Axios 1.6.5
- **Icons**: Lucide React 0.312.0
- **Document Export**:
  - jsPDF 2.5.2 (PDF generation)
  - docx 8.5.0 (Word documents)
  - file-saver 2.0.5

### AI Models
- **Transcription**: OpenAI Whisper (local/base model)
- **Letter Generation**: Google Gemini 1.5 Flash (cloud API)

## Prerequisites

### Required Software
- **Node.js**: 18.x or higher
- **Python**: 3.11 or higher
- **Google Gemini API Key**: Free tier available at https://ai.google.dev/
- **Git**: For version control

### System Requirements
- **RAM**: Minimum 4GB (8GB recommended for Whisper)
- **Storage**: 5GB+ free space (for Whisper model)
- **OS**: macOS, Linux, or Windows with WSL2

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/MediScribe.git
cd MediScribe
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Install Whisper (if not installed)
pip install openai-whisper

# Run setup script
chmod +x setup.sh
./setup.sh
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### 4. Get Google Gemini API Key

```bash
# Visit https://ai.google.dev/ and sign in with your Google account
# Click "Get API Key" and create a new API key
# Copy the API key for the next step
```

## Configuration

### Backend Configuration

Edit `backend/app/core/config.py` or set environment variables:

```python
# Database
DATABASE_URL=sqlite:///./mediscribe.db  # or PostgreSQL URL

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
ALLOWED_ORIGINS=["http://localhost:3000"]

# Google Gemini API
GEMINI_API_KEY=your-gemini-api-key-here
GEMINI_MODEL=gemini-1.5-flash

# File Upload
MAX_UPLOAD_SIZE=100MB
UPLOAD_DIR=./uploads
```

### Frontend Configuration

Edit `frontend/.env`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=MediScribe
```

## Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
uvicorn app.main:app --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 3 - Ollama (if not running):**
```bash
ollama serve
```

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Usage Guide

### 1. User Registration

1. Navigate to http://localhost:3000
2. Click "Sign Up"
3. Fill in your details:
   - Email address
   - Password (8+ characters, uppercase, lowercase, number)
   - First and last name
   - Medical specialization (optional)
4. Click "Create Account"

### 2. Recording Audio

**Option A: Browser Recording**
1. Go to "Recordings" page
2. Click "Record" tab
3. Click "Start Recording"
4. Allow microphone access
5. Speak your consultation notes
6. Use Pause/Resume as needed
7. Click "Stop" when finished
8. Preview the audio
9. Click "Upload Recording"

**Option B: File Upload**
1. Go to "Recordings" page
2. Click "Upload" tab
3. Drag and drop audio file or click to browse
4. Supported formats: MP3, WAV, M4A, WEBM
5. Wait for upload to complete

### 3. Transcription

1. Find your recording in the list
2. Click "Transcribe" button
3. Wait for AI transcription to complete (may take 30-60 seconds)
4. Review and edit transcription if needed

### 4. Generating Letters

1. Go to "Letters" page
2. Select letter type (Referral, Consultation, etc.)
3. Choose a recording with transcription
4. Fill in patient information (optional):
   - Patient name
   - Age
   - Gender
5. Add custom instructions (optional)
6. Click "Generate Letter"
7. Wait for AI generation (10-60 seconds)

### 5. Managing Letters

- **View**: Click on any letter to open the viewer
- **Edit**: Click "Edit" button to modify content
- **Export**: Choose from PDF, DOCX, or TXT formats
- **Copy**: Copy letter text to clipboard
- **Delete**: Remove unwanted letters

### 6. User Settings

1. Click your name in the header
2. Update profile information
3. Change password if needed
4. Click "Save Changes"

## Project Structure

```
MediScribe/
├── backend/
│   ├── app/
│   │   ├── api/              # API route handlers
│   │   │   ├── auth.py       # Authentication endpoints
│   │   │   ├── recordings.py # Recording management
│   │   │   ├── letters.py    # Letter generation
│   │   │   └── stats.py      # Dashboard statistics
│   │   ├── core/             # Core functionality
│   │   │   ├── config.py     # Configuration
│   │   │   ├── security.py   # Security utilities
│   │   │   ├── logger.py     # Logging setup
│   │   │   └── middleware.py # Custom middleware
│   │   ├── models/           # Database models
│   │   │   ├── user.py
│   │   │   ├── recording.py
│   │   │   └── letter.py
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── services/         # Business logic
│   │   │   ├── auth_service.py
│   │   │   ├── transcription_service.py
│   │   │   ├── letter_service.py
│   │   │   ├── ollama_service.py
│   │   │   └── stats_service.py
│   │   ├── database.py       # Database connection
│   │   ├── dependencies.py   # FastAPI dependencies
│   │   └── main.py          # Application entry point
│   ├── uploads/             # Uploaded audio files
│   ├── logs/                # Application logs
│   ├── requirements.txt     # Python dependencies
│   └── setup.sh            # Setup script
├── frontend/
│   ├── app/                 # Next.js app directory
│   │   ├── page.tsx         # Landing page
│   │   ├── dashboard/       # Dashboard page
│   │   ├── recording/       # Recording page
│   │   ├── letters/         # Letters page
│   │   ├── settings/        # User settings
│   │   └── auth/           # Authentication pages
│   ├── components/          # React components
│   │   ├── auth/           # Auth forms
│   │   ├── recordings/     # Recording components
│   │   ├── letters/        # Letter components
│   │   └── shared/         # Shared components
│   ├── lib/                # Utilities
│   │   ├── api.ts          # API client
│   │   ├── auth.ts         # Auth utilities
│   │   └── utils.ts        # Helper functions
│   ├── types/              # TypeScript types
│   ├── package.json        # Node dependencies
│   └── .env               # Environment variables
├── ARCHITECTURE_DIAGRAMS.md
├── TECH_STACK_DEEP_DIVE.md
└── README.md
```

## API Documentation

### Authentication Endpoints

```
POST /api/auth/signup       - Register new user
POST /api/auth/login        - Login and get JWT token
GET  /api/auth/me          - Get current user info
PUT  /api/auth/profile     - Update user profile
POST /api/auth/change-password - Change password
```

### Recording Endpoints

```
POST   /api/recordings/upload      - Upload audio file
GET    /api/recordings            - List user recordings
GET    /api/recordings/{id}       - Get specific recording
POST   /api/recordings/{id}/transcribe - Transcribe audio
DELETE /api/recordings/{id}       - Delete recording
```

### Letter Endpoints

```
POST   /api/letters/generate  - Generate letter from transcription
GET    /api/letters          - List user letters
GET    /api/letters/{id}     - Get specific letter
PATCH  /api/letters/{id}     - Update letter content
DELETE /api/letters/{id}     - Delete letter
```

### Statistics Endpoints

```
GET /api/stats/dashboard - Get dashboard statistics
```

## Database Schema

### Users Table
- id (UUID, Primary Key)
- email (String, Unique)
- password_hash (String)
- first_name (String)
- last_name (String)
- specialization (String, Optional)
- role (String, Default: "doctor")
- created_at (DateTime)

### Recordings Table
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key)
- filename (String)
- file_path (String)
- file_size (Integer)
- duration (Float, Optional)
- transcription (Text, Optional)
- status (String)
- created_at (DateTime)
- updated_at (DateTime)
- transcribed_at (DateTime, Optional)

### Letters Table
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key)
- recording_id (UUID, Foreign Key, Optional)
- letter_type (String)
- title (String)
- content (Text)
- patient_name (String, Optional)
- patient_age (String, Optional)
- patient_gender (String, Optional)
- status (String)
- created_at (DateTime)
- updated_at (DateTime)

## Security Considerations

### Implemented Security Measures

1. **Authentication**: JWT tokens with expiration
2. **Password Security**: bcrypt hashing with salt
3. **Input Validation**: Pydantic schemas for all inputs
4. **CORS**: Configured allowed origins
5. **SQL Injection Prevention**: SQLAlchemy ORM
6. **File Upload Validation**: Type and size checks
7. **Error Handling**: No sensitive data in error messages
8. **HTTPS Ready**: Production deployment support

### Production Recommendations

1. Use strong SECRET_KEY (256-bit random string)
2. Enable HTTPS/TLS for all connections
3. Implement rate limiting
4. Add request size limits
5. Use PostgreSQL instead of SQLite
6. Enable database backups
7. Implement audit logging
8. Add API key authentication for services
9. Use environment variables for all secrets
10. Regular security updates

## Troubleshooting

### Common Issues

**Issue: Ollama connection failed**
```bash
# Solution: Ensure Ollama is running
ollama serve

# Check if Qwen model is installed
ollama list
```

**Issue: Whisper transcription fails**
```bash
# Solution: Install/reinstall Whisper
pip install --upgrade openai-whisper
```

**Issue: Frontend can't connect to backend**
```bash
# Solution: Check CORS settings in backend/app/core/config.py
# Ensure NEXT_PUBLIC_API_URL in frontend/.env matches backend URL
```

**Issue: Database errors**
```bash
# Solution: Delete and recreate database
rm backend/mediscribe.db
# Restart backend - tables will be recreated automatically
```

## Performance Optimization

### Backend
- Use connection pooling for database
- Implement caching for frequent queries
- Optimize Whisper model size (tiny/base for speed, large for accuracy)
- Use background tasks for long-running operations

### Frontend
- Lazy loading for components
- Image optimization
- Code splitting
- Memoization for expensive computations

## Future Enhancements

### Planned Features
- Template management system
- Search and filtering capabilities
- Batch letter generation
- Email integration
- Multi-language support
- Mobile application
- Cloud storage integration (S3/R2)
- Real-time collaboration
- Advanced analytics dashboard
- HIPAA compliance certification

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

### Development Guidelines
- Follow PEP 8 for Python code
- Use ESLint/Prettier for TypeScript/React
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or contributions:
- Create an issue on GitHub
- Email: support@mediscribe.com
- Documentation: See `/docs` folder

## Acknowledgments

- OpenAI Whisper for transcription technology
- Ollama team for local LLM infrastructure
- Alibaba Cloud for Qwen models
- FastAPI and Next.js communities

## Disclaimer

MediScribe is designed as a productivity tool for healthcare professionals. It is not a substitute for professional medical judgment. All generated documentation should be reviewed and verified by qualified medical professionals before use in clinical settings. Ensure compliance with local healthcare regulations and data protection laws (HIPAA, GDPR, etc.) when using this software.

---

Built with care for healthcare professionals worldwide.
