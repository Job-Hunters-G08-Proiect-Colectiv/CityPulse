import { useState, useEffect, useRef } from 'react';
import ReportList from './components/ReportList';
import CreateReportModal from './components/CreateReportModal';
import ReportDetailModal from './components/ReportDetailModal';
import NewReportButton from './components/NewReportButton';
import MapContainer from './components/MapContainer';
import NetworkErrorModal from "./components/NetworkErrorModal";
import LogoutButton from './components/LogoutButton';
import { reportService, type CreateReportDto } from './services/reportService';
import { upvoteService } from './services/upvoteService';
import { API_ENDPOINTS } from './config/api';
import type { Report, ReportCategory, ReportStatus, SeverityLevel } from './types/report';
import './App.css';
import NotificationCenter, { type UINotification } from './components/NotificationCenter';
import { getCurrentUser } from './utils/authUtils';

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
  const prevStatusRef = useRef<Map<number, ReportStatus>>(new Map());
  const [notifications, setNotifications] = useState<UINotification[]>([]);
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchReports();
    }, 300); // Wait 300ms after user stops typing

    return () => clearTimeout(timeoutId);
  }, [searchTerm, filterCategory, filterStatus, filterSeverity, selectedCityId]);

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
      if (selectedCityId) filters.cityId = selectedCityId;

      const data = await reportService.getAllReports(filters);
      // Ensure no duplicate reports (by id) in UI state
      const uniqueById = Array.from(
        new Map(data.map((r: Report) => [r.id, r])).values()
      );
      setReports(uniqueById);
      // initialize previous statuses map on active dataset to avoid initial-change noise
      const map = new Map<number, ReportStatus>();
      for (const r of data) {
        map.set(r.id, r.status);
      }
      prevStatusRef.current = map;
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

  // silent background polling every 3s; show notifications if data changed
  useEffect(() => {
    let isCancelled = false;

    const checkForUpdates = async () => {
      try {
        if (document.hidden) return; // skip when tab not visible

        const latest = await reportService.getAllReports({});
        if (!isCancelled) {
          // detect status changes for current user's reports
          try {
            const user = getCurrentUser();
            const prev = prevStatusRef.current;
            if (user?.id) {
              const changedMine: { id: number; name: string; from: ReportStatus; to: ReportStatus }[] = [];
              for (const r of latest) {
                const before = prev.get(r.id);
                if (before && before !== r.status && r.createdBy === user.id) {
                  changedMine.push({ id: r.id, name: r.name, from: before, to: r.status });
                }
              }
              if (changedMine.length) {
                const newNotes = changedMine.map<UINotification>((c) => ({
                  id: `${c.id}-${Date.now()}`,
                  type: 'success',
                  message: `Your report \"${c.name}\" status changed: ${c.from} → ${c.to}`,
                }));
                const ids = newNotes.map(n => n.id);
                setNotifications((prevNotes) => ([...prevNotes, ...newNotes]));
                // auto-dismiss these specific notifications after 6s
                setTimeout(() => {
                  setNotifications((prevNotes) => prevNotes.filter(n => !ids.includes(n.id)));
                }, 6000);
              }
            }
          } catch (_) {
            // ignore notification errors
          }

          // update prev status map for next diff
          const map = new Map<number, ReportStatus>();
          for (const r of latest) map.set(r.id, r.status);
          prevStatusRef.current = map;

          // Update the UI list with client-side filtering
          const filtered = latest.filter(r => {
            if (filterCategory !== 'ALL' && r.category !== filterCategory) return false;
            if (filterStatus !== 'ALL' && r.status !== filterStatus) return false;
            if (filterSeverity !== 'ALL' && r.severityLevel !== filterSeverity) return false;
            if (searchTerm) {
              const term = searchTerm.toLowerCase();
              const matchesName = r.name.toLowerCase().includes(term);
              const matchesDesc = r.description?.toLowerCase().includes(term);
              const matchesAddr = r.address?.toLowerCase().includes(term);
              if (!matchesName && !matchesDesc && !matchesAddr) return false;
            }
            return true;
          });
          setReports(filtered);
        }
      } catch (_) {
        // ignore background errors; connectivity is handled by the health ping
      }
    };

    const id = setInterval(checkForUpdates, 3000);
    // fire one immediate background check after initial load finishes
    if (!loading) {
      checkForUpdates();
    }
    return () => {
      isCancelled = true;
      clearInterval(id);
    };
  }, [loading, filterCategory, filterStatus, filterSeverity, searchTerm]);

  const handleCreateReport = async (reportData: Omit<Report, 'id' | 'date' | 'status' | 'upvotes'>) => {
    try {
      const createDto: CreateReportDto = {
        name: reportData.name,
        description: reportData.description,
        category: reportData.category,
        location: reportData.location,
        address: reportData.address,
        severityLevel: reportData.severityLevel,
        images: reportData.images,
        cityId: selectedCityId ?? undefined,
      };

      const newReport = await reportService.createReport(createDto);
      setReports([newReport, ...reports]);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error creating report:', err);
      const message = (err as any)?.response?.data?.error || 'Failed to create report. Please try again.';
      alert(message);
    }
  };

  const handleReportClick = (report: Report) => {
    setSelectedReport(report);
  };

  const handleUpvote = (reportId: number, newCount: number) => {
    setReports(reports.map(r => 
      r.id === reportId 
        ? { ...r, upvotes: newCount }
        : r
    ));

    if (selectedReport?.id === reportId) {
      setSelectedReport({ ...selectedReport, upvotes: newCount });
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
      <LogoutButton />
      <MapContainer
        reports={reports}
        onReportClick={handleReportClick}
        onCityChange={setSelectedCityId}
      />
      
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
      <NotificationCenter
        notifications={notifications}
        onDismiss={(id) => setNotifications((ns) => ns.filter((n) => n.id !== id))}
      />
      <NetworkErrorModal open={networkError} onRetry={() => {
  setNetworkError(false);
  fetchReports();
}} />
    </div>
  );
}

export default App;