exports.up = (pgm) => {
  pgm.sql(`
    INSERT INTO users (username, email, password, user_type)
    VALUES ('AdminUser', 'admin@test.com', '$2b$10$9LkatKibgdRgoFUl7AHr2O.PgUMnViBCkfUe8fDsSpfyONFpixJIG', 'ADMIN')
    ON CONFLICT (email) DO NOTHING;
  `);

  pgm.sql(`
    INSERT INTO users (username, email, password, user_type)
    VALUES ('RegularUser', 'user@test.com', '$2b$10$9LkatKibgdRgoFUl7AHr2O.PgUMnViBCkfUe8fDsSpfyONFpixJIG','REGULAR')
    ON CONFLICT (email) DO NOTHING;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DELETE FROM users WHERE email IN ('admin@test.com', 'user@test.com');`);
};
