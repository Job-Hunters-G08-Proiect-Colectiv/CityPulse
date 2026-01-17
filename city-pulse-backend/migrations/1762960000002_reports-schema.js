exports.up = async (pgm) => {
  // Reports table
  pgm.createTable('reports', {
    id: 'id',
    name: { type: 'varchar(255)', notNull: true },
    date: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    location_lat: { type: 'decimal(10, 8)', notNull: true },
    location_lng: { type: 'decimal(11, 8)', notNull: true },
    address: { type: 'text', notNull: true },
    category: { type: 'report_category', notNull: true },
    severity_level: { type: 'report_severity', notNull: true },
    status: { type: 'report_status', default: 'PENDING', notNull: true },
    upvotes: { type: 'integer', default: 0 },
    description: { type: 'text' },
    created_by: { type: 'integer', references: '"users"', onDelete: 'SET NULL' },
    city_id: { type: 'integer', references: '"cities"', onDelete: 'SET NULL' },
    district_id: { type: 'integer', references: '"districts"', onDelete: 'SET NULL' },
    geom: { type: 'geometry(POINT, 4326)' },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  // Report images table
  pgm.createTable('report_images', {
    id: 'id',
    report_id: { type: 'integer', notNull: true, references: '"reports"', onDelete: 'CASCADE' },
    image_url: { type: 'text', notNull: true },
    uploaded_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  // Report upvotes table
  pgm.createTable('report_upvotes', {
    id: 'id',
    report_id: { type: 'integer', notNull: true, references: '"reports"', onDelete: 'CASCADE' },
    user_id: { type: 'integer', notNull: true, references: '"users"', onDelete: 'CASCADE' },
    upvoted_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });
  pgm.addConstraint('report_upvotes', 'report_upvotes_unique_report_user', {
    unique: ['report_id', 'user_id'],
  });

  // Report comments table
  pgm.createTable('report_comments', {
    id: 'id',
    report_id: { type: 'integer', notNull: true, references: '"reports"', onDelete: 'CASCADE' },
    user_id: { type: 'integer', notNull: true, references: '"users"', onDelete: 'CASCADE' },
    comment_text: { type: 'text', notNull: true },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });
};

exports.down = async (pgm) => {
  pgm.dropTable('report_comments');
  pgm.dropTable('report_upvotes');
  pgm.dropTable('report_images');
  pgm.dropTable('reports');
};
