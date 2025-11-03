# CityPulse Backend

## Setup

1. Install dependencies:
```bash
    npm install
```

2. Configure environment:
   - Update database credentials in `.env`

3. Create database:
```bash
   psql -U postgres -d CityPulseDb -f database/CreateDatabase.sql
```
   - Or you can use pgAdmin

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