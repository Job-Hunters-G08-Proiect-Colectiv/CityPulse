# Testing Guide

Minimal guidance to run and understand tests in this repository.

## Backend (Express)
- Runner: Vitest (node)
- HTTP testing: Supertest

Commands:
```bash
cd city-pulse-backend
npm install
npm run test      # one-off
npm run test:watch
```

Covers:
- GET /health -> 200 { status: 'ok' }
- GET /api/reports -> 200 JSON array

Add tests:
- Create `city-pulse-backend/test/*.test.js`
- `const app = require('../server')`
- `await request(app).get('/api/...')`

## Frontend (React)
- Runner: Vitest (jsdom)
- RTL + jest-dom

Commands:
```bash
cd city-pulse-frontend
npm install
npm run test      # one-off
npm run test:watch
```

Covers:
- NetworkErrorModal render/interaction
- reportService URL building + parsing
- App smoke test with mocked /health and reports

Add tests:
- Place under `city-pulse-frontend/src/__tests__`
- Use RTL `render` + queries; mock `fetch` as needed
