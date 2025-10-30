# CityPulse

## Prerequisites
- Node.js 18+
- npm 9+

## Run locally
### Backend
```bash
cd city-pulse-backend
npm install
npm run dev
# Server listens on http://localhost:3000
```

### Frontend
```bash
cd city-pulse-frontend
npm install
# Optional: set VITE_API_URL if backend is not on localhost:3000
# echo VITE_API_URL=http://localhost:3000 > .env.local
npm run dev
# Open the shown URL (typically http://localhost:5173)
```

Notes:
- Frontend proxies `/api` to `http://localhost:3000` in dev.
- A connectivity check hits `GET /health` on the backend.

## Tests
### Backend
```bash
cd city-pulse-backend
npm install
npm run test      # one-off
npm run test:watch
```

### Frontend
```bash
cd city-pulse-frontend
npm install
npm run test      # one-off
npm run test:watch
```

## Environment
- `VITE_API_URL` (frontend): Base URL of the backend, defaults to `http://localhost:3000`.

## Project structure
- `city-pulse-frontend/` React + Vite app
- `city-pulse-backend/` Express server