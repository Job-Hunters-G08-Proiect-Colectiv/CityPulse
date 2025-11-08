const { L } = require('vitest/dist/chunks/reporters.nr4dxCkA.js');
const upvoteService = require('../services/upvote.service');

// Toggle upvote for a report
const httpToggleUpvote = async (req, res) => {
    try {
        const userId = req.user.id; // From authentication middleware
        const reportId = parseInt(req.params.reportId);

        if (isNaN(reportId)) {
            return res.status(400).json({ error: 'Invalid report ID' });
        }

        const result = await upvoteService.toggleUpvote(userId, reportId);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error toggling upvote:', error);
        if (error.message === 'Report not found') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Failed to toggle upvote' });
    }
};

// Check if user has upvoted a report
const httpCheckUpvoteStatus = async (req, res) => {
    try {
        const userId = req.user.id; // From authentication middleware
        const reportId = parseInt(req.params.reportId);

        if (isNaN(reportId)) {
            return res.status(400).json({ error: 'Invalid report ID' });
        }

        const hasUpvoted = await upvoteService.checkUpvoteStatus(userId, reportId);
        res.status(200).json({ upvoted: hasUpvoted });
    } catch (error) {
        console.error('Error checking upvote status:', error);
        res.status(500).json({ error: 'Failed to check upvote status' });
    }
};

// Get all reports user has upvoted
const httpGetUserUpvotedReports = async (req, res) => {
    try {
        const userId = req.user.id;
        const reportIds = await upvoteService.getUserUpvotedReports(userId);
        res.status(200).json({ upvotedReports: reportIds });
    } catch (error) {
        console.error('Error getting user upvoted reports:', error);
        res.status(500).json({ error: 'Failed to get upvoted reports' });
    }
};

module.exports = {
    httpToggleUpvote,
    httpCheckUpvoteStatus,
    httpGetUserUpvotedReports
};