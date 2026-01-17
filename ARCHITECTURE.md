# CityPulse Architecture Documentation

## Project Overview
CityPulse is a web application designed to allow citizens to report issues in their city (e.g., potholes, broken streetlights) and for administrators to manage these reports. The system consists of a React-based frontend and a Node.js/Express backend, communicating via a RESTful API.

## Technology Stack

### Frontend (`city-pulse-frontend`)
- **Framework**: React
- **Language**: TypeScript
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Maps**: Leaflet / React Leaflet
- **Visualization**: Recharts
- **Styling**: CSS Modules / Plain CSS
- **Testing**: Vitest

### Backend (`city-pulse-backend`)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: JavaScript
- **Database**: PostgreSQL
- **ORM/Querying**: `pg` (node-postgres)
- **Migrations**: `node-pg-migrate`
- **Authentication**: JWT (JSON Web Tokens) with `bcrypt` for password hashing
- **File Uploads**: Multer
- **Testing**: Vitest, Supertest

## System Architecture
The application follows a **Client-Server** architecture.

- **Client**: A Single Page Application (SPA) running in the browser. It handles UI rendering, user interaction, and map visualization.
- **Server**: A REST API server that handles business logic, data persistence, and authentication.
- **Database**: Relational database storing users, reports, comments, and upvotes.

## Backend Architecture
The backend is structured using a **Layered Architecture** (Controller-Service-Repository) to ensure separation of concerns.

### Directory Structure
- **`controllers/`**: Handles incoming HTTP requests, validates input, and calls the appropriate service. Sends HTTP responses.
- **`services/`**: Contains the business logic. It orchestrates data flow between controllers and repositories.
- **`repositories/`**: Handles direct database interactions (SQL queries). It abstracts the database layer from the rest of the application.
- **`routes/`**: Defines the API endpoints and maps them to controller methods.
- **`middlewares/`**: Express middlewares for tasks like authentication (`auth.middleware.js`) and file uploads (`upload.middleware.js`).
- **`database/`**: Database configuration and migration scripts.
- **`domain/`**: Domain models or helper classes (e.g., `report.domain.js`).

## Frontend Architecture
The frontend is a React SPA built with Vite.

### Key Components
- **`App.tsx`**: The main container for the user view, managing the map and report list state.
- **`main.tsx`**: Entry point, handles routing and global providers.
- **`components/`**: Reusable UI components.
    -   `MapContainer`: Renders the interactive map using Leaflet.
    -   `ReportList`: Displays a list of reports with filtering options.
    -   `CreateReportModal`: Form for submitting new reports.
    -   `AdminDashboard`: Dedicated view for administrators to view statistics and manage reports.
- **`services/`**: API wrappers (e.g., `reportService.ts`, `authService.ts`) that handle Axios requests to the backend.
- **`utils/`**: Helper functions, including authentication utilities (`authUtils.ts`).

### State Management
- Local component state (`useState`, `useReducer`) is used for UI state.
- Data is fetched from the API and stored in component state (e.g., `reports` in `App.tsx`).
- `useEffect` hooks trigger data fetching and side effects (e.g., polling for updates).

## Database Schema
The PostgreSQL database includes tables for:
- **Users**: Stores user credentials and roles (Citizen/Admin).
- **Reports**: Stores issue details, location (coordinates), status, and image paths.
- **Comments**: Discussion on reports.
- **Upvotes**: Tracking user support for reports.
- **Districts/Cities**: Geographic data for categorization.
