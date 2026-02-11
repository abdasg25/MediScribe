# MediScribe Frontend

Modern, responsive frontend for MediScribe - Clinical Documentation Assistant built with Next.js 14, React 18, and TypeScript.

## ✅ What's Implemented

**Phase 1: Frontend Foundation** is complete with:

- ✅ Next.js 14 with App Router
- ✅ TypeScript configuration
- ✅ Tailwind CSS styling
- ✅ Authentication (Login/Signup)
- ✅ Protected routes
- ✅ Responsive design
- ✅ Reusable components
- ✅ API integration with backend
- ✅ JWT token management

## 📁 Project Structure

```
frontend/
├── app/                           # Next.js App Router
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Landing page
│   ├── globals.css                # Global styles
│   ├── auth/
│   │   ├── login/page.tsx         # Login page
│   │   └── signup/page.tsx        # Signup page
│   ├── dashboard/page.tsx         # Dashboard
│   ├── recording/page.tsx         # Recordings list
│   └── letters/page.tsx           # Letters list
│
├── components/                    # Reusable components
│   ├── auth/
│   │   ├── LoginForm.tsx          # Login form
│   │   └── SignupForm.tsx         # Signup form
│   └── shared/
│       ├── Button.tsx             # Button component
│       ├── Input.tsx              # Input component
│       ├── Card.tsx               # Card component
│       └── Header.tsx             # Header/Navigation
│
├── lib/                           # Utilities
│   ├── api.ts                     # Axios instance
│   ├── auth.ts                    # Auth utilities
│   └── utils.ts                   # Helper functions
│
├── types/                         # TypeScript types
│   ├── user.ts                    # User types
│   ├── audio.ts                   # Audio types
│   └── letter.ts                  # Letter types
│
├── package.json                   # Dependencies
├── tsconfig.json                  # TypeScript config
├── tailwind.config.ts             # Tailwind config
├── next.config.js                 # Next.js config
├── .env.local                     # Environment variables
└── .gitignore                     # Git ignore
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- Backend server running on http://localhost:8000

### Installation

```bash
cd /Users/abdulrehman/Documents/MediScribe/frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Environment Variables

Create `.env.local` file (already created) with:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=MediScribe
```

## 📦 Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| next | ^14.1.0 | React framework |
| react | ^18.2.0 | UI library |
| typescript | ^5.3.3 | Type safety |
| tailwindcss | ^3.4.1 | Styling |
| axios | ^1.6.5 | HTTP client |
| react-hook-form | ^7.49.3 | Form management |
| lucide-react | ^0.312.0 | Icons |
| jspdf | ^2.5.1 | PDF export |
| docx | ^8.5.0 | Word export |

## 🎨 Design System

### Colors

- **Primary**: Blue (#0ea5e9)
- **Secondary**: Gray (#6b7280)
- **Success**: Green (#10b981)
- **Danger**: Red (#ef4444)

### Components

All components are located in `components/` and follow this pattern:

```typescript
// Shared components
<Button variant="primary" size="md">Click me</Button>
<Input label="Email" type="email" />
<Card title="Title">Content</Card>

// Auth components
<LoginForm />
<SignupForm />
```

## 🛣️ Routes

| Route | Description | Auth Required |
|-------|-------------|---------------|
| `/` | Landing page | No |
| `/auth/login` | Login page | No |
| `/auth/signup` | Signup page | No |
| `/dashboard` | Dashboard | Yes |
| `/recording` | Recordings list | Yes |
| `/letters` | Letters list | Yes |

## 🔐 Authentication Flow

1. User signs up or logs in
2. Backend returns JWT token
3. Token stored in `localStorage`
4. Token included in all API requests via Axios interceptor
5. Protected routes check for token
6. Automatic redirect to login if token missing/invalid

## 📱 Responsive Design

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

All components are fully responsive using Tailwind's breakpoint system.

## 🎯 Features Implemented

### ✅ Phase 1 (Current)

- [x] Landing page with features
- [x] User authentication (login/signup)
- [x] Protected dashboard
- [x] Responsive header/navigation
- [x] Form validation
- [x] Error handling
- [x] Loading states
- [x] TypeScript types
- [x] API integration

### 🔜 Phase 2 (Next)

- [ ] Audio recording component
- [ ] Audio file upload
- [ ] Recording management
- [ ] Transcription display

### 🔜 Phase 3 (Later)

- [ ] Letter generation
- [ ] Letter editor
- [ ] PDF/Word export
- [ ] Template management

## 🧪 Testing

```bash
# Run linter
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

## 📝 Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Next.js recommended config
- **Formatting**: Prettier (install extension)
- **Naming**: camelCase for variables, PascalCase for components

## 🏗️ Architecture Decisions

### Why Next.js 14?

- ✅ App Router for better performance
- ✅ Server-side rendering
- ✅ Built-in routing
- ✅ Image optimization
- ✅ Easy deployment to Vercel

### Why Tailwind CSS?

- ✅ Utility-first approach
- ✅ No CSS files to manage
- ✅ Rapid development
- ✅ Small bundle size
- ✅ Easy customization

### Why React Hook Form?

- ✅ Better performance
- ✅ Less re-renders
- ✅ Built-in validation
- ✅ TypeScript support
- ✅ Small bundle size

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Environment Variables (Production)

Set in Vercel dashboard:

```
NEXT_PUBLIC_API_URL=https://your-backend-api.com
NEXT_PUBLIC_APP_NAME=MediScribe
```

## 🐛 Common Issues

### API Connection Error

**Problem**: Cannot connect to backend
**Solution**: Ensure backend is running on http://localhost:8000

### TypeScript Errors

**Problem**: Type errors in components
**Solution**: Run `npm install` to ensure all types are installed

### Tailwind Not Working

**Problem**: Styles not applying
**Solution**: Check `tailwind.config.ts` includes all content paths

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Hook Form](https://react-hook-form.com/)
- [TypeScript](https://www.typescriptlang.org/docs/)

## 🤝 Contributing

1. Follow the existing code structure
2. Use TypeScript for all new files
3. Add proper types for all functions
4. Use Tailwind for styling
5. Test on mobile and desktop

---

**Status**: Phase 1 ✅ Complete | Ready for Phase 2 Development
