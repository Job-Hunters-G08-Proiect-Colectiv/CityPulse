const pool = require('../database/db.config');

// Search user by email
const findByEmail = async (email) => {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0]; // Returnează user-ul (sau undefined dacă nu-l găsește)
};

// Create a new user (used for sign-up)
const create = async (username, email, hashedPassword) => {
    // Userii noi sunt 'REGULAR' by default, conform bazei de date
    const query = `
        INSERT INTO users (username, email, password, user_type)
        VALUES ($1, $2, $3, 'REGULAR')
        RETURNING id, username, email, user_type AS "userType"
    `;
    const result = await pool.query(query, [username, email, hashedPassword]);
    return result.rows[0];
};

module.exports = {
    findByEmail,
    create
};