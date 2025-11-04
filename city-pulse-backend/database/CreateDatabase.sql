-- UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- !! CLEANUP SCRIPT - Only run if you intend on resetting the database !!
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_reports_updated_at ON reports;
-- Drop function
DROP FUNCTION IF EXISTS update_updated_at_column();
-- Drop tables (in reverse order of dependencies)
DROP TABLE IF EXISTS report_upvotes CASCADE;
DROP TABLE IF EXISTS report_images CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS users CASCADE;
-- Drop ENUM types
DROP TYPE IF EXISTS user_type;
DROP TYPE IF EXISTS report_status;
DROP TYPE IF EXISTS report_severity;
DROP TYPE IF EXISTS report_category;

-- CREATE DATABASE SCRIPT --

-- ENUM types
CREATE TYPE report_category AS ENUM ('POTHOLE', 'WASTE', 'POLLUTION', 'LIGHTING', 'VANDALISM', 'OTHER');
CREATE TYPE report_severity AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE report_status AS ENUM ('PENDING', 'WORKING', 'PLANNING', 'DONE');
CREATE TYPE user_type AS ENUM ('REGULAR', 'ADMIN');

-- Users table
CREATE TABLE users (
	id SERIAL PRIMARY KEY,
	username VARCHAR(50) UNIQUE NOT NULL,
	email VARCHAR(100) UNIQUE NOT NULL,
	password VARCHAR(255) NOT NULL, -- Will store hashed passwords
	user_type user_type DEFAULT 'REGULAR' NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reports table
CREATE TABLE reports (
	id SERIAL PRIMARY KEY,
	name VARCHAR(255) NOT NULL,
	date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	location_lat DECIMAL(10, 8) NOT NULL, -- Latitude with precision
	location_lng DECIMAL(11, 8) NOT NULL, -- Longitude with precision
	address TEXT NOT NULL,
	category report_category NOT NULL,
	severity_level report_severity NOT NULL,
	status report_status DEFAULT 'PENDING' NOT NULL,
	upvotes INTEGER DEFAULT 0,
	description TEXT,
	created_by INTEGER REFERENCES users(id) ON DELETE SET NULL, -- Link to user who created it
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Images table (since a report can have multiple images)
CREATE TABLE report_images (
	id SERIAL PRIMARY KEY,
	report_id INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
	image_url TEXT NOT NULL, -- Store path/URL to image
	uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User upvotes tables (to track which users upvoted which reports)
CREATE TABLE report_upvotes (
	id SERIAL PRIMARY KEY,
	report_id INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
	user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	upvoted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	UNIQUE(report_id, user_id) -- A user can only upvote a report once
);

-- Indexes for better query performance
CREATE INDEX idx_reports_category ON reports(category);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_severity ON reports(severity_level);
CREATE INDEX idx_reports_created_by ON reports(created_by);
CREATE INDEX idx_report_images_report_id ON report_images(report_id);
CREATE INDEX idx_report_upvotes_report_id ON report_upvotes(report_id);
CREATE INDEX idx_report_upvotes_user_id ON report_upvotes(user_id);

-- Function to update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
	NEW.updated_at = CURRENT_TIMESTAMP;
	RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
	FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports
	FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Hardcode users (1 admin 1 regular)
-- 'pass123' is the password for both
-- below is one hash for this password

INSERT INTO users (username, email, password, user_type)
VALUES ('AdminUser', 'admin@test.com', '$2b$10$9LkatKibgdRgoFUl7AHr2O.PgUMnViBCkfUe8fDsSpfyONFpixJIG', 'ADMIN')
ON CONFLICT (email) DO NOTHING; 

INSERT INTO users (username, email, password, user_type)
VALUES ('RegularUser', 'user@test.com', '$2b$10$9LkatKibgdRgoFUl7AHr2O.PgUMnViBCkfUe8fDsSpfyONFpixJIG','REGULAR')
ON CONFLICT (email) DO NOTHING; 
