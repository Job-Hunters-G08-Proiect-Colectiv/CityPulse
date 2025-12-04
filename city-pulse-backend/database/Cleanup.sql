-- !! CLEANUP SCRIPT - Only run if you intend on resetting the database !!
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_reports_updated_at ON reports;
-- Drop function
DROP FUNCTION IF EXISTS update_updated_at_column();
-- Drop tables (in reverse order of dependencies)
DROP TABLE IF EXISTS report_comments CASCADE;
DROP TABLE IF EXISTS report_upvotes CASCADE;
DROP TABLE IF EXISTS report_images CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS districts CASCADE; 
DROP TABLE IF EXISTS cities CASCADE;    
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS pgmigrations CASCADE;
-- Drop ENUM types
DROP TYPE IF EXISTS user_type;
DROP TYPE IF EXISTS report_status;
DROP TYPE IF EXISTS report_severity;
DROP TYPE IF EXISTS report_category;