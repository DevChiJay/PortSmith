# 🚀 APISmith Frontend - Developer Portal

A modern API developer portal for managing API keys, accessing documentation, and monitoring API usage. Built with Next.js 15, React 19, and TypeScript.

![APISmith](https://placehold.co/800x400?text=APISmith+Developer+Portal)

---

## � Documentation Files

This frontend has three key documentation files to guide development:

### 1. **copilot-instructions.md** 
Comprehensive guide for AI-assisted development including:
- Project architecture and tech stack
- Component organization patterns
- TypeScript conventions
- API integration patterns
- Security considerations
- Code style guidelines

**Use this**: As context for Copilot when working on any feature

### 2. **PROMPTS.md**
Phase-based implementation prompts for major features:
- **Phase 1**: JWT Authentication (CRITICAL)
- **Phase 2**: Branding & Identity
- **Phase 3**: Core Features
- **Phase 4**: UI/UX Polish
- **Phase 5**: Advanced Features

**Use this**: Copy and paste entire phase prompts to AI agents to implement features

### 3. **README.md** (this file)
Quick reference and getting started guide

---

## 🎯 Current Status

| Component | Status | Priority |
|-----------|--------|----------|
| Backend JWT Auth | ✅ Complete | - |
| Frontend JWT Auth | ⏳ Pending | 🔴 CRITICAL |
| Branding | ⏳ Pending | 🟠 HIGH |
| Core Features | ⏳ Pending | 🟠 HIGH |
| UI/UX Polish | ⏳ Pending | 🟡 MEDIUM |
| Advanced Features | ⏳ Pending | 🟢 LOW |

---

## � Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- Backend running on http://localhost:5000

### Installation

```bash
# Install dependencies
pnpm install

# Create environment file
cp .env.example .env.local

# Update .env.local with:
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=APISmith
```

### Development

```bash
# Start development server
pnpm dev

# Open browser to http://localhost:3000
```

---

## 📋 Implementation Workflow

### Step 1: Read the Documentation
```bash
# Open in VS Code
code copilot-instructions.md
code PROMPTS.md
```

### Step 2: Start with Phase 1 (CRITICAL)
Phase 1 must be completed before any other work as it establishes authentication.

**To implement with AI agent:**
1. Open `PROMPTS.md`
2. Copy the entire **Phase 1: JWT Authentication Migration** section
3. Paste into your AI assistant (Copilot Chat, ChatGPT, etc.)
4. The agent will implement step-by-step

**Manual implementation:**
Follow the detailed steps in Phase 1 prompt:
- Create auth context
- Build API client hook
- Update middleware
- Create login/signup pages
- Test authentication flow

### Step 3: Continue with Remaining Phases
After Phase 1 is complete and tested:
- Phase 2: Rebranding (1-2 days)
- Phase 3: Core features (3-4 days)
- Phase 4: UI polish (2-3 days)
- Phase 5: Advanced features (3-5 days)

---

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth pages (login, signup)
│   │   ├── (portal)/          # Protected dashboard
│   │   ├── (legal)/           # Privacy, terms
│   │   └── admin/             # Admin panel
│   ├── components/             # React components
│   │   ├── Dashboard/         # Dashboard-specific
│   │   ├── Docs/              # Documentation system
│   │   ├── ApiDocs/           # API details
│   │   └── ui/                # shadcn/ui components
│   ├── hooks/                  # Custom React hooks
│   │   ├── use-api-client.ts  # API requests with auth
│   │   ├── use-auth.ts        # Authentication
│   │   └── use-toast.ts       # Notifications
│   └── lib/                    # Utilities
│       ├── auth-context.tsx   # Auth provider
│       └── utils.ts           # Helper functions
├── public/                     # Static assets
├── copilot-instructions.md     # Dev guide
├── PROMPTS.md                  # Implementation prompts
└── package.json
```

---

## � Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui (Radix UI)
- **Icons**: lucide-react
- **Forms**: react-hook-form + zod
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Theme**: next-themes

---

## 🌐 Backend Integration

The frontend communicates with the backend API at:
- **Development**: http://localhost:5000
- **Production**: Set via `NEXT_PUBLIC_API_URL`

### API Endpoints Used

**Authentication:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

**API Keys:**
- `GET /api/keys` - List user's keys
- `POST /api/keys` - Create new key
- `GET /api/keys/:id` - Get key details
- `PUT /api/keys/:id` - Update key
- `POST /api/keys/:id/revoke` - Revoke key
- `GET /api/keys/:id/metrics` - Get usage metrics

**API Catalog:**
- `GET /api/apis` - List available APIs
- `GET /api/apis/:slug` - Get API details

---

## 🧪 Testing

### Manual Testing Checklist

**Authentication:**
- [ ] Can register new account
- [ ] Can login with email/password
- [ ] Invalid credentials show error
- [ ] Protected routes redirect to login
- [ ] Logout clears session

**API Keys:**
- [ ] Can create new API key
- [ ] Key shows full value once
- [ ] Key is masked after creation
- [ ] Can copy key to clipboard
- [ ] Can revoke key with confirmation
- [ ] Metrics display correctly

**UI/UX:**
- [ ] Mobile responsive
- [ ] Dark mode works
- [ ] Loading states show
- [ ] Error messages display
- [ ] Forms validate properly

---

## 📝 Development Guidelines

### Adding a New Component

```tsx
// src/components/MyComponent.tsx
'use client' // If interactive

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

interface MyComponentProps {
  title: string
  onAction?: () => void
}

export function MyComponent({ title, onAction }: MyComponentProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">{title}</h2>
      <Button onClick={onAction} disabled={loading}>
        Action
      </Button>
    </div>
  )
}
```

### Making API Requests

```tsx
'use client'

import { useApiClient } from '@/hooks/use-api-client'
import { useEffect, useState } from 'react'

export function DataComponent() {
  const { request, isLoading, error } = useApiClient()
  const [data, setData] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await request('/api/endpoint')
        setData(result)
      } catch (err) {
        console.error('Failed to fetch:', err)
      }
    }
    fetchData()
  }, [request])

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  
  return <div>{/* Render data */}</div>
}
```

### Form Handling

```tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const schema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
})

export function MyForm() {
  const form = useForm({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: z.infer<typeof schema>) {
    // Handle submission
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Input {...form.register('name')} />
      <Input {...form.register('email')} />
      <Button type="submit">Submit</Button>
    </form>
  )
}
```

---

## 🐛 Troubleshooting

### "Module not found" errors
```bash
# Clear cache and reinstall
rm -rf .next node_modules
pnpm install
```

### API requests failing
- Check backend is running on port 5000
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`
- Check browser console for CORS errors

### Authentication not working
- Ensure JWT_SECRET is set in backend
- Check cookies are being set
- Verify middleware is checking for tokens

---

## 📦 Building for Production

```bash
# Build
pnpm build

# Start production server
pnpm start

# Or deploy to Vercel
vercel deploy
```

---

## 🤝 Contributing

1. Read `copilot-instructions.md` for code standards
2. Follow the phase-based approach in `PROMPTS.md`
3. Test thoroughly before committing
4. Ensure TypeScript compiles without errors
5. Verify dark mode compatibility

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 📞 Support

- **Documentation**: See `copilot-instructions.md`
- **Implementation Guide**: See `PROMPTS.md`
- **Backend API**: http://localhost:5000

---

**Project**: APISmith API Gateway Platform  
**Version**: 2.0.0  
**Last Updated**: January 2025  
**Status**: ⏳ In Development (Backend Complete, Frontend Phase 1 Pending)
