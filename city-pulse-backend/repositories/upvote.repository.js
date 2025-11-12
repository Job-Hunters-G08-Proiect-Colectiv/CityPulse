const pool = require('../database/db.config');

// Check if user has upvoted a report
const hasUserUpvoted = async (userId, reportId) => {
    const query = `SELECT * FROM report_upvotes WHERE user_id = $1 AND report_id = $2 LIMIT 1`;
    const result = await pool.query(query, [userId, reportId]);
    return result.rows.length > 0;
};

// Add upvote (toggle on)
const addUpvote = async (userId, reportId) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Insert upvote record
        const insertRes = await client.query(
            'INSERT INTO report_upvotes (user_id, report_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *',
            [userId, reportId]
        );

        if (insertRes.rowCount == 0) {
            await client.query('ROLLBACK');
            return false;
        }

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
        const delRes = await client.query(
            'DELETE FROM report_upvotes WHERE user_id = $1 AND report_id = $2 RETURNING *',
            [userId, reportId]
        );

        if (delRes.rowCount == 0) {
            await client.query('ROLLBACK');
            return false;
        }

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

module.exports = {
    hasUserUpvoted,
    addUpvote,
    removeUpvote,
};