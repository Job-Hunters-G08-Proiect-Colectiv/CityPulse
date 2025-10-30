# API

Base URL
- Local: `http://localhost:3000`
- Frontend dev uses `VITE_API_URL` or defaults to the above

## GET /health
Health check for connectivity.

Response 200
```json
{ "status": "ok" }
```

## Reports
Base path: `/api/reports`

### GET /api/reports
Query params (optional):
- `category`
- `status`
- `severity`
- `search`

Response 200
```json
[
  {
    "id": 1,
    "name": "Pothole",
    "description": "...",
    "category": "TRAFFIC",
    "location": { "lat": 0, "lng": 0 },
    "address": "...",
    "severityLevel": "MEDIUM",
    "images": [],
    "upvotes": 0,
    "status": "OPEN",
    "date": "2024-01-01T00:00:00.000Z"
  }
]
```

### GET /api/reports/:id
Response 200: Report object (as above)
Response 404: `{ "error": "Report not found" }`

### POST /api/reports
Request body
```json
{
  "name": "...",
  "description": "...",
  "category": "TRAFFIC",
  "location": { "lat": 0, "lng": 0 },
  "address": "...",
  "severityLevel": "LOW",
  "images": []
}
```

Responses
- 201: Created (returns created report)
- 400: `{ "error": "..." }` (validation)

### PUT /api/reports/:id
Partial or full update.

Responses
- 200: Updated (returns updated report)
- 400 / 404 / 500: Error payload `{ "error": "..." }`

### DELETE /api/reports/:id
Responses
- 200: `{ "message": "Report successfully deleted!" }`
- 404: `{ "error": "Report not found!" }`
