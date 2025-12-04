exports.up = async (pgm) => {
  // ENUM types
  pgm.createType('report_category', ['POTHOLE', 'WASTE', 'POLLUTION', 'LIGHTING', 'VANDALISM', 'OTHER']);
  pgm.createType('report_severity', ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
  pgm.createType('report_status', ['PENDING', 'WORKING', 'PLANNING', 'DONE']);
  pgm.createType('user_type', ['REGULAR', 'ADMIN']);

  // Users table
  pgm.createTable('users', {
    id: 'id',
    username: { type: 'varchar(50)', notNull: true, unique: true },
    email: { type: 'varchar(100)', notNull: true, unique: true },
    password: { type: 'varchar(255)', notNull: true },
    user_type: { type: 'user_type', default: 'REGULAR', notNull: true },
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
  pgm.dropTable('users');
  pgm.dropType('user_type');
  pgm.dropType('report_status');
  pgm.dropType('report_severity');
  pgm.dropType('report_category');
};
