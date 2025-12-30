# PortSmith

A scalable API Gateway platform with a modern developer portal for managing API keys, accessing documentation, and monitoring usage.

## Structure

- **backend/** - Core API gateway platform (Node.js, Express, MongoDB)
- **frontend/** - Developer portal (Next.js 15, React 19, TypeScript)
- **public-gateway/** - Public gateway service for routing external requests
- **private-gateway/** - Private gateway service for internal routing

## Quick Start

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
pnpm install
pnpm dev

# Public Gateway
cd public-gateway
npm install
npm run dev
```

## Features

- JWT authentication & user management
- API key generation & management
- Request proxying & rate limiting
- Usage tracking & analytics
- External API catalog & documentation
- Modern developer portal UI

## Tech Stack

- Backend: Node.js, Express, MongoDB, JWT
- Frontend: Next.js 15, React 19, TypeScript, Tailwind CSS
- Gateway: Express, Axios, Rate Limiting

## Documentation

See individual README files in each directory for detailed setup and usage instructions.

## License

MIT
