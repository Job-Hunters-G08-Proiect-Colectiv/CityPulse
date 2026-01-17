const express = require('express');
const router = express.Router();
const {
    httpGetCommentsByReportId,
    httpAddComment,
    httpDeleteComment,
    httpUpdateComment
} = require('../controllers/comment.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

// Get all comments for a report (public)
router.get('/reports/:reportId/comments', httpGetCommentsByReportId);

// Protected routes (must be logged in)
router.post('/reports/:reportId/comments', authenticateToken, httpAddComment);
router.put('/comments/:commentId', authenticateToken, httpUpdateComment);
router.delete('/comments/:commentId', authenticateToken, httpDeleteComment);

module.exports = router;

