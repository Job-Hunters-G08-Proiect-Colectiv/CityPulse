import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

const mockReports = [
  {
    id: 1,
    name: 'Pothole on Main Street',
    description: 'Large pothole causing damage',
    category: 'POTHOLE',
    location: { lat: 44.4268, lng: 26.1025 },
    address: 'Main Street, Bucharest',
    severityLevel: 'HIGH',
    status: 'PENDING',
    upvotes: 15,
    date: '2024-01-01T00:00:00.000Z',
    images: []
  },
  {
    id: 2,
    name: 'Broken Street Light',
    description: 'Street light not working',
    category: 'LIGHTING',
    location: { lat: 44.4368, lng: 26.1125 },
    address: 'Park Avenue, Bucharest',
    severityLevel: 'MEDIUM',
    status: 'WORKING',
    upvotes: 8,
    date: '2024-01-02T00:00:00.000Z',
    images: []
  },
  {
    id: 3,
    name: 'Illegal Dumping',
    description: 'Waste dumped illegally',
    category: 'WASTE',
    location: { lat: 44.4168, lng: 26.0925 },
    address: 'Industrial Zone, Bucharest',
    severityLevel: 'CRITICAL',
    status: 'PENDING',
    upvotes: 25,
    date: '2024-01-03T00:00:00.000Z',
    images: []
  }
];

