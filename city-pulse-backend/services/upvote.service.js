const upvoteRepository = require('../repositories/upvote.repository');
const reportRepository = require('../repositories/report.repository');

// Toggle upvote (add if not exists, remove if exists)
const toggleUpvote = async (userId, reportId) => {
    // Check if report exists
    const report = await reportRepository.findById(reportId);
    if (!report) {
        throw new Error('Report not found');
    }

    // Check if user has already upvoted
    const hasUpvoted = await upvoteRepository.hasUserUpvoted(userId, reportId);

    if (hasUpvoted) {
        // Remove upvote
        await upvoteRepository.removeUpvote(userId, reportId);
        return { upvoted: false};
    } else {
        // Add upvote
        await upvoteRepository.addUpvote(userId, reportId);
        return { upvoted: true };
    }
};

// Check if user has upvoted a report
const checkUpvoteStatus = async (userId, reportId) => {
    return await upvoteRepository.hasUserUpvoted(userId, reportId);
};

// Get all reports a user has upvoted
const getUserUpvotedReports = async (userId) => {
    return await upvoteRepository.getUpvotedReportsByUser(userId);
}

module.exports = {
    toggleUpvote,
    checkUpvoteStatus,
    getUserUpvotedReports
};