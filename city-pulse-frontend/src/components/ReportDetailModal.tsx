import { useState, useEffect } from 'react';
import { X, Calendar, MapPin, AlertCircle, ChevronLeft, ChevronRight, ThumbsUp, MessageSquare, Send, Trash2 } from 'lucide-react';
import type { Report, Comment } from '../types/report';
import { getImageUrl } from '../utils/imageUtils';
import { commentService } from '../services/commentService';
import { isAuthenticated, getCurrentUser } from '../utils/authUtils';
import './ReportDetailModal.css';

interface ReportDetailModalProps {
  report: Report | null;
  isOpen: boolean;
  onClose: () => void;
  onUpvote?: (reportId: number) => void;
}

const ReportDetailModal = ({ report, isOpen, onClose, onUpvote }: ReportDetailModalProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (isOpen && report) {
      loadComments();
    } else {
      setComments([]);
      setNewComment('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, report?.id]);

  const loadComments = async () => {
    if (!report) return;
    setLoadingComments(true);
    try {
      const fetchedComments = await commentService.getCommentsByReportId(report.id);
      setComments(fetchedComments);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  if (!isOpen || !report) return null;

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const getSeverityColor = (severity: string): string => {
    const colors = {
      LOW: '#10b981',
      MEDIUM: '#f59e0b',
      HIGH: '#ef4444',
      CRITICAL: '#dc2626'
    };
    return colors[severity as keyof typeof colors] || '#6b7280';
  };

  const getStatusColor = (status: string): string => {
    const colors = {
      PENDING: '#f59e0b',
      PLANNING: '#3b82f6',
      WORKING: '#8b5cf6',
      DONE: '#10b981'
    };
    return colors[status as keyof typeof colors] || '#6b7280';
  };

  const nextImage = () => {
    if (report.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % report.images.length);
    }
  };

  const prevImage = () => {
    if (report.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + report.images.length) % report.images.length);
    }
  };

  const handleUpvote = () => {
    if (onUpvote) {
      onUpvote(report.id);
    }
  };

  const handleSubmitComment = async () => {
    if (!report || !newComment.trim() || submittingComment) return;
    
    setSubmittingComment(true);
    try {
      const createdComment = await commentService.createComment(report.id, {
        commentText: newComment.trim()
      });
      setComments([...comments, createdComment]);
      setNewComment('');
    } catch (error: any) {
      console.error('Error creating comment:', error);
      const errorMessage = error?.response?.data?.error || error?.message || 'Failed to add comment. Please try again.';
      alert(errorMessage);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    
    try {
      await commentService.deleteComment(commentId);
      setComments(comments.filter(c => c.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment. Please try again.');
    }
  };

  const currentUser = getCurrentUser();
  const canDeleteComment = (comment: Comment) => {
    return currentUser && (currentUser.id === comment.userId || currentUser.userType === 'ADMIN');
  };

  return (
    <div className="detail-modal-overlay" onClick={onClose}>
      <div className="detail-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="detail-modal-header">
          <div className="header-badges">
            <span 
              className="severity-badge" 
              style={{ backgroundColor: getSeverityColor(report.severityLevel) }}
            >
              {report.severityLevel}
            </span>
            <span 
              className="status-badge"
              style={{ 
                backgroundColor: getStatusColor(report.status),
                color: 'white'
              }}
            >
              {report.status}
            </span>
          </div>
          <button 
            type="button"
            className="detail-close-button" 
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        <div className="detail-modal-body">
          <h2 className="detail-title">{report.name}</h2>

          <div className="detail-meta">
            <div className="meta-item">
              <AlertCircle size={18} />
              <span>{report.category.replace('_', ' ')}</span>
            </div>
            <div className="meta-item">
              <Calendar size={18} />
              <span>{formatDate(report.date)}</span>
            </div>
            <div className="meta-item">
              <MapPin size={18} />
              <span>{report.address}</span>
            </div>
          </div>

          {report.images.length > 0 && (
            <div className="image-gallery">
              <div className="main-image-container">
                <img 
                  src={getImageUrl(report.images[currentImageIndex])} 
                  alt={`Report image ${currentImageIndex + 1}`}
                  className="main-image"
                />
                {report.images.length > 1 && (
                  <>
                    <button 
                      className="image-nav-button prev" 
                      onClick={prevImage}
                      aria-label="Previous image"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button 
                      className="image-nav-button next" 
                      onClick={nextImage}
                      aria-label="Next image"
                    >
                      <ChevronRight size={24} />
                    </button>
                    <div className="image-counter">
                      {currentImageIndex + 1} / {report.images.length}
                    </div>
                  </>
                )}
              </div>

              {report.images.length > 1 && (
                <div className="thumbnail-container">
                  {report.images.map((image, index) => (
                    <button
                      key={index}
                      className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                      onClick={() => setCurrentImageIndex(index)}
                    >
                      <img src={getImageUrl(image)} alt={`Thumbnail ${index + 1}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {report.description && (
            <div className="detail-description">
              <h3>Description</h3>
              <p>{report.description}</p>
            </div>
          )}

          <div className="detail-actions">
            <button className="upvote-button" onClick={handleUpvote}>
              <ThumbsUp size={18} />
              <span>Upvote ({report.upvotes})</span>
            </button>
          </div>

          {/* Comments Section */}
          <div className="comments-section">
            <div className="comments-header">
              <MessageSquare size={20} />
              <h3>Comments ({comments.length})</h3>
            </div>

            {loadingComments ? (
              <div className="comments-loading">Loading comments...</div>
            ) : (
              <>
                <div className="comments-list">
                  {comments.length === 0 ? (
                    <div className="no-comments">No comments yet. Be the first to comment!</div>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="comment-item">
                        <div className="comment-header">
                          <div className="comment-author">
                            <span className="comment-username">{comment.username}</span>
                            {comment.userType === 'ADMIN' && (
                              <span className="comment-admin-badge">Admin</span>
                            )}
                            <span className="comment-date">
                              {new Date(comment.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          {canDeleteComment(comment) && (
                            <div className="comment-actions">
                              <button
                                className="comment-action-btn delete"
                                onClick={() => handleDeleteComment(comment.id)}
                                aria-label="Delete comment"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="comment-text">{comment.commentText}</div>
                      </div>
                    ))
                  )}
                </div>

                {isAuthenticated() && (
                  <div className="comment-form">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="comment-input"
                      rows={3}
                    />
                    <button
                      className="comment-submit-btn"
                      onClick={handleSubmitComment}
                      disabled={!newComment.trim() || submittingComment}
                    >
                      <Send size={16} />
                      <span>{submittingComment ? 'Posting...' : 'Post Comment'}</span>
                    </button>
                  </div>
                )}

                {!isAuthenticated() && (
                  <div className="comment-login-prompt">
                    Please log in to add comments.
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDetailModal;