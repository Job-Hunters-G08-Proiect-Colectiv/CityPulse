const commentService = require('../services/comment.service');

const httpGetCommentsByReportId = async (req, res) => {
    try {
        const reportId = parseInt(req.params.reportId);
        if (isNaN(reportId)) {
            return res.status(400).json({ error: 'Invalid report ID' });
        }

        const comments = await commentService.getCommentsByReportId(reportId);
        res.status(200).json(comments);
    } catch (error) {
        console.error('Error getting comments:', error);
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
};

const httpAddComment = async (req, res) => {
    try {
        const reportId = parseInt(req.params.reportId);
        if (isNaN(reportId)) {
            return res.status(400).json({ error: 'Invalid report ID' });
        }

        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const userId = req.user.id;
        const { commentText } = req.body;

        if (!commentText) {
            return res.status(400).json({ error: 'Comment text is required' });
        }

        const newComment = await commentService.addComment(reportId, userId, commentText);
        res.status(201).json(newComment);
    } catch (error) {
        console.error('Error creating comment:', error);
        // Check if it's a database error (table doesn't exist)
        if (error.code === '42P01' || error.message.includes('relation') || error.message.includes('does not exist')) {
            return res.status(500).json({ error: 'Database table not found. Please run the database migration script.' });
        }
        res.status(400).json({ error: error.message || 'Failed to create comment' });
    }
};

const httpDeleteComment = async (req, res) => {
    try {
        const commentId = parseInt(req.params.commentId);
        if (isNaN(commentId)) {
            return res.status(400).json({ error: 'Invalid comment ID' });
        }

        const userId = req.user.id;
        const isAdmin = req.user.type === 'ADMIN';

        await commentService.deleteComment(commentId, userId, isAdmin);
        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        if (error.message.includes('Unauthorized')) {
            return res.status(403).json({ error: error.message });
        }
        res.status(400).json({ error: error.message || 'Failed to delete comment' });
    }
};

const httpUpdateComment = async (req, res) => {
    try {
        const commentId = parseInt(req.params.commentId);
        if (isNaN(commentId)) {
            return res.status(400).json({ error: 'Invalid comment ID' });
        }

        const userId = req.user.id;
        const isAdmin = req.user.type === 'ADMIN';
        const { commentText } = req.body;

        if (!commentText) {
            return res.status(400).json({ error: 'Comment text is required' });
        }

        const updatedComment = await commentService.updateComment(commentId, userId, commentText, isAdmin);
        res.status(200).json(updatedComment);
    } catch (error) {
        console.error('Error updating comment:', error);
        if (error.message.includes('Unauthorized')) {
            return res.status(403).json({ error: error.message });
        }
        res.status(400).json({ error: error.message || 'Failed to update comment' });
    }
};

module.exports = {
    httpGetCommentsByReportId,
    httpAddComment,
    httpDeleteComment,
    httpUpdateComment
};

