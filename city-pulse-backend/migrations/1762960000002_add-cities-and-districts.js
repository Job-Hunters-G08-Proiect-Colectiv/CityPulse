exports.up = async (pgm) => {
  pgm.sql("CREATE EXTENSION IF NOT EXISTS postgis");
  // Cities table
  pgm.createTable("cities", {
    id: "id",
    name: { type: "varchar(100)", notNull: true, unique: true },
    country: { type: "varchar(100)" },
    lat: { type: "decimal(10, 8)" },
    lng: { type: "decimal(11, 8)" },
    geom: { type: "geometry(MULTIPOLYGON,4326)", notNull: false },
  });

  // Districts table
  pgm.createTable("districts", {
    id: "id",
    name: { type: "varchar(100)", notNull: true },
    city_id: { type: "integer", references: '"cities"', onDelete: "CASCADE" },
    geom: { type: "geometry(MULTIPOLYGON,4326)", notNull: true },
  });

  pgm.addConstraint("districts", "districts_unique_name_city_id", {
    unique: ["name", "city_id"],
  });
};

exports.down = async (pgm) => {
  pgm.dropTable("districts");
  pgm.dropTable("cities");
};
