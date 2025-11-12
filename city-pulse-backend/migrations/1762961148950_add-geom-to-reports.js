/* eslint-disable camelcase */

exports.up = async (pgm) => {
  // 1️⃣ Add columns
  pgm.addColumns("reports", {
    geom: { type: "geometry(POINT,4326)", notNull: false },
    city_id: { type: "integer", references: '"cities"', onDelete: "SET NULL" },
    district_id: {
      type: "integer",
      references: '"districts"',
      onDelete: "SET NULL",
    },
  });

  // 2️⃣ Create spatial index
  pgm.sql(
    "CREATE INDEX IF NOT EXISTS idx_reports_geom ON reports USING GIST (geom);"
  );

  // 3️⃣ Backfill geom from existing lat/lng
  pgm.sql(`
    UPDATE reports
    SET geom = ST_SetSRID(ST_MakePoint(location_lng, location_lat), 4326)
    WHERE geom IS NULL;
  `);

  // 4️⃣ Optionally, backfill city_id and district_id if cities/districts already exist
  // ⚠️ Only run if cities/districts are loaded
  pgm.sql(`
    UPDATE reports r
    SET district_id = d.id,
        city_id = d.city_id
    FROM districts d
    WHERE r.geom IS NOT NULL
      AND ST_Contains(d.geom, r.geom)
      AND r.district_id IS NULL;
  `);
};

// Inside exports.down
exports.down = async (pgm) => {
  // Remove columns
  pgm.sql("DROP INDEX IF EXISTS idx_reports_geom;"); // <--- This is the fix
  pgm.dropColumns("reports", ["district_id", "city_id", "geom"]);
};
