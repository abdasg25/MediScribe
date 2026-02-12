# MediScribe Backend - Phase 1 Setup Guide

## ✅ What's Been Implemented

**Phase 1: Backend Foundation** is complete with:

- ✅ FastAPI application structure
- ✅ PostgreSQL database setup (SQLAlchemy)
- ✅ User authentication (JWT tokens)
- ✅ Password hashing (bcrypt)
- ✅ User registration & login APIs
- ✅ Modular, reusable code architecture
- ✅ Ollama integration for local LLM
- ✅ Configuration management

## 📁 Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                    # FastAPI app entry point
│   ├── database.py                # Database connection
│   ├── dependencies.py            # JWT verification middleware
│   │
│   ├── core/                      # Core utilities
│   │   ├── __init__.py
│   │   ├── config.py              # Environment variables
│   │   └── security.py            # JWT, password hashing
│   │
│   ├── models/                    # Database models
│   │   ├── __init__.py
│   │   └── user.py                # User model
│   │
│   ├── schemas/                   # Pydantic schemas
│   │   ├── __init__.py
│   │   └── user.py                # User validation schemas
│   │
│   ├── api/                       # API routes
│   │   ├── __init__.py
│   │   └── auth.py                # Authentication endpoints
│   │
│   └── services/                  # Business logic
│       ├── __init__.py
│       └── auth_service.py        # Authentication service
│
├── uploads/                       # Audio files (created automatically)
├── requirements.txt               # Python dependencies
├── .env                          # Environment variables
├── .gitignore                    # Git ignore rules
└── README.md                     # This file
```

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
cd /Users/abdulrehman/Documents/MediScribe/backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install all dependencies
pip install -r requirements.txt
```

### 2. Setup Database (Railway)

1. Go to https://railway.app
2. Sign up (free tier available)
3. Click "New Project" → "Provision PostgreSQL"
4. Click on PostgreSQL → "Variables" tab
5. Copy the `DATABASE_URL` value
6. Update `.env` file:

```bash
DATABASE_URL=postgresql://postgres:xxxxx@containers-us-west-xxx.railway.app:5432/railway
```

### 3. Install Ollama & Qwen3

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull Qwen3 model (choose based on your RAM)
ollama pull qwen2.5:7b    # Best quality (~20GB RAM needed)
# OR
ollama pull qwen2.5:14b    # Medium quality (~16GB RAM)
# OR
ollama pull qwen2.5:7b     # Fast, less RAM (~8GB RAM)

# Test Ollama
ollama run qwen2.5:7b "Hello, test message"

# Keep Ollama server running (in separate terminal)
ollama serve
```

### 4. Update .env Configuration

The `.env` file has been pre-configured with:
- ✅ JWT Secret Key (already generated)
- ✅ Ollama settings
- ⚠️ DATABASE_URL (needs Railway URL)

Just update the `DATABASE_URL` with your Railway database URL.

### 5. Run the Backend

```bash
# Terminal 1: Run Ollama server
ollama serve

# Terminal 2: Run FastAPI
cd /Users/abdulrehman/Documents/MediScribe/backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

### 6. Test the API

Open http://localhost:8000/docs in your browser for Swagger UI.

**Available Endpoints:**
- `GET /` - Health check
- `GET /health` - Detailed health check
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user (requires auth)

**Test Signup:**
```json
{
  "email": "doctor@test.com",
  "password": "testpass123",
  "first_name": "John",
  "last_name": "Doe",
  "specialization": "Cardiology"
}
```

## 🔍 Code Architecture Principles

### Modular Design
- **No repeated code**: Shared functions in `services/`
- **Separation of concerns**: Models, Schemas, Services, Routes are separate
- **Reusable components**: Authentication, database connections

### Examples

**Bad Practice:**
```python
# Repeated database query in multiple routes
@router.get("/user1")
def get_user1(email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    ...

@router.get("/user2")
def get_user2(email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()  # Repeated!
    ...
```

**Good Practice:**
```python
# Centralized in service
class AuthService:
    @staticmethod
    def get_user_by_email(db, email):
        return db.query(User).filter(User.email == email).first()

# Reused in routes
@router.get("/user1")
def get_user1(email: str, db: Session = Depends(get_db)):
    user = AuthService.get_user_by_email(db, email)
    ...
```

## 🎯 Next Steps: Phase 2

Once Phase 1 is running successfully, we'll implement:

### Phase 2: Audio & Transcription
- [ ] Audio file upload (mp3, wav, m4a)
- [ ] Audio validation and preprocessing
- [ ] Whisper integration for transcription
- [ ] Long audio handling (chunking)
- [ ] Database models for audio/transcriptions
- [ ] API endpoints for audio management

## 🐛 Troubleshooting

### Database Connection Error
```
sqlalchemy.exc.OperationalError: could not connect to server
```
**Solution:** Make sure DATABASE_URL in `.env` is correct from Railway.

### Ollama Connection Error
```
ConnectionRefusedError: [Errno 61] Connection refused
```
**Solution:** Make sure `ollama serve` is running in a separate terminal.

### Import Errors
```
ModuleNotFoundError: No module named 'app'
```
**Solution:** Make sure you're running from the `backend/` directory and venv is activated.

## 📊 Database Schema (Phase 1)

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    password_hash VARCHAR NOT NULL,
    first_name VARCHAR NOT NULL,
    last_name VARCHAR NOT NULL,
    role VARCHAR DEFAULT 'doctor',
    specialization VARCHAR,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);
```

## 🔒 Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ Bearer token authorization
- ✅ CORS configuration
- ✅ Environment variable management
- ✅ SQL injection protection (SQLAlchemy ORM)

## 📝 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | postgresql://user:pass@host:5432/db |
| SECRET_KEY | JWT secret key | Generated automatically |
| OLLAMA_BASE_URL | Ollama API endpoint | http://localhost:11434 |
| OLLAMA_MODEL | Qwen model name | qwen2.5:7b |
| ALLOWED_ORIGINS | CORS allowed origins | http://localhost:3000 |

---

**Status:** Phase 1 ✅ Complete | Ready for Phase 2 Development
