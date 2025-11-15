# CityPulse Test Suite Documentation

## Overview
This document provides comprehensive information about the test suite implemented for the CityPulse application, covering both backend and frontend testing strategies.

## Test Coverage Summary

### Backend Tests (5 Test Files)
- **auth.test.js** - Authentication & Authorization (110+ test cases)
- **reports.test.js** - Reports CRUD operations (65+ test cases)
- **comments.test.js** - Comments functionality (50+ test cases)
- **upvotes.test.js** - Upvoting system (40+ test cases)
- **middleware.test.js** - Middleware & security (35+ test cases)

**Total Backend Tests: ~300 test cases**

### Frontend Tests (7 Test Files)
- **App.smoke.test.tsx** - Application smoke tests
- **NetworkErrorModal.test.tsx** - Network error handling
- **reportService.test.ts** - Report service API calls (15+ test cases)
- **commentService.test.ts** - Comment service (20+ test cases)
- **upvoteService.test.ts** - Upvote service (15+ test cases)
- **authService.test.ts** - Authentication service (25+ test cases)
- **CreateReportModal.test.tsx** - Create report UI (20+ test cases)
- **LoginPage.test.tsx** - Login page UI (25+ test cases)
- **ReportList.test.tsx** - Report list component (30+ test cases)

**Total Frontend Tests: ~150 test cases**

**GRAND TOTAL: ~450 comprehensive test cases**

---

## Backend Test Suite Details

### 1. Authentication Tests (auth.test.js)

#### Purpose
Validates the complete authentication flow including signup, login, JWT token generation, and role-based access control.

#### Key Test Categories

**Signup Tests:**
- ✅ Creates new users with valid data
- ✅ Returns hashed password (security)
- ✅ Prevents duplicate email registration
- ✅ Validates required fields
- ✅ Returns proper error messages

**Login Tests:**
- ✅ Authenticates with correct credentials
- ✅ Returns JWT token and user data
- ✅ Validates token signature and expiration
- ✅ Rejects incorrect passwords
- ✅ Rejects non-existent users
- ✅ Validates email format

**JWT Token Validation:**
- ✅ Accepts valid Bearer tokens
- ✅ Rejects missing tokens (401)
- ✅ Rejects invalid tokens (403)
- ✅ Rejects expired tokens
- ✅ Validates token signature
- ✅ Properly extracts user information from token

**User Roles:**
- ✅ Identifies ADMIN users correctly
- ✅ Identifies REGULAR users correctly
- ✅ Enforces role-based permissions

#### Example Usage
```bash
cd city-pulse-backend
npm test auth.test.js
```

---

### 2. Reports Tests (reports.test.js)

#### Purpose
Tests the complete lifecycle of city reports including creation, retrieval, updating, deletion, and filtering.

#### Key Test Categories

**GET /api/reports:**
- ✅ Returns array of all reports
- ✅ Filters by category (POTHOLE, WASTE, POLLUTION, etc.)
- ✅ Filters by status (PENDING, WORKING, PLANNING, DONE)
- ✅ Filters by severity level (LOW, MEDIUM, HIGH, CRITICAL)
- ✅ Searches reports by text
- ✅ Combines multiple filters

**POST /api/reports:**
- ✅ Creates reports with authentication
- ✅ Validates all required fields
- ✅ Rejects unauthorized requests (401)
- ✅ Validates category enum values
- ✅ Validates severity level enum values
- ✅ Sets default status to PENDING
- ✅ Associates report with authenticated user

**GET /api/reports/:id:**
- ✅ Returns specific report by ID
- ✅ Returns 404 for non-existent reports
- ✅ Handles invalid ID formats

**PUT /api/reports/:id:**
- ✅ Updates report status (admin feature)
- ✅ Updates severity level
- ✅ Updates multiple fields
- ✅ Returns 404 for non-existent reports

**DELETE /api/reports/:id:**
- ✅ Deletes reports successfully
- ✅ Returns 404 for non-existent reports
- ✅ Verifies deletion by querying after delete

**Data Validation:**
- ✅ Tests all 6 category types
- ✅ Tests all 4 severity levels
- ✅ Validates location coordinates
- ✅ Validates address fields

---

### 3. Comments Tests (comments.test.js)

#### Purpose
Validates the commenting system including creation, retrieval, updates, deletion, and authorization checks.

