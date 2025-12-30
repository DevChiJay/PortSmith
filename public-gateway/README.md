# PortSmith Public Gateway

Public-facing gateway service for routing and proxying external API requests.

## Features

- Request routing & proxying
- Rate limiting per API key
- Request/response logging
- CORS & security headers
- MongoDB integration for tracking

## Quick Start

```bash
npm install
npm run dev
```

## Environment Setup

Create `.env` file with:
```
MONGODB_URI=your_mongodb_uri
PORT=3001
NODE_ENV=development
```

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

## Tech Stack

- Express 5
- Axios for HTTP requests
- express-rate-limit for rate limiting
- http-proxy-middleware for proxying
- Helmet for security headers
- Morgan for logging

## License

MIT
