const pool = require('../database/db.config');

// Find all comments for a report
const findByReportId = async (reportId) => {
  const query = `
    SELECT
      c.id,
      c.report_id AS "reportId",
      c.user_id AS "userId",
      c.comment_text AS "commentText",
      c.created_at AS "createdAt",
      c.updated_at AS "updatedAt",
      u.username,
      u.user_type AS "userType"
    FROM report_comments c
    INNER JOIN users u ON c.user_id = u.id
    WHERE c.report_id = $1
    ORDER BY c.created_at ASC
  `;

  try {
    const result = await pool.query(query, [reportId]);
    return result.rows.map(row => ({
      id: row.id,
      reportId: row.reportId,
      userId: row.userId,
      commentText: row.commentText,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      username: row.username,
      userType: row.userType
    }));
  } catch (error) {
    console.error('Database error in findByReportId:', error);
    throw error;
  }
};

// Create a new comment
const create = async (reportId, userId, commentText) => {
  const query = `
    INSERT INTO report_comments (report_id, user_id, comment_text)
    VALUES ($1, $2, $3)
    RETURNING *
  `;

  try {
    const result = await pool.query(query, [reportId, userId, commentText]);
    const comment = result.rows[0];

    // Fetch the comment with user information
    const commentWithUser = await pool.query(`
      SELECT
        c.id,
        c.report_id AS "reportId",
        c.user_id AS "userId",
        c.comment_text AS "commentText",
        c.created_at AS "createdAt",
        c.updated_at AS "updatedAt",
        u.username,
        u.user_type AS "userType"
      FROM report_comments c
      INNER JOIN users u ON c.user_id = u.id
      WHERE c.id = $1
    `, [comment.id]);

    return {
      id: commentWithUser.rows[0].id,
      reportId: commentWithUser.rows[0].reportId,
      userId: commentWithUser.rows[0].userId,
      commentText: commentWithUser.rows[0].commentText,
      createdAt: commentWithUser.rows[0].createdAt,
      updatedAt: commentWithUser.rows[0].updatedAt,
      username: commentWithUser.rows[0].username,
      userType: commentWithUser.rows[0].userType
    };
  } catch (error) {
    console.error('Database error in create:', error);
    throw error;
  }
};

// Delete a comment by ID
const deleteById = async (commentId, userId, isAdmin) => {
  // Check if user owns the comment or is admin
  const checkQuery = `
    SELECT user_id FROM report_comments WHERE id = $1
  `;
  
  try {
    const checkResult = await pool.query(checkQuery, [commentId]);
    
    if (checkResult.rows.length === 0) {
      return null; // Comment not found
    }

    const commentUserId = checkResult.rows[0].user_id;
    
    // Only allow deletion if user owns the comment or is admin
    if (commentUserId !== userId && !isAdmin) {
      throw new Error('Unauthorized: You can only delete your own comments');
    }

    const deleteQuery = 'DELETE FROM report_comments WHERE id = $1 RETURNING id';
    const result = await pool.query(deleteQuery, [commentId]);
    
    return result.rows.length > 0;
  } catch (error) {
    console.error('Database error in deleteById:', error);
    throw error;
  }
};

// Update a comment by ID
const updateById = async (commentId, userId, commentText, isAdmin) => {
  // Check if user owns the comment or is admin
  const checkQuery = `
    SELECT user_id FROM report_comments WHERE id = $1
  `;
  
  try {
    const checkResult = await pool.query(checkQuery, [commentId]);
    
    if (checkResult.rows.length === 0) {
      return null; // Comment not found
    }

    const commentUserId = checkResult.rows[0].user_id;
    
    // Only allow update if user owns the comment or is admin
    if (commentUserId !== userId && !isAdmin) {
      throw new Error('Unauthorized: You can only update your own comments');
    }

    const updateQuery = `
      UPDATE report_comments
      SET comment_text = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await pool.query(updateQuery, [commentText, commentId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    // Fetch the comment with user information
    const commentWithUser = await pool.query(`
      SELECT
        c.id,
        c.report_id AS "reportId",
        c.user_id AS "userId",
        c.comment_text AS "commentText",
        c.created_at AS "createdAt",
        c.updated_at AS "updatedAt",
        u.username,
        u.user_type AS "userType"
      FROM report_comments c
      INNER JOIN users u ON c.user_id = u.id
      WHERE c.id = $1
    `, [commentId]);

    return {
      id: commentWithUser.rows[0].id,
      reportId: commentWithUser.rows[0].reportId,
      userId: commentWithUser.rows[0].userId,
      commentText: commentWithUser.rows[0].commentText,
      createdAt: commentWithUser.rows[0].createdAt,
      updatedAt: commentWithUser.rows[0].updatedAt,
      username: commentWithUser.rows[0].username,
      userType: commentWithUser.rows[0].userType
    };
  } catch (error) {
    console.error('Database error in updateById:', error);
    throw error;
  }
};

module.exports = {
  findByReportId,
  create,
  deleteById,
  updateById
};

