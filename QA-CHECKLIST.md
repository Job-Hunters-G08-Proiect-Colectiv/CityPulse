# QA Checklist

## Environment
- [ ] Backend running at `http://localhost:3000`
- [ ] Frontend running (Vite dev server)
- [ ] `VITE_API_URL` set if backend not on default

## Connectivity
- [ ] `GET /health` returns `{ status: 'ok' }`
- [ ] App loads without the Network Error modal (while backend is up)
- [ ] Modal shows if backend is down; Retry hides it once backend returns

## Reports – List & Filters
- [ ] Reports list loads successfully
- [ ] Filtering by category/status/severity updates the list
- [ ] Search term filters results

## Reports – CRUD
- [ ] Create report with valid data -> success
- [ ] Create with invalid data -> user sees error, server returns 400
- [ ] Update report (e.g., upvotes) reflects in UI and persists
- [ ] Delete report removes it from list

## UX
- [ ] Loading indicator appears on initial load
- [ ] Refreshing indicator appears for subsequent fetches
- [ ] Map renders markers corresponding to list items

## Basic Non-Functional
- [ ] CORS allows frontend origin in dev
- [ ] No console errors in happy path
- [ ] Basic accessibility: buttons are focusable and have accessible names
