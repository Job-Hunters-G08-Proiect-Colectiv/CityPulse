const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const { Pool } = require("pg");

// !! IMPORTANT !! - Instead of changing credentials here, set them in the .env file at the backend root! //
// Database connection configuration
const pool = new Pool({
  user: process.env.DATABASE_USERNAME || "postgres",
  host: process.env.DATABASE_HOST || "localhost",
  database: process.env.DATABASE_NAME || "CityPulseDb",
  password: process.env.DATABASE_PASSWORD || "password",
  port: process.env.DATABASE_PORT || 5432,
});

// Test connection
pool.on("connect", () => {
  console.log("Connected to the database");
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

module.exports = pool;