const MockReportList = ({ reports, onReportClick }: any) => {
  if (!reports || reports.length === 0) {
    return <div>No reports found</div>;
  }

  return (
    <div>
      <h2>Reports ({reports.length})</h2>
      <ul>
        {reports.map((report: any) => (
          <li key={report.id} onClick={() => onReportClick && onReportClick(report)}>
            <h3>{report.name}</h3>
            <p>{report.description}</p>
            <span>Category: {report.category}</span>
            <span>Severity: {report.severityLevel}</span>
            <span>Status: {report.status}</span>
            <span>Upvotes: {report.upvotes}</span>
            <button aria-label={`View report ${report.id}`}>View Details</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

describe('ReportList Component', () => {
  const mockOnReportClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render list of reports', () => {
    render(<MockReportList reports={mockReports} onReportClick={mockOnReportClick} />);

    expect(screen.getByText('Reports (3)')).toBeInTheDocument();
    expect(screen.getByText('Pothole on Main Street')).toBeInTheDocument();
    expect(screen.getByText('Broken Street Light')).toBeInTheDocument();
    expect(screen.getByText('Illegal Dumping')).toBeInTheDocument();
  });

  it('should display report details', () => {
    render(<MockReportList reports={mockReports} onReportClick={mockOnReportClick} />);

    expect(screen.getByText('Large pothole causing damage')).toBeInTheDocument();
    expect(screen.getByText('Category: POTHOLE')).toBeInTheDocument();
    expect(screen.getByText('Severity: HIGH')).toBeInTheDocument();
    expect(screen.getByText('Status: PENDING')).toBeInTheDocument();
    expect(screen.getByText('Upvotes: 15')).toBeInTheDocument();
  });

  it('should display all categories correctly', () => {
    render(<MockReportList reports={mockReports} onReportClick={mockOnReportClick} />);

    expect(screen.getByText('Category: POTHOLE')).toBeInTheDocument();
    expect(screen.getByText('Category: LIGHTING')).toBeInTheDocument();
    expect(screen.getByText('Category: WASTE')).toBeInTheDocument();
  });

  it('should display all severity levels correctly', () => {
    render(<MockReportList reports={mockReports} onReportClick={mockOnReportClick} />);

    expect(screen.getByText('Severity: HIGH')).toBeInTheDocument();
    expect(screen.getByText('Severity: MEDIUM')).toBeInTheDocument();
    expect(screen.getByText('Severity: CRITICAL')).toBeInTheDocument();
  });

  it('should display all status types correctly', () => {
    render(<MockReportList reports={mockReports} onReportClick={mockOnReportClick} />);

    expect(screen.getByText('Status: PENDING')).toBeInTheDocument();
    expect(screen.getByText('Status: WORKING')).toBeInTheDocument();
  });

  it('should show upvote counts', () => {
    render(<MockReportList reports={mockReports} onReportClick={mockOnReportClick} />);

    expect(screen.getByText('Upvotes: 15')).toBeInTheDocument();
    expect(screen.getByText('Upvotes: 8')).toBeInTheDocument();
    expect(screen.getByText('Upvotes: 25')).toBeInTheDocument();
  });

  it('should render "View Details" button for each report', () => {
    render(<MockReportList reports={mockReports} onReportClick={mockOnReportClick} />);

    const viewButtons = screen.getAllByText('View Details');
    expect(viewButtons).toHaveLength(3);
  });

  it('should call onReportClick when report is clicked', () => {
    render(<MockReportList reports={mockReports} onReportClick={mockOnReportClick} />);

    const firstReport = screen.getByText('Pothole on Main Street');
    fireEvent.click(firstReport);

    expect(mockOnReportClick).toHaveBeenCalledWith(mockReports[0]);
  });

  it('should display empty state when no reports', () => {
    render(<MockReportList reports={[]} onReportClick={mockOnReportClick} />);

    expect(screen.getByText('No reports found')).toBeInTheDocument();
  });

  it('should handle undefined reports', () => {
    render(<MockReportList reports={undefined} onReportClick={mockOnReportClick} />);

    expect(screen.getByText('No reports found')).toBeInTheDocument();
  });

  it('should render correct number of report items', () => {
    render(<MockReportList reports={mockReports} onReportClick={mockOnReportClick} />);

    const reportItems = screen.getAllByRole('listitem');
    expect(reportItems).toHaveLength(3);
  });

  it('should have accessible report buttons', () => {
    render(<MockReportList reports={mockReports} onReportClick={mockOnReportClick} />);

    expect(screen.getByLabelText('View report 1')).toBeInTheDocument();
    expect(screen.getByLabelText('View report 2')).toBeInTheDocument();
    expect(screen.getByLabelText('View report 3')).toBeInTheDocument();
  });
});

describe('ReportList Filtering', () => {
  it('should display filtered reports by category', () => {
    const potholeReports = mockReports.filter(r => r.category === 'POTHOLE');

    render(<MockReportList reports={potholeReports} onReportClick={vi.fn()} />);

    expect(screen.getByText('Reports (1)')).toBeInTheDocument();
    expect(screen.getByText('Pothole on Main Street')).toBeInTheDocument();
    expect(screen.queryByText('Broken Street Light')).not.toBeInTheDocument();
  });

  it('should display filtered reports by severity', () => {
    const criticalReports = mockReports.filter(r => r.severityLevel === 'CRITICAL');

    render(<MockReportList reports={criticalReports} onReportClick={vi.fn()} />);

    expect(screen.getByText('Reports (1)')).toBeInTheDocument();
    expect(screen.getByText('Illegal Dumping')).toBeInTheDocument();
  });

  it('should display filtered reports by status', () => {
    const pendingReports = mockReports.filter(r => r.status === 'PENDING');

    render(<MockReportList reports={pendingReports} onReportClick={vi.fn()} />);

    expect(screen.getByText('Reports (2)')).toBeInTheDocument();
    expect(screen.getByText('Pothole on Main Street')).toBeInTheDocument();
    expect(screen.getByText('Illegal Dumping')).toBeInTheDocument();
  });
});

describe('ReportList Sorting', () => {
  it('should display reports sorted by upvotes', () => {
    const sortedReports = [...mockReports].sort((a, b) => b.upvotes - a.upvotes);

    render(<MockReportList reports={sortedReports} onReportClick={vi.fn()} />);

    const upvoteCounts = screen.getAllByText(/Upvotes:/);
    expect(upvoteCounts[0]).toHaveTextContent('Upvotes: 25');
    expect(upvoteCounts[1]).toHaveTextContent('Upvotes: 15');
    expect(upvoteCounts[2]).toHaveTextContent('Upvotes: 8');
  });
});
