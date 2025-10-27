import type { Report } from '../types/report';
import { Calendar, MapPin, AlertCircle } from 'lucide-react';
import { getSeverityColor } from '../utils/reportUtils';
import './ReportCard.css';

interface ReportCardProps {
  report: Report;
  onClick: () => void;
}

const ReportCard = ({ report, onClick }: ReportCardProps) => {
  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  return (
    <div className="report-card" onClick={onClick}>
      <div className="report-card-header">
        <div className="report-severity" style={{ backgroundColor: getSeverityColor(report.severityLevel) }}>
          {report.severityLevel}
        </div>
        <div className="report-status">{report.status}</div>
      </div>

      <h3 className="report-title">{report.name}</h3>
      
      <div className="report-category">
        <AlertCircle size={16} />
        {report.category.replace('_', ' ')}
      </div>

      <div className="report-meta">
        <div className="report-meta-item">
          <Calendar size={14} />
          <span>{formatDate(report.date)}</span>
        </div>
        <div className="report-meta-item">
          <MapPin size={14} />
          <span>{report.address}</span>
        </div>
      </div>

      {report.images.length > 0 && (
        <div className="report-images">
          <img src={report.images[0]} alt={report.name} />
          {report.images.length > 1 && (
            <span className="image-count">+{report.images.length - 1}</span>
          )}
        </div>
      )}

      <div className="report-upvotes">
        ⬆ {report.upvotes} upvotes
      </div>
    </div>
  );
};

export default ReportCard;