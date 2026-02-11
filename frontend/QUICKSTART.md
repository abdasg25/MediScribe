# MediScribe Frontend - Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Install Node.js

Check if Node.js is installed:
```bash
node --version  # Should be 18.x or higher
```

If not installed, download from https://nodejs.org

### Step 2: Install Dependencies

```bash
cd /Users/abdulrehman/Documents/MediScribe/frontend
npm install
```

This will install:
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Axios
- React Hook Form
- And more...

### Step 3: Check Environment Variables

File `.env.local` should contain:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=MediScribe
```

Already configured! ✅

### Step 4: Make Sure Backend is Running

Before starting frontend, ensure backend is running:

```bash
# In another terminal
cd /Users/abdulrehman/Documents/MediScribe/backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend should be available at: http://localhost:8000

### Step 5: Start Frontend

```bash
npm run dev
```

Open browser: http://localhost:3000

You should see the MediScribe landing page! 🎉

## ✅ What You Can Test

### 1. Landing Page
- Visit: http://localhost:3000
- See features, how it works, etc.

### 2. Sign Up
- Click "Sign Up" button
- Fill in the form:
  - First Name: John
  - Last Name: Doe
  - Email: doctor@test.com
  - Specialization: Cardiology
  - Password: testpass123
  - Confirm Password: testpass123
- Click "Create Account"
- Should redirect to dashboard

### 3. Dashboard
- After signup, you should see:
  - Welcome message
  - Stats cards (all showing 0)
  - Quick actions (New Recording, Generate Letter)
  - Recent activity (empty)

### 4. Logout & Login
- Click "Logout" in header
- Should redirect to login page
- Login with:
  - Email: doctor@test.com
  - Password: testpass123
- Should redirect back to dashboard

## 🎨 Pages Available

| URL | Description |
|-----|-------------|
| http://localhost:3000 | Landing page |
| http://localhost:3000/auth/login | Login page |
| http://localhost:3000/auth/signup | Signup page |
| http://localhost:3000/dashboard | Dashboard (protected) |
| http://localhost:3000/recording | Recordings (protected) |
| http://localhost:3000/letters | Letters (protected) |

## 🔍 Development Tools

### Check Console
Open browser DevTools (F12) to see:
- Network requests to backend
- Any errors
- API responses

### Check Network Tab
See all API calls:
- POST /api/auth/signup
- POST /api/auth/login
- GET /api/auth/me

## 🐛 Troubleshooting

### Backend Not Running

**Error**: `Network Error` or `ERR_CONNECTION_REFUSED`

**Solution**:
```bash
# Start backend first
cd /Users/abdulrehman/Documents/MediScribe/backend
source venv/bin/activate
uvicorn app.main:app --reload
```

### Port Already in Use

**Error**: `Port 3000 is already in use`

**Solution**:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- -p 3001
```

### TypeScript Errors

**Error**: Type errors in code

**Solution**:
```bash
# Delete node_modules and reinstall
rm -rf node_modules
rm package-lock.json
npm install
```

### Styling Not Working

**Error**: Tailwind classes not applying

**Solution**:
```bash
# Restart dev server
# Press Ctrl+C to stop
npm run dev
```

## 📱 Mobile Testing

Test on mobile:
1. Find your local IP: `ipconfig getifaddr en0`
2. Visit: `http://YOUR_IP:3000` on mobile
3. Make sure you're on same Wi-Fi network

## 🎯 Next Steps

Once frontend is working:

1. ✅ Test signup/login flow
2. ✅ Verify dashboard loads
3. ✅ Check responsive design (resize browser)
4. ✅ Test on different browsers

Then you're ready for:

**Phase 2**: Implement audio recording and transcription
**Phase 3**: Implement letter generation

## 📚 Useful Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Format code (if prettier installed)
npx prettier --write .
```

## 🎉 Success!

If you can:
- ✅ See landing page
- ✅ Sign up new user
- ✅ Login
- ✅ See dashboard
- ✅ Logout

**You're all set!** Frontend Phase 1 is complete! 🚀

---

Need help? Check [README.md](README.md) for detailed documentation.
