import { useState } from 'react';
import ReportList from './components/ReportList';
import CreateReportModal from './components/CreateReportModal';
import ReportDetailModal from './components/ReportDetailModal';
import NewReportButton from './components/NewReportButton';
import MapContainer from './components/MapContainer';
import type { Report, ReportCategory, ReportStatus, SeverityLevel } from './types/report';
import './App.css';

// Mock data for development
const mockReports: Report[] = [
  {
    id: '1',
    name: 'Large pothole on Main Street',
    date: new Date('2025-10-20T10:30:00'),
    location: { lat: 40.7128, lng: -74.0060 },
    address: '123 Main Street, New York, NY 10001',
    category: 'POTHOLE' as ReportCategory,
    images: [
      'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80',
      'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&q=80',
      'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80'
    ],
    status: 'PENDING' as ReportStatus,
    severityLevel: 'HIGH' as SeverityLevel,
    upvotes: 12,
    description: 'There is a large pothole on Main Street that has been causing issues for vehicles. The pothole is approximately 2 feet in diameter and 6 inches deep. It poses a significant risk to drivers, especially during nighttime hours.'
  },
  {
    id: '2',
    name: 'Overflowing trash bin at Central Park',
    date: new Date('2025-10-21T08:15:00'),
    location: { lat: 40.7829, lng: -73.9654 },
    address: 'Central Park West, New York, NY 10024',
    category: 'WASTE' as ReportCategory,
    images: [
      'https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=800&q=80',
      'https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=800&q=80'
    ],
    status: 'WORKING' as ReportStatus,
    severityLevel: 'MEDIUM' as SeverityLevel,
    upvotes: 5,
    description: 'The trash bin near the main entrance of Central Park has been overflowing for several days. Waste is scattered around the area, attracting pests and creating an unpleasant environment for park visitors.'
  },
  {
    id: '3',
    name: 'Air pollution near factory',
    date: new Date('2025-10-19T14:20:00'),
    location: { lat: 40.7589, lng: -73.9851 },
    address: '456 River Street, New York, NY 10002',
    category: 'POLLUTION' as ReportCategory,
    images: [
      'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800&q=80',
      'https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=800&q=80',
      'https://images.unsplash.com/photo-1583484963986-cca5c76dd59d?w=800&q=80'
    ],
    status: 'PLANNING' as ReportStatus,
    severityLevel: 'CRITICAL' as SeverityLevel,
    upvotes: 24,
    description: 'Heavy air pollution has been observed near the industrial factory on River Street. The air quality has deteriorated significantly, causing respiratory issues for nearby residents. Immediate action is required to address this environmental hazard.'
  },
  {
    id: '4',
    name: 'Broken street light on Oak Avenue',
    date: new Date('2025-10-18T19:45:00'),
    location: { lat: 40.7489, lng: -73.9680 },
    address: '789 Oak Avenue, New York, NY 10003',
    category: 'LIGHTING' as ReportCategory,
    images: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80'
    ],
    status: 'PENDING' as ReportStatus,
    severityLevel: 'MEDIUM' as SeverityLevel,
    upvotes: 8,
    description: 'Street light has been non-functional for over a week, creating safety concerns for pedestrians during nighttime hours.'
  },
  {
    id: '5',
    name: 'Graffiti vandalism on community center',
    date: new Date('2025-10-17T11:20:00'),
    location: { lat: 40.7580, lng: -73.9855 },
    address: '321 Community Drive, New York, NY 10004',
    category: 'VANDALISM' as ReportCategory,
    images: [
      'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=800&q=80',
      'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=800&q=80'
    ],
    status: 'DONE' as ReportStatus,
    severityLevel: 'LOW' as SeverityLevel,
    upvotes: 3,
    description: 'Community center walls have been defaced with spray paint graffiti. The facility management has been notified and cleanup is scheduled.'
  }
];

function App() {
  const [reports, setReports] = useState<Report[]>(mockReports);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isListOpen, setIsListOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<ReportCategory | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<ReportStatus | 'ALL'>('ALL');
  const [filterSeverity, setFilterSeverity] = useState<SeverityLevel | 'ALL'>('ALL');

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'ALL' || report.category === filterCategory;
    const matchesStatus = filterStatus === 'ALL' || report.status === filterStatus;
    const matchesSeverity = filterSeverity === 'ALL' || report.severityLevel === filterSeverity;
    return matchesSearch && matchesCategory && matchesStatus && matchesSeverity;
  });

  const handleCreateReport = (reportData: Omit<Report, 'id' | 'date' | 'status' | 'upvotes'>) => {
    const newReport: Report = {
      id: Date.now().toString(),
      ...reportData,
      date: new Date(),
      status: 'PENDING' as ReportStatus,
      upvotes: 0
    };
    setReports([newReport, ...reports]);
  };

  const handleReportClick = (report: Report) => {
    setSelectedReport(report);
  };

  const handleUpvote = (reportId: string) => {
    setReports(reports.map(report => 
      report.id === reportId 
        ? { ...report, upvotes: report.upvotes + 1 }
        : report
    ));
    if (selectedReport?.id === reportId) {
      setSelectedReport({ ...selectedReport, upvotes: selectedReport.upvotes + 1 });
    }
  };

  return (
    <div className="app">
      <MapContainer />
      <ReportList 
        reports={filteredReports}
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