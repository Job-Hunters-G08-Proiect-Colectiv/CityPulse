exports.up = async (pgm) => {
  // Indexes for better query performance
  pgm.createIndex("reports", "category");
  pgm.createIndex("reports", "status");
  pgm.createIndex("reports", "severity_level");
  pgm.createIndex("reports", "created_by");
  pgm.createIndex("reports", "city_id");
  pgm.createIndex("reports", "geom", { method: "gist" });
  pgm.createIndex("districts", "geom", { method: "gist" });
  pgm.createIndex("report_images", "report_id");
  pgm.createIndex("report_upvotes", "report_id");
  pgm.createIndex("report_upvotes", "user_id");
  pgm.createIndex("report_comments", "report_id");
  pgm.createIndex("report_comments", "user_id");

  // Function to update updated_at timestamp automatically
  pgm.sql(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = now();
        RETURN NEW;
    END;
    $$ language 'plpgsql';
  `);

  // Triggers to auto-update updated_at
  pgm.createTrigger("users", "update_users_updated_at", {
    when: "BEFORE",
    operation: "UPDATE",
    function: "update_updated_at_column",
    level: "ROW",
  });

  pgm.createTrigger("reports", "update_reports_updated_at", {
    when: "BEFORE",
    operation: "UPDATE",
    function: "update_updated_at_column",
    level: "ROW",
  });
};

exports.down = async (pgm) => {
  pgm.dropTrigger("reports", "update_reports_updated_at");
  pgm.dropTrigger("users", "update_users_updated_at");
  pgm.dropFunction("update_updated_at_column");

  pgm.dropIndex("report_comments", "user_id");
  pgm.dropIndex("report_comments", "report_id");
  pgm.dropIndex("report_upvotes", "user_id");
  pgm.dropIndex("report_upvotes", "report_id");
  pgm.dropIndex("report_images", "report_id");
  pgm.dropIndex("districts", "geom");
  pgm.dropIndex("reports", "geom");
  pgm.dropIndex("reports", "city_id");
  pgm.dropIndex("reports", "created_by");
  pgm.dropIndex("reports", "severity_level");
  pgm.dropIndex("reports", "status");
  pgm.dropIndex("reports", "category");
};
