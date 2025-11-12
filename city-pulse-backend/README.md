# CityPulse Backend

## Setup

1. Install dependencies:

```bash
    npm install
```

2. ## 🗺️ PostGIS Setup

Before running the application, you must install and enable the **PostGIS** spatial extension on your `CityPulseDb` database.

## 🗺️ PostGIS Setup

Before running the application, you must install and enable the **PostGIS** spatial extension on your `CityPulseDb` database.

### 1️⃣ Windows

The easiest method on Windows is using the **StackBuilder** utility that comes with the PostgreSQL installer.

1.  Find **StackBuilder** in your Start Menu (it's in the PostgreSQL folder).
2.  Select your PostgreSQL installation (e.g., “PostgreSQL 16 (x64)”).
3.  In the list of applications, expand:
    `Spatial Extensions → PostGIS X.Y for PostgreSQL 16`
4.  ✅ Select it and click **Next** to download and install.

---

### 🍎 2️⃣ macOS

You have two primary options on macOS.

#### Option 1: Using Homebrew

If you installed PostgreSQL via Homebrew:

Install the `postgis` package:
`bash
    brew install postgis
    `

#### Option 2: Using Postgres.app (GUI)

If you’re using the Postgres.app:

1.  Open **Postgres.app**.
2.  Go to `Preferences → Extensions`.
3.  Check the box for **PostGIS**.

---

### 🐧 3️⃣ Linux (Ubuntu/Debian)

Install the required packages:
`bash
    sudo apt update
    sudo apt install postgresql postgresql-contrib postgis
    `

2. Configure environment:

   - Update database credentials in `.env`

   ```env
   DB_USER=postgres
   DB_HOST=localhost
   DB_NAME=CityPulseDb
   DB_PASSWORD=your_password
   DB_PORT=5432
   JWT_SECRET=your-super-secret-jwt-key
   DATABASE_URL=postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME} // REPLACE HERE WITH THE VALUES ABOVE
   ```

   **Important:** Generate a secure JWT secret for production:

   ```bash
   # Generate a random 256-bit (32-byte) hex string
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. Create database:

```bash
   psql -U postgres -d CityPulseDb -f database/CreateDatabase.sql
```

- Or you can use pgAdmin
- This will create tables and seed 2 default users:
  - **Admin**: `admin@test.com` / `pass123`
  - **Regular User**: `user@test.com` / `pass123`

4. Run migrations:

```bash
   npm run migrate
```

5. Seed with sample data:

```bash
   npm run seed
```

6. Start server:

```bash
   npm start
```

- Or

```bash
   npm run dev
```

## Database Commands

- `npm run seed` - Add sample reports (only if database is empty)
- `npm run migrate` - Run migrations for updating database
