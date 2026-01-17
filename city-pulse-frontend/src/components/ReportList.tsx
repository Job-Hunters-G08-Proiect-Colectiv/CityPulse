import ReportCard from './ReportCard';
import SearchBar from './SearchBar';
import type { Report, ReportCategory, ReportStatus, SeverityLevel } from '../types/report';
import './ReportList.css';

interface ReportListProps {
  reports: Report[];
  onReportClick: (report: Report) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterCategory: ReportCategory | 'ALL';
  filterStatus: ReportStatus | 'ALL';
  filterSeverity: SeverityLevel | 'ALL';
  onFilterCategoryChange: (category: ReportCategory | 'ALL') => void;
  onFilterStatusChange: (status: ReportStatus | 'ALL') => void;
  onFilterSeverityChange: (severity: SeverityLevel | 'ALL') => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const ReportList = ({ 
  reports, 
  onReportClick, 
  searchTerm,
  onSearchChange,
  filterCategory,
  filterStatus,
  filterSeverity,
  onFilterCategoryChange,
  onFilterStatusChange,
  onFilterSeverityChange,
  showFilters,
  onToggleFilters,
  isOpen,
  onOpenChange
}: ReportListProps) => {
  return (
    <>
      <div onClick={() => !isOpen && onOpenChange(true)}>
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          onClose={() => {
            onOpenChange(false);
            onSearchChange('');
          }}
          onFilterClick={onToggleFilters}
          resultCount={reports.length}
          showFilters={showFilters}
          isOpen={isOpen}
        />
      </div>

      {isOpen && (
        <div className="report-list-panel">
          {showFilters && (
            <div className="filters-panel">
              <div className="filter-group">
                <label htmlFor="category-filter">Category</label>
                <select 
                  id="category-filter"
                  value={filterCategory} 
                  onChange={(e) => onFilterCategoryChange(e.target.value as ReportCategory | 'ALL')}
                >
                  <option value="ALL">All Categories</option>
                  <option value="POTHOLE">Pothole</option>
                  <option value="WASTE">Waste Management</option>
                  <option value="POLLUTION">Pollution</option>
                  <option value="LIGHTING">Street Lighting</option>
                  <option value="VANDALISM">Vandalism</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="status-filter">Status</label>
                <select 
                  id="status-filter"
                  value={filterStatus} 
                  onChange={(e) => onFilterStatusChange(e.target.value as ReportStatus | 'ALL')}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="PLANNING">Planning</option>
                  <option value="WORKING">Working</option>
                  <option value="DONE">Done</option>
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="severity-filter">Severity</label>
                <select 
                  id="severity-filter"
                  value={filterSeverity} 
                  onChange={(e) => onFilterSeverityChange(e.target.value as SeverityLevel | 'ALL')}
                >
                  <option value="ALL">All Levels</option>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
            </div>
          )}

          <div className="report-list-content">
            {reports.map(report => (
              <ReportCard 
                key={report.id} 
                report={report} 
                onClick={() => onReportClick(report)}
              />
            ))}
            {reports.length === 0 && (
              <div className="no-reports">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M16 16s-1.5-2-4-2-4 2-4 2"/>
                  <line x1="9" y1="9" x2="9.01" y2="9"/>
                  <line x1="15" y1="9" x2="15.01" y2="9"/>
                </svg>
                <p>No reports found</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ReportList;