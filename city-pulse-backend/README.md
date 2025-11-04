# CityPulse Backend

## Setup

1. Install dependencies:
```bash
    npm install
```

2. Configure environment:
   - Update database credentials in `.env`
   ```env
   DB_USER=postgres
   DB_HOST=localhost
   DB_NAME=CityPulseDb
   DB_PASSWORD=your_password
   DB_PORT=5432
   JWT_SECRET=your-super-secret-jwt-key
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

4. Seed with sample data:
```bash
   npm run seed
```

5. Start server:
```bash
   npm start
```
   - Or
```bash
   npm run dev
``` 

## Database Commands

- `npm run seed` - Add sample reports (only if database is empty)