const express = require('express');
const router = express.Router();
const {
    httpToggleUpvote,
    httpCheckUpvoteStatus,
} = require('../controllers/upvote.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// All upvote routes require authentication
router.post('reports/:reportId/upvote', authenticateToken, httpToggleUpvote);
router.get('reports/:reportId/upvote-status', authenticateToken, httpCheckUpvoteStatus);

module.exports = router;