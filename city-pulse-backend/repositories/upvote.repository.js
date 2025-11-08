const pool = require('../database/db.config');

// Check if user has upvoted a report
const hasUserUpvoted = async (userId, reportId) => {
    const query = `SELECT * FROM report_upvotes WHERE user_id = $1 AND report_id = $2`;
    const result = await pool.query(query, [userId, reportId]);
    return result.rows.length > 0;
};

// Add upvote (toggle on)
const addUpvote = async (userId, reportId) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Insert upvote record
        await client.query(
            'INSERT INTO report_upvotes (user_id, report_id) VALUES ($1, $2)',
            [userId, reportId]
        );

        // Increment upvotes count
        await client.query('UPDATE reports SET upvotes = upvotes + 1 WHERE id = $1', [reportId]);

        await client.query('COMMIT');
        return true;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

// Remove upvote (toggle off)
const removeUpvote = async (userId, reportId) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Delete upvote record
        await client.query(
            'DELETE FROM report_upvotes WHERE user_id = $1 AND report_id = $2',
            [userId, reportId]
        );

        // Decrement upvotes count
        await client.query('UPDATE reports SET upvotes = GREATEST(upvotes - 1, 0) WHERE id = $1', [reportId]);

        await client.query('COMMIT');
        return true;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

// Get all reports upvoted by a user
const getUserUpvotedReports = async (userId) => {
    const query = `SELECT report_id FROM report_upvotes WHERE user_id = $1`;
    const result = await pool.query(query, [userId]);
    return result.rows.map(row => row.report_id);
};

module.exports = {
    hasUserUpvoted,
    addUpvote,
    removeUpvote,
    getUserUpvotedReports
};