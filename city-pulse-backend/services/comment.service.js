const commentRepository = require('../repositories/comment.repository');

const getCommentsByReportId = async (reportId) => {
    return await commentRepository.findByReportId(reportId);
};

const addComment = async (reportId, userId, commentText) => {
    if (!commentText || commentText.trim() === '') {
        throw new Error('Comment text is required');
    }

    if (commentText.length > 1000) {
        throw new Error('Comment text cannot exceed 1000 characters');
    }

    return await commentRepository.create(reportId, userId, commentText.trim());
};

const deleteComment = async (commentId, userId, isAdmin) => {
    const success = await commentRepository.deleteById(commentId, userId, isAdmin);
    
    if (!success) {
        throw new Error('Comment not found');
    }
    
    return success;
};

const updateComment = async (commentId, userId, commentText, isAdmin) => {
    if (!commentText || commentText.trim() === '') {
        throw new Error('Comment text is required');
    }

    if (commentText.length > 1000) {
        throw new Error('Comment text cannot exceed 1000 characters');
    }

    const updatedComment = await commentRepository.updateById(commentId, userId, commentText.trim(), isAdmin);
    
    if (!updatedComment) {
        throw new Error('Comment not found');
    }
    
    return updatedComment;
};

module.exports = {
    getCommentsByReportId,
    addComment,
    deleteComment,
    updateComment
};

