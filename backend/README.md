# PortSmith Backend

Core API gateway platform built with Node.js, Express, and MongoDB.

## Features

- JWT authentication & user management
- API key generation & management
- Request proxying & rate limiting
- Usage tracking & metrics
- External API catalog with spec syncing
- MongoDB persistence

## Quick Start

```bash
npm install
npm run dev
```

## Environment Setup

Create `.env` file with:
```
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=5000
```

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run spec-sync` - Sync API specifications
- `npm run api-sources` - Manage external API sources

## Architecture

- **Models** - MongoDB schemas (User, ApiKey, ApiCatalog, UsageLog)
- **Controllers** - Route handlers for auth, APIs, and keys
- **Middleware** - Authentication, validation, rate limiting, proxying
- **Services** - Business logic for specs, metrics, and policies
- **Config** - Database and API configuration

## API Endpoints

**Auth**: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`  
**APIs**: `/api/apis` (GET, POST, PUT, DELETE)  
**Keys**: `/api/keys` (GET, POST, PUT, revoke, metrics)  
**Gateway**: `/gateway/:apiName/*` (requires API key)

## License

MIT
