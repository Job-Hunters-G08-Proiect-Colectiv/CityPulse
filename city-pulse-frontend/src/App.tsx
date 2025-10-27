import { useState, useEffect } from 'react';
import ReportList from './components/ReportList';
import CreateReportModal from './components/CreateReportModal';
import ReportDetailModal from './components/ReportDetailModal';
import NewReportButton from './components/NewReportButton';
import MapContainer from './components/MapContainer';
import { reportService, type CreateReportDto } from './services/reportService';
import type { Report, ReportCategory, ReportStatus, SeverityLevel } from './types/report';
import './App.css';

function App() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false); // New state for subsequent loads
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isListOpen, setIsListOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<ReportCategory | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<ReportStatus | 'ALL'>('ALL');
  const [filterSeverity, setFilterSeverity] = useState<SeverityLevel | 'ALL'>('ALL');

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchReports();
    }, 300); // Wait 300ms after user stops typing

    return () => clearTimeout(timeoutId);
  }, [searchTerm, filterCategory, filterStatus, filterSeverity]);

  // Fetch reports from backend with filters
  const fetchReports = async () => {
    try {
      // Use isRefreshing for subsequent loads, loading only for initial load
      if (reports.length === 0) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setError(null);
      
      const filters: any = {};
      if (filterCategory !== 'ALL') filters.category = filterCategory;
      if (filterStatus !== 'ALL') filters.status = filterStatus;
      if (filterSeverity !== 'ALL') filters.severityLevel = filterSeverity;
      if (searchTerm.trim()) filters.search = searchTerm.trim();

      const data = await reportService.getAllReports(filters);
      setReports(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reports');
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleCreateReport = async (reportData: Omit<Report, 'id' | 'date' | 'status' | 'upvotes'>) => {
    try {
      const createDto: CreateReportDto = {
        name: reportData.name,
        description: reportData.description,
        category: reportData.category,
        location: reportData.location,
        address: reportData.address,
        severityLevel: reportData.severityLevel,
        images: reportData.images
      };

      const newReport = await reportService.createReport(createDto);
      setReports([newReport, ...reports]);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error creating report:', err);
      alert('Failed to create report. Please try again.');
    }
  };

  const handleReportClick = (report: Report) => {
    setSelectedReport(report);
  };

  const handleUpvote = async (reportId: number) => {
    try {
      const report = reports.find(r => r.id === reportId);
      if (!report) return;

      // Update local state optimistically
      setReports(reports.map(r => 
        r.id === reportId 
          ? { ...r, upvotes: r.upvotes + 1 }
          : r
      ));

      if (selectedReport?.id === reportId) {
        setSelectedReport({ ...selectedReport, upvotes: selectedReport.upvotes + 1 });
      }

      await reportService.updateReport(reportId, {
        upvotes: report.upvotes + 1
      });
    } catch (err) {
      console.error('Error upvoting report:', err);
      fetchReports();
    }
  };

  // Show loading screen only on initial load
  if (loading && reports.length === 0) {
    return (
      <div className="app">
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: '#666'
        }}>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>Loading reports...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <MapContainer reports={reports} onReportClick={handleReportClick} />
      
      {/* Show refreshing indicator without unmounting UI */}
      {isRefreshing && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: 'rgba(59, 130, 246, 0.9)',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '6px',
          fontSize: '14px',
          zIndex: 9999,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}>
          Searching...
        </div>
      )}
      
      {error && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: 'rgba(239, 68, 68, 0.9)',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '6px',
          fontSize: '14px',
          zIndex: 9999,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>{error}</span>
          <button 
            onClick={fetchReports}
            style={{
              padding: '4px 8px',
              backgroundColor: 'white',
              color: '#ef4444',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500'
            }}
          >
            Retry
          </button>
        </div>
      )}
      
      <ReportList 
        reports={reports}
        onReportClick={handleReportClick}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterCategory={filterCategory}
        filterStatus={filterStatus}
        filterSeverity={filterSeverity}
        onFilterCategoryChange={setFilterCategory}
        onFilterStatusChange={setFilterStatus}
        onFilterSeverityChange={setFilterSeverity}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        isOpen={isListOpen}
        onOpenChange={setIsListOpen}
      />
      <NewReportButton 
        onClick={() => setIsModalOpen(true)} 
        isListOpen={isListOpen}
      />
      <CreateReportModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateReport}
      />
      <ReportDetailModal
        report={selectedReport}
        isOpen={selectedReport !== null}
        onClose={() => setSelectedReport(null)}
        onUpvote={handleUpvote}
      />
    </div>
  );
}

export default App;