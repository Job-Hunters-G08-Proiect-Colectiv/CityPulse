import { useState, useEffect } from 'react';
import ReportList from './components/ReportList';
import CreateReportModal from './components/CreateReportModal';
import ReportDetailModal from './components/ReportDetailModal';
import NewReportButton from './components/NewReportButton';
import MapContainer from './components/MapContainer';
import NetworkErrorModal from "./components/NetworkErrorModal";
import { reportService, type CreateReportDto } from './services/reportService';
import { API_ENDPOINTS } from './config/api';
import type { Report, ReportCategory, ReportStatus, SeverityLevel } from './types/report';
import './App.css';

function App() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false); // New state for subsequent loads
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isListOpen, setIsListOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<ReportCategory | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<ReportStatus | 'ALL'>('ALL');
  const [filterSeverity, setFilterSeverity] = useState<SeverityLevel | 'ALL'>('ALL');
  const [networkError, setNetworkError] = useState(false);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchReports();
    }, 300); // Wait 300ms after user stops typing

    return () => clearTimeout(timeoutId);
  }, [searchTerm, filterCategory, filterStatus, filterSeverity]);

  // Background connectivity ping every 3 seconds
  useEffect(() => {
    let isCancelled = false;

    const pingBackend = async () => {
      try {
        if (!navigator.onLine) {
          if (!isCancelled) setNetworkError(true);
          return;
        }
        const resp = await fetch(API_ENDPOINTS.HEALTH, {
          method: 'GET',
          cache: 'no-store',
        });
        if (!isCancelled) {
          if (!resp.ok) setNetworkError(true);
          else setNetworkError(false);
        }
      } catch (e) {
        if (!isCancelled) setNetworkError(true);
      }
    };

    const intervalId = setInterval(pingBackend, 3000);
    // Fire one immediate ping on mount
    pingBackend();

    return () => {
      isCancelled = true;
      clearInterval(intervalId);
    };
  }, []);

  // Fetch reports from backend with filters
  const fetchReports = async () => {
    try {
      // Use isRefreshing for subsequent loads, loading only for initial load
      if (reports.length === 0) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setNetworkError(false);
      
      const filters: any = {};
      if (filterCategory !== 'ALL') filters.category = filterCategory;
      if (filterStatus !== 'ALL') filters.status = filterStatus;
      if (filterSeverity !== 'ALL') filters.severityLevel = filterSeverity;
      if (searchTerm.trim()) filters.search = searchTerm.trim();

      const data = await reportService.getAllReports(filters);
      setReports(data);
    } catch (err: any) {
      const message = (err?.message || '').toLowerCase();
      if (!navigator.onLine || message.includes('failed to fetch') || message.includes('network')) {
        setNetworkError(true);
      }
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
        <NetworkErrorModal open={networkError} onRetry={() => {
  setNetworkError(false);
  fetchReports();
}} />
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
      
      {/* Removed top-right error toast; network modal remains the sole error UI */}
      
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
      <NetworkErrorModal open={networkError} onRetry={() => {
  setNetworkError(false);
  fetchReports();
}} />
    </div>
  );
}

export default App;