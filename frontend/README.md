# PortSmith Frontend

Modern API developer portal built with Next.js 15, React 19, and TypeScript.

## Features

- JWT authentication & user sessions
- API catalog browsing & documentation
- API key management dashboard
- Usage metrics & analytics
- Modern UI with Tailwind CSS & Radix UI
- Responsive design & dark mode support

## Quick Start

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Setup

Create `.env.local` file with:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=PortSmith
```

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: React 19, Tailwind CSS, Radix UI
- **Forms**: React Hook Form + Zod validation
- **State**: React Query for server state
- **Auth**: JWT with HTTP-only cookies

## Project Structure

- `src/app/` - Next.js app router pages
- `src/components/` - Reusable UI components
- `src/hooks/` - Custom React hooks
- `src/lib/` - Utility functions & API clients
- `src/utils/` - Helper functions

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build production bundle
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## License

MIT
