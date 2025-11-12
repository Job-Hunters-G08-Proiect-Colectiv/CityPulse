const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const pool = require("./db.config"); // your pg Pool instance

// -----------------------------
// Seed cities
// -----------------------------
const cities = [
  {
    name: "Cluj-Napoca",
    country: "Romania",
    geojsonFile: "cluj-districts.geojson",
  },
];

// -----------------------------
// Sample reports
// -----------------------------
const sampleReports = [
  {
    name: "Pothole",
    location_lat: 46.7773787,
    location_lng: 23.6066821,
    address: "Strada Buftea, Mărăști, Cluj-Napoca",
    category: "POTHOLE",
    severity_level: "HIGH",
    status: "PENDING",
    description: "Large pothole in the middle of the road!",
    upvotes: 23,
    images: ["/uploads/report-1.gif", "/uploads/report-2.jpeg"],
  },
  {
    name: "Graffiti",
    location_lat: 46.756932,
    location_lng: 23.5621118,
    address: "Strada Ion Meșter, Mănăștur, Cluj-Napoca",
    category: "VANDALISM",
    severity_level: "LOW",
    status: "PENDING",
    description: "Someone graffitied the wall of my apartment building.",
    upvotes: 4,
    images: ["/uploads/report-3.jpg"],
  },
];

// -----------------------------
//  Helpers
// -----------------------------
async function seedCityAndDistricts(city) {
  const { name, country, geojsonFile } = city;

  // Insert city
  const cityRes = await pool.query(
    `INSERT INTO cities (name, country)
     VALUES ($1, $2)
     ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
    [name, country]
  );
  const cityId = cityRes.rows[0].id;

  // Load GeoJSON
  const filePath = path.resolve(__dirname, "data/geo/cities/", geojsonFile);
  if (!fs.existsSync(filePath)) {
    console.warn(`GeoJSON file for ${name} not found: ${filePath}`);
    return cityId;
  }

  const geojson = JSON.parse(fs.readFileSync(filePath));

  for (const feature of geojson.features) {
    const districtName =
      feature.properties.name || feature.properties.Name || "Unknown";
    console.log(districtName);
    const geom = JSON.stringify(feature.geometry);

    await pool.query(
      `INSERT INTO districts (name, geom, city_id)
       VALUES ($1, ST_Force2D(ST_SetSRID(ST_GeomFromGeoJSON($2), 4326)), $3)
       ON CONFLICT (name, city_id) DO NOTHING`,
      [districtName, geom, cityId]
    );
  }

  console.log(`Seeded districts for ${name}`);
  return cityId;
}

async function seedReports(cityId) {
  for (const report of sampleReports) {
    const insertRes = await pool.query(
      `INSERT INTO reports (
     name, location_lat, location_lng, address,
     category, severity_level, status, description, upvotes, geom, city_id
   ) VALUES (
     $1, $2, $3, $4, $5, $6, $7, $8, $9,
     ST_SetSRID(ST_MakePoint($11, $12), 4326), -- Use $11 and $12 here
     $10
   )
   RETURNING id`,
      [
        report.name, // $1
        report.location_lat, // $2
        report.location_lng, // $3
        report.address, // $4
        report.category, // $5
        report.severity_level, // $6
        report.status, // $7
        report.description, // $8
        report.upvotes, // $9
        cityId, // $10
        report.location_lng, // $11 (for ST_MakePoint's longitude)
        report.location_lat, // $12 (for ST_MakePoint's latitude)
      ]
    );
    const reportId = insertRes.rows[0].id;

    // Assign district_id automatically
    await pool.query(
      `UPDATE reports r
       SET district_id = d.id
       FROM districts d
       WHERE r.id = $1
         AND ST_Contains(d.geom, r.geom)`,
      [reportId]
    );

    // Insert images
    if (report.images && report.images.length > 0) {
      for (const imageUrl of report.images) {
        await pool.query(
          `INSERT INTO report_images (report_id, image_url)
           VALUES ($1, $2)`,
          [reportId, imageUrl]
        );
      }
    }
  }
  console.log(`Seeded sample reports`);
}

// -----------------------------
//  Main seeding function
// -----------------------------
async function seedDatabase() {
  const client = await pool.connect();
  try {
    console.log("Starting database seed...");
    await client.query("BEGIN");

    for (const city of cities) {
      const cityId = await seedCityAndDistricts(city);
      await seedReports(cityId);
    }

    await client.query("COMMIT");
    console.log("Database seeded successfully!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Seeding failed:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

// -----------------------------
// Run
// -----------------------------
seedDatabase();
