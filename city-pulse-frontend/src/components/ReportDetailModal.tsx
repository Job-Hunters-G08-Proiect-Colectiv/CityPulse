import { useState, useEffect } from 'react';
import { X, Calendar, MapPin, AlertCircle, ChevronLeft, ChevronRight, ThumbsUp } from 'lucide-react';
import type { Report } from '../types/report';
import { getImageUrl } from '../utils/imageUtils';
import { upvoteService } from '../services/upvoteService.ts';
import './ReportDetailModal.css';

interface ReportDetailModalProps {
  report: Report | null;
  isOpen: boolean;
  onClose: () => void;
  onUpvote?: (reportId: number) => void;
}

const ReportDetailModal = ({ report, isOpen, onClose, onUpvote }: ReportDetailModalProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(0);
  const [isUpvoting, setIsUpvoting] = useState(false);

  useEffect(() => {
    if (report && isOpen) {
      setUpvoteCount(report.upvotes);
      checkUpvoteStatus();
    }
  }, [report, isOpen]);

  const checkUpvoteStatus = async () => {
    if (!report) return;

    const token = localStorage.getItem('authToken');
    if (!token) {
      setHasUpvoted(false);
      return;
    }

    try {
      const result = await upvoteService.checkUpvoteStatus(report.id, token);
      setHasUpvoted(result.hasUpvoted);
    } catch (error) {
      console.error('Error checking upvote status:', error);
    }
  };

  const handleUpvote = async () => {
    if (!report) return;

    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('Please login to upvote.');
      return;
    }

    setIsUpvoting(true);

    try {
      const result = await upvoteService.toggleUpvote(report.id, token);

      // Update local state
      setHasUpvoted(result.hasUpvoted);
      setUpvoteCount(prev => result.upvoted ? prev + 1 : prev - 1);

      // Call parent's onUpvote handler if provided (to refresh report list)
      if (onUpvote) {
        onUpvote(report.id);
      }
    } catch (error: any) {
      console.error('Error toggling upvote:', error);
      alert(error.message || 'Failed to toggle upvote.');
    } finally {
      setIsUpvoting(false);
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
            <button 
              className={`upvote-button ${hasUpvoted ? 'upvoted' : ''}`}
              onClick={handleUpvote}
              disabled={isUpvoting}
            >
              <ThumbsUp size={18} fill={hasUpvoted ? 'currentColor' : 'none'} />
              <span>{hasUpvoted ? 'Upvoted' : 'Upvote'} ({upvoteCount})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDetailModal;