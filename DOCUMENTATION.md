# CityPulse Implementation Documentation

## Overview

CityPulse is a civic engagement platform that allows citizens to report urban issues (potholes, waste, vandalism, etc.) and enables administrators to manage and track these reports. The system uses a modern web stack with React/TypeScript on the frontend and Node.js/Express with PostgreSQL/PostGIS on the backend.

## Technology Stack

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL 17 with PostGIS extension
- **Authentication**: JWT with bcrypt password hashing
- **File Handling**: Multer for image uploads
- **Migrations**: node-pg-migrate for version control
- **Testing**: Vitest, Supertest

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios with interceptors
- **Maps**: Leaflet with React-Leaflet
- **Clustering**: react-leaflet-markercluster
- **Charts**: Recharts for data visualization
- **State Management**: React hooks (useState, useEffect)

## Project Setup

### Prerequisites
- Node.js v18+
- PostgreSQL 17 with PostGIS extension
- Git

### Installation Steps

#### 1. Backend Setup

```bash
cd city-pulse-backend
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
npm run migrate up

# Seed database with sample data
npm run seed

# Start server
npm start  # Runs on port 3000
```

#### 2. Frontend Setup

```bash
cd city-pulse-frontend
npm install
npm run dev  # Runs on port 5173
```

### Environment Configuration

**Backend `.env`:**
```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=CityPulseDb
DB_PASSWORD=your_password
DB_PORT=5432
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/CityPulseDb
JWT_SECRET=generate_with_crypto.randomBytes(64)
PORT=3000
```

**Frontend `.env`:**
```env
VITE_API_URL=http://localhost:3000
```

## Database Architecture

### Migration System

Uses node-pg-migrate with sequential timestamps for version control:

1. **initial-schema** - Creates ENUM types and users table
2. **add-cities-and-districts** - Geographic tables with PostGIS support
3. **reports-schema** - Core report tables with relationships
4. **indexes-and-triggers** - Performance optimization and auto-timestamps
5. **seed-initial-users** - Test accounts (admin@test.com / user@test.com, password: pass123)

### Key Features
- **PostGIS Integration**: Stores geographic data as GEOMETRY types for spatial queries
- **Automatic Timestamps**: Trigger function updates `updated_at` on row changes
- **Cascading Deletes**: Deleting reports removes associated images, upvotes, and comments
- **Constraint Protection**: UNIQUE constraint prevents duplicate upvotes per user/report

## Authentication System

### JWT Implementation
- Tokens generated with 1-hour expiration
- Payload contains: `{ id: userId, type: userType }`
- Stored in browser localStorage
- Automatically attached to requests via Axios interceptor

### Password Security
- Passwords hashed using bcrypt with salt rounds of 10
- Never stored or transmitted in plain text
- Comparison during login: `bcrypt.compare(plainPassword, hashedPassword)`

### Protected Routes
- **Middleware**: `authenticateToken` verifies JWT and attaches `req.user`
- **Admin Check**: `isAdmin` middleware ensures `user.type === 'ADMIN'`
- **Frontend Guards**: React Router checks authentication state before rendering

## API Design

### RESTful Endpoints

#### Reports
- `GET /api/reports` - List with filters (public)
- `GET /api/reports/:id` - Single report details (public)
- `POST /api/reports` - Create report (authenticated)
- `PUT /api/reports/:id` - Update report (authenticated)
- `DELETE /api/reports/:id` - Delete report (admin only)

#### Comments
- `GET /api/reports/:reportId/comments` - List comments (public)
- `POST /api/reports/:reportId/comments` - Add comment (authenticated)
- `PUT /api/comments/:commentId` - Update own comment (authenticated)
- `DELETE /api/comments/:commentId` - Delete own comment (authenticated/admin)

#### Upvotes
- `POST /api/reports/:reportId/upvote` - Toggle upvote (authenticated)
- `GET /api/reports/:reportId/upvote-status` - Check if user upvoted (authenticated)

#### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login and receive JWT

#### Cities & Statistics
- `GET /api/cities` - List all cities
- `GET /api/statistics/overview` - Summary statistics
- `GET /api/statistics/by-district/:cityId` - District breakdown
- `GET /api/statistics/by-category` - Category distribution
- `GET /api/statistics/by-severity` - Severity distribution

## File Upload System

### Storage Strategy
- Files stored in `/uploads` directory on disk
- Filename format: `report-{timestamp}-{random}.{ext}`
- Database stores relative paths (`/uploads/report-123.jpg`)
- Frontend accesses via: `http://localhost:3000/uploads/report-123.jpg`

### Upload Flow
1. User selects images in CreateReportModal
2. Frontend POSTs to `/api/upload/images` (multipart/form-data)
3. Multer middleware saves files to disk
4. Backend returns array of relative URLs
5. URLs stored in form state, then saved to `report_images` table

### File Constraints
- Max 5 images per upload
- 10MB size limit per file
- Allowed types: jpg, jpeg, png, gif, webp

## Frontend Architecture

### Component Organization

**Main Views:**
- `App.tsx` - Main citizen view with map and report list
- `AdminDashboard.tsx` - Admin interface with table and stats
- `LoginPage.tsx` / `SignupPage.tsx` - Authentication pages

**Key Components:**
- `MapContainer.tsx` - City selector and map wrapper
- `MapView.tsx` - Leaflet map with custom markers and heatmap
- `ReportList.tsx` - Filterable list of reports
- `CreateReportModal.tsx` - Form for submitting new reports
- `ReportDetailModal.tsx` - Full report view with comments
- `StatisticsDashboard.tsx` - Charts and district tables

### Map Implementation

**Custom SVG Markers:**
- Teardrop-shaped with category icons
- **Severity Colors**: Visual encoding (green=LOW, red=CRITICAL)
- **Glow Effects**: Based on upvote count (5+ upvotes = glow)
- **Clustering**: Groups nearby markers at low zoom levels
- **Heatmap Toggle**: Alternative density visualization
- **Hover Behavior**: 300ms delayed popup on marker hover

### Authentication Flow

1. User logs in → receives JWT token
2. Token stored in localStorage
3. Axios interceptor adds `Authorization: Bearer {token}` to all requests
4. 401 responses trigger automatic logout and redirect to login
5. Network errors show retry modal instead of redirect

## Code Organization

### Backend Layered Architecture

**Controller Layer (HTTP handling):**
```javascript
const httpCreateReport = async (req, res) => {
  try {
    const userId = req.user.id; // from auth middleware
    const newReport = await reportService.addNewReport(req.body, userId);
    res.status(201).json(newReport);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
```

**Service Layer (Business logic):**
```javascript
const addNewReport = async (reportData, userId) => {
  // Validation
  if (!reportData.name) throw new Error('Name required');
  
  // Create domain model
  const report = new Report(/* ... */);
  
  // Persist via repository
  return await reportRepository.create(report);
};
```

**Repository Layer (Database queries):**
```javascript
const create = async (reportModel) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Insert report and images in transaction
    await client.query('COMMIT');
    return formattedReport;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
```

## Key Implementation Decisions

### Why These Technologies?

- **PostgreSQL + PostGIS**: Required for geospatial queries (finding reports within district boundaries)
- **JWT**: Stateless authentication suitable for REST API architecture
- **React + TypeScript**: Type safety prevents runtime errors and improves developer experience
- **Vite**: Fast HMR and build times compared to Create React App
- **Multer**: Industry-standard for Node.js file uploads

### Testing Strategy

- Component rendering with React Testing Library
- User interaction simulations
- API mocking with Mock Service Worker (MSW)

---

## Getting Started

For test accounts, use:
- **Admin**: admin@test.com / pass123
- **User**: user@test.com / pass123
