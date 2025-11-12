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
    } else {
        // Add upvote
        await upvoteRepository.addUpvote(userId, reportId);
    }

    // Fetch update upvote count
    const updatedReport = await reportRepository.findById(reportId);
    const upvoteCount = updatedReport.upvotes || 0;

    return {
        upvoted: !hasUpvoted,
        upvoteCount
    };
};

// Check if user has upvoted a report
const checkUpvoteStatus = async (userId, reportId) => {
    const upvoted =  await upvoteRepository.hasUserUpvoted(userId, reportId);

    // Fetch current upvote count for UI consistency
    const report = await reportRepository.findById(reportId);
    const upvoteCount = report ? report.upvotes || 0 : 0;

    return { upvoted, upvoteCount }
};

module.exports = {
    toggleUpvote,
    checkUpvoteStatus,
};