#### Key Test Categories

**GET /api/reports/:reportId/comments:**
- ✅ Returns all comments for a report
- ✅ Returns empty array when no comments
- ✅ Validates report ID format
- ✅ Includes username and userType in response

**POST /api/reports/:reportId/comments:**
- ✅ Creates comments with authentication
- ✅ Associates comment with user ID
- ✅ Requires authentication token (401)
- ✅ Validates comment text is required (400)
- ✅ Returns complete comment object

**PUT /api/comments/:commentId:**
- ✅ Allows users to update own comments
- ✅ Allows admins to update any comment
- ✅ Prevents users from updating others' comments (403)
- ✅ Requires authentication
- ✅ Validates comment text is required

**DELETE /api/comments/:commentId:**
- ✅ Allows users to delete own comments
- ✅ Allows admins to delete any comment
- ✅ Prevents users from deleting others' comments (403)
- ✅ Returns proper error messages

**Authorization Tests:**
- ✅ Tests user ownership validation
- ✅ Tests admin override permissions
- ✅ Tests unauthorized access attempts

---

### 4. Upvotes Tests (upvotes.test.js)

#### Purpose
Tests the upvoting mechanism including toggle functionality, count accuracy, and uniqueness constraints.

#### Key Test Categories

**POST /api/reports/:reportId/upvote:**
- ✅ Adds upvote to a report
- ✅ Removes upvote on second toggle
- ✅ Returns upvote count
- ✅ Requires authentication (401)
- ✅ Validates report ID format
- ✅ Returns 404 for non-existent reports
- ✅ Allows multiple users to upvote same report

**GET /api/reports/:reportId/upvote/status:**
- ✅ Returns current upvote status
- ✅ Returns false when user hasn't upvoted
- ✅ Returns true after user upvotes
- ✅ Requires authentication

**Upvote Count Accuracy:**
- ✅ Accurately tracks upvote increments
- ✅ Accurately tracks upvote decrements
- ✅ Persists count when querying report
- ✅ Updates count in real-time

**Uniqueness Tests:**
- ✅ One upvote per user per report
- ✅ Toggle maintains count integrity
- ✅ Prevents duplicate upvotes

---

### 5. Middleware Tests (middleware.test.js)

#### Purpose
Validates security middleware including authentication, authorization, CORS, and error handling.

#### Key Test Categories

**Authentication Middleware:**
- ✅ Accepts valid Bearer tokens
- ✅ Rejects missing Authorization header
- ✅ Rejects malformed headers
- ✅ Rejects invalid tokens
- ✅ Rejects expired tokens
- ✅ Validates token signatures
- ✅ Attaches user info to request object

**Admin Authorization:**
- ✅ Allows admin operations
- ✅ Validates user role from token
- ✅ Enforces role-based access

**CORS Middleware:**
- ✅ Includes CORS headers
- ✅ Handles preflight requests
- ✅ Allows configured origins

**JSON Body Parser:**
- ✅ Parses JSON request bodies
- ✅ Handles malformed JSON gracefully

**Error Handling:**
- ✅ Returns proper 404 responses
- ✅ Handles server errors gracefully
- ✅ Returns consistent error format

**Token Extraction:**
- ✅ Extracts from "Bearer <token>" format
- ✅ Rejects token without Bearer prefix
- ✅ Handles malformed Authorization values

---

## Frontend Test Suite Details

### 1. Service Tests

#### reportService.test.ts
**Purpose:** Tests API integration for report operations

- ✅ Fetches all reports
- ✅ Appends query parameters for filters
- ✅ Creates new reports
- ✅ Updates existing reports
- ✅ Deletes reports
- ✅ Handles API errors gracefully

#### commentService.test.ts
**Purpose:** Tests comment API integration

- ✅ Fetches comments by report ID
- ✅ Creates new comments
- ✅ Updates existing comments
- ✅ Deletes comments
- ✅ Handles validation errors (400)
- ✅ Handles authentication errors (401)
- ✅ Handles authorization errors (403)
- ✅ Handles not found errors (404)

#### upvoteService.test.ts
**Purpose:** Tests upvote API integration

- ✅ Toggles upvote successfully
- ✅ Sends correct authorization headers
- ✅ Checks upvote status
- ✅ Handles 401 unauthorized errors
- ✅ Handles network errors
- ✅ Returns upvote counts

