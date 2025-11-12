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

## Comments
Base path: `/api/reports/:reportId/comments` and `/api/comments/:commentId`

### GET /api/reports/:reportId/comments
Get all comments for a specific report.

Response 200
```json
[
  {
    "id": 1,
    "reportId": 1,
    "userId": 2,
    "commentText": "This is a comment",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "username": "RegularUser",
    "userType": "REGULAR"
  }
]
```

### POST /api/reports/:reportId/comments
Create a new comment on a report. Requires authentication.

Request body
```json
{
  "commentText": "This is a comment"
}
```

Responses
- 201: Created (returns created comment)
- 400: `{ "error": "..." }` (validation)
- 401: `{ "error": "Authentication token required" }`

### PUT /api/comments/:commentId
Update a comment. Requires authentication. Users can only update their own comments (admins can update any).

Request body
```json
{
  "commentText": "Updated comment text"
}
```

Responses
- 200: Updated (returns updated comment)
- 400 / 403 / 404: Error payload `{ "error": "..." }`
- 401: `{ "error": "Authentication token required" }`

### DELETE /api/comments/:commentId
Delete a comment. Requires authentication. Users can only delete their own comments (admins can delete any).

Responses
- 200: `{ "message": "Comment deleted successfully" }`
- 403: `{ "error": "Unauthorized: You can only delete your own comments" }`
- 404: `{ "error": "Comment not found" }`
- 401: `{ "error": "Authentication token required" }`