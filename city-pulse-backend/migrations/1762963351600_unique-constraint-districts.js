/* eslint-disable camelcase */

exports.up = (pgm) => {
  // Add a unique constraint so ON CONFLICT (name, city_id) works
  pgm.addConstraint(
    "districts",
    "districts_unique_name_city",
    "UNIQUE(name, city_id)"
  );
};

exports.down = (pgm) => {
  // Rollback — remove the unique constraint if needed
  pgm.dropConstraint("districts", "districts_unique_name_city");
};