#### authService.test.ts
**Purpose:** Tests authentication service

- ✅ Login with valid credentials
- ✅ Signup with valid data
- ✅ Logout functionality
- ✅ Token storage in localStorage
- ✅ User persistence across refreshes
- ✅ Error handling for invalid credentials
- ✅ Network error handling

### 2. Component Tests

#### CreateReportModal.test.tsx
**Purpose:** Tests report creation UI

- ✅ Renders when open
- ✅ Hides when closed
- ✅ Displays all form fields
- ✅ Shows all category options (6 types)
- ✅ Shows all severity levels (4 levels)
- ✅ Validates required fields
- ✅ Calls onSubmit handler
- ✅ Calls onClose on cancel
- ✅ Has accessible labels

#### LoginPage.test.tsx
**Purpose:** Tests login page UI

- ✅ Renders login form
- ✅ Has email and password inputs
- ✅ Validates required fields
- ✅ Has correct input types
- ✅ Has placeholder text
- ✅ Calls login handler on submit
- ✅ Has link to signup page
- ✅ Prevents default form submission
- ✅ Shows error alerts
- ✅ Accessible form labels
- ✅ Proper heading hierarchy

#### ReportList.test.tsx
**Purpose:** Tests report list component

- ✅ Renders list of reports
- ✅ Displays report details
- ✅ Shows all categories correctly
- ✅ Shows all severity levels
- ✅ Shows all status types
- ✅ Displays upvote counts
- ✅ Has view details buttons
- ✅ Calls click handlers
- ✅ Shows empty state
- ✅ Handles undefined data
- ✅ Filters by category
- ✅ Filters by severity
- ✅ Filters by status
- ✅ Sorts by upvotes

---

## Running the Tests

### Prerequisites
- Node.js 18+ (required for both frontend and backend)
- npm 9+
- PostgreSQL with PostGIS extension
- Database setup completed

### Backend Tests

```bash
# Navigate to backend folder
cd city-pulse-backend

# Install dependencies (if not already installed)
npm install

# Create .env file with test configuration
# JWT_SECRET should be set for token validation

# Run all backend tests
npm test

# Run specific test file
npm test auth.test.js

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

### Frontend Tests

```bash
# Navigate to frontend folder
cd city-pulse-frontend

# Install dependencies
npm install

# Run all frontend tests
npm test

# Run specific test file
npm test reportService.test.ts

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npx vitest --ui
```

---

## Viewing Test Results

### Test Output Format
Tests use Vitest which provides:
- ✓ Green checkmarks for passing tests
- ✗ Red X for failing tests
- Test execution time
- Coverage reports
- Detailed error messages

### HTML Reports
Test results are saved to:
- `city-pulse-backend/test-report.html`
- `city-pulse-frontend/test-report.html`

Open these files in a browser to view detailed test results.

### XML Reports
JUnit-compatible XML reports are generated:
- `city-pulse-backend/test-results.xml`
- `city-pulse-frontend/test-results.xml`

These can be integrated with CI/CD pipelines.

---

## Demo Presentation Guide

### 1. Opening Statement
"I've implemented a comprehensive test suite with over 450 test cases covering the entire CityPulse application—both backend and frontend."

### 2. Backend Tests Demo

**Show the test files:**
```bash
ls -la city-pulse-backend/test/
```

**Run authentication tests:**
```bash
cd city-pulse-backend
npm test auth.test.js
```

**Key points to mention:**
- "Authentication tests cover signup, login, JWT validation, and role-based access"
- "We test both successful and failure scenarios"
- "Security is paramount—we validate token signatures, expiration, and proper error codes"

**Run reports tests:**
```bash
npm test reports.test.js
```

**Key points to mention:**
- "Reports tests cover full CRUD operations"
- "We test all 6 category types and 4 severity levels"
- "Filtering and search functionality is thoroughly tested"

**Run comments and upvotes:**
```bash
npm test comments.test.js
npm test upvotes.test.js
```

**Key points to mention:**
- "Comments tests ensure proper authorization—users can only edit their own comments"
- "Admins have override permissions"
- "Upvotes tests validate the uniqueness constraint and accurate count tracking"

### 3. Frontend Tests Demo

**Show the test files:**
```bash
ls -la city-pulse-frontend/src/__tests/
```

**Run all frontend tests:**
```bash
cd city-pulse-frontend
npm test
```

**Key points to mention:**
- "Frontend tests cover service layer, components, and user interactions"
- "We mock API calls to test in isolation"
- "Accessibility is tested with proper labels and ARIA attributes"

### 4. Show Test Coverage

**View HTML report:**
```bash
open city-pulse-backend/test-report.html
open city-pulse-frontend/test-report.html
```

### 5. Highlight Test Quality

**Mention:**
- "Tests follow AAA pattern: Arrange, Act, Assert"
- "Each test is independent and can run in isolation"
- "We test edge cases: empty data, invalid IDs, unauthorized access"
- "Error handling is thoroughly validated"
- "Security vulnerabilities are prevented through testing"

### 6. Integration with QA Checklist

**Reference QA-CHECKLIST.md:**
```bash
cat QA-CHECKLIST.md
```

**Key points:**
- "Our automated tests align with the QA checklist"
- "Tests can be run in CI/CD pipeline"
- "Regression testing is automated"

### 7. Closing Statement
"This comprehensive test suite ensures code quality, prevents regressions, and gives us confidence in deploying new features. With over 450 test cases covering authentication, CRUD operations, comments, upvotes, security, and UI components, we have a solid foundation for maintaining a stable, reliable application."

---

## Test Categories Summary

### By Test Type
| Type | Backend | Frontend | Total |
|------|---------|----------|-------|
| Unit Tests | 200+ | 100+ | 300+ |
| Integration Tests | 100+ | 50+ | 150+ |
| **Total** | **300+** | **150+** | **450+** |

### By Feature
| Feature | Test Cases |
|---------|-----------|
| Authentication & Authorization | 110+ |
| Reports (CRUD) | 65+ |
| Comments | 50+ |
| Upvotes | 40+ |
| Middleware & Security | 35+ |
| Frontend Services | 75+ |
| Frontend Components | 75+ |

---

## Best Practices Implemented

### 1. Test Independence
- Each test can run independently
- Tests don't depend on execution order
- Proper setup and teardown using `beforeAll`, `afterAll`, `beforeEach`, `afterEach`

### 2. Comprehensive Coverage
- Happy path scenarios
- Error scenarios
- Edge cases
- Security vulnerabilities

### 3. Meaningful Test Names
- Descriptive test names that explain what's being tested
- Grouped by functionality using `describe` blocks

### 4. Assertions
- Clear, specific assertions
- Multiple assertions per test when appropriate
- Proper error message validation

### 5. Mocking
- External dependencies are mocked (database, APIs)
- Consistent mock data
- Realistic test scenarios

### 6. Security Testing
- Authentication validation
- Authorization checks
- SQL injection prevention
- XSS prevention
- CSRF protection

---

## Future Enhancements

1. **E2E Tests:** Add Cypress or Playwright for full end-to-end testing
2. **Performance Tests:** Load testing for high traffic scenarios
3. **Visual Regression Tests:** Screenshot comparison for UI consistency
4. **Accessibility Tests:** Automated WCAG compliance testing
5. **API Contract Tests:** Validate API responses against OpenAPI spec
6. **Database Tests:** Test complex queries and data integrity
7. **CI/CD Integration:** Automated test runs on every commit

---

## Troubleshooting

### Common Issues

**Issue: Tests fail with "JWT_SECRET not defined"**
- Solution: Create `.env` file with `JWT_SECRET=your-secret-key`

**Issue: Database connection errors**
- Solution: Ensure PostgreSQL is running and CityPulseDb database exists
- Run database setup: `psql -U postgres -d CityPulseDb -f database/CreateDatabase.sql`

**Issue: Port already in use**
- Solution: Stop other instances of the app or change test port

**Issue: Node version mismatch**
- Solution: Use Node.js 18+ (check with `node --version`)

**Issue: Tests timeout**
- Solution: Increase timeout in vitest.config.js or specific test files

---

## Contact & Support

For questions about the test suite:
- Review the test files for examples
- Check the main README.md for setup instructions
- Consult TESTING.md for testing guidelines

---

**Test Suite Version:** 1.0.0
**Last Updated:** November 2024
**Total Test Cases:** 450+
**Coverage Target:** 80%+
**Framework:** Vitest + Supertest + React Testing Library
