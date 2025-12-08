import { useState, useEffect, useRef } from "react";
import { reportService } from "../services/reportService";
import { getCurrentUser } from "../utils/authUtils";
import { useNavigate } from 'react-router-dom';
import type {
  Report,
  ReportCategory,
  ReportStatus,
  SeverityLevel,
} from "../types/report";
import LogoutButton from "./LogoutButton";
import ReportDetailModal from "./ReportDetailModal";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [filterStatus, setFilterStatus] = useState<ReportStatus | "ALL">("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const user = getCurrentUser();
  const navigate = useNavigate();

  // Initial fetch on mount and set up polling once
  useEffect(() => {
    fetchReports();
    const interval = setInterval(() => {
      fetchReportsSilent();
    }, 3000);
    return () => clearInterval(interval);
    // empty deps: only run on mount/unmount so polling isn't recreated while typing
  }, []);

  // When filters change, fetch silently without toggling loading
  useEffect(() => {
    fetchReportsSilent();
  }, [filterStatus, searchTerm]);

  // Use refs inside the polling function so it always reads latest filters
  const filterRef = useRef(filterStatus);
  const searchRef = useRef(searchTerm);

  useEffect(() => {
    filterRef.current = filterStatus;
  }, [filterStatus]);

  useEffect(() => {
    searchRef.current = searchTerm;
  }, [searchTerm]);

  const fetchReportsSilent = async () => {
    try {
      const filters: any = {};
      if (filterRef.current !== "ALL") filters.status = filterRef.current;
      if (String(searchRef.current).trim())
        filters.search = String(searchRef.current).trim();

      const data = await reportService.getAllReports(filters);
      setReports(data);
    } catch (error) {
      console.error("Error fetching reports silently:", error);
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (filterStatus !== "ALL") filters.status = filterStatus;
      if (searchTerm.trim()) filters.search = searchTerm.trim();

      const data = await reportService.getAllReports(filters);
      setReports(data);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this report?")) return;

    try {
      await reportService.deleteReport(id);
      setReports(reports.filter((r) => r.id !== id));
    } catch (error) {
      console.error("Error deleting report:", error);
      alert("Failed to delete report");
    }
  };

  const handleEdit = (report: Report) => {
    setEditingReport(report);
  };

  const handleSaveEdit = async () => {
    if (!editingReport) return;

    try {
      const updated = await reportService.updateReport(editingReport.id, {
        name: editingReport.name,
        description: editingReport.description,
        category: editingReport.category,
        status: editingReport.status,
        severityLevel: editingReport.severityLevel,
      });

      setReports(reports.map((r) => (r.id === updated.id ? updated : r)));
      setEditingReport(null);
    } catch (error) {
      console.error("Error updating report:", error);
      alert("Failed to update report");
    }
  };

  const handleStatusChange = async (id: number, newStatus: ReportStatus) => {
    try {
      const updated = await reportService.updateReport(id, {
        status: newStatus,
      });
      setReports(reports.map((r) => (r.id === id ? updated : r)));
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  const handleViewDetails = (report: Report) => {
    setSelectedReport(report);
  };

  const handleUpvote = async (reportId: number, newCount: number) => {
    try {
      const report = reports.find((r) => r.id === reportId);
      if (!report) return;

      const updated = { ...report, upvotes: newCount };
      setReports(reports.map((r) => (r.id === reportId ? updated : r)));
      // Update selected report if it's currently open
      if (selectedReport?.id === reportId) {
        setSelectedReport(updated);
      }
    } catch (error) {
      console.error("Error upvoting report:", error);
    }
  };

  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case "PENDING":
        return "#f59e0b";
      case "WORKING":
        return "#3b82f6";
      case "PLANNING":
        return "#8b5cf6";
      case "DONE":
        return "#10b981";
      default:
        return "#6b7280";
    }
  };

  const getSeverityColor = (severity: SeverityLevel) => {
    switch (severity) {
      case "LOW":
        return "#10b981";
      case "MEDIUM":
        return "#f59e0b";
      case "HIGH":
        return "#f97316";
      case "CRITICAL":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Welcome, {user?.username}</p>
        </div>
        <div className="admin-header-actions">
          <button
            className="btn-view-map"
            onClick={() => navigate('/')}
            title="View Map"
          >
            View Map
          </button>
          <LogoutButton inline />
        </div>
      </div>

      <div className="admin-controls">
        <input
          type="text"
          placeholder="Search reports..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <select
          value={filterStatus}
          onChange={(e) =>
            setFilterStatus(e.target.value as ReportStatus | "ALL")
          }
          className="filter-select"
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="WORKING">Working</option>
          <option value="PLANNING">Planning</option>
          <option value="DONE">Done</option>
        </select>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Reports</h3>
          <p className="stat-number">{reports.length}</p>
        </div>
        <div className="stat-card">
          <h3>Pending</h3>
          <p className="stat-number">
            {reports.filter((r) => r.status === "PENDING").length}
          </p>
        </div>
        <div className="stat-card">
          <h3>In Progress</h3>
          <p className="stat-number">
            {
              reports.filter(
                (r) => r.status === "WORKING" || r.status === "PLANNING"
              ).length
            }
          </p>
        </div>
        <div className="stat-card">
          <h3>Completed</h3>
          <p className="stat-number">
            {reports.filter((r) => r.status === "DONE").length}
          </p>
        </div>
      </div>

      <div className="reports-table-container">
        <table className="reports-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Category</th>
              <th>Status</th>
              <th>Severity</th>
              <th>Upvotes</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id}>
                <td>{report.id}</td>
                <td className="report-title">{report.name}</td>
                <td>
                  <span className="category-badge">{report.category}</span>
                </td>
                <td>
                  <select
                    value={report.status}
                    onChange={(e) =>
                      handleStatusChange(
                        report.id,
                        e.target.value as ReportStatus
                      )
                    }
                    className="status-select"
                    style={{ color: getStatusColor(report.status) }}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="WORKING">Working</option>
                    <option value="PLANNING">Planning</option>
                    <option value="DONE">Done</option>
                  </select>
                </td>
                <td>
                  <span
                    className="severity-badge"
                    style={{
                      backgroundColor: getSeverityColor(report.severityLevel),
                    }}
                  >
                    {report.severityLevel}
                  </span>
                </td>
                <td>{report.upvotes}</td>
                <td>{new Date(report.date).toLocaleDateString()}</td>
                <td className="actions-cell">
                  <button
                    onClick={() => handleViewDetails(report)}
                    className="btn-view"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleEdit(report)}
                    className="btn-edit"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(report.id)}
                    className="btn-delete"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Report Detail Modal (shows comments) */}
      <ReportDetailModal
        report={selectedReport}
        isOpen={selectedReport !== null}
        onClose={() => setSelectedReport(null)}
        onUpvote={handleUpvote}
      />

      {/* Edit Modal */}
      {editingReport && (
        <div className="modal-overlay" onClick={() => setEditingReport(null)}>
          <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Report</h2>

            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={editingReport.name}
                onChange={(e) =>
                  setEditingReport({ ...editingReport, name: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={editingReport.description || ""}
                onChange={(e) =>
                  setEditingReport({
                    ...editingReport,
                    description: e.target.value,
                  })
                }
                rows={4}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Category</label>
                <select
                  value={editingReport.category}
                  onChange={(e) =>
                    setEditingReport({
                      ...editingReport,
                      category: e.target.value as ReportCategory,
                    })
                  }
                >
                  <option value="POTHOLE">Pothole</option>
                  <option value="WASTE">Waste</option>
                  <option value="POLLUTION">Pollution</option>
                  <option value="LIGHTING">Lighting</option>
                  <option value="VANDALISM">Vandalism</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Severity</label>
                <select
                  value={editingReport.severityLevel}
                  onChange={(e) =>
                    setEditingReport({
                      ...editingReport,
                      severityLevel: e.target.value as SeverityLevel,
                    })
                  }
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  value={editingReport.status}
                  onChange={(e) =>
                    setEditingReport({
                      ...editingReport,
                      status: e.target.value as ReportStatus,
                    })
                  }
                >
                  <option value="PENDING">Pending</option>
                  <option value="WORKING">Working</option>
                  <option value="PLANNING">Planning</option>
                  <option value="DONE">Done</option>
                </select>
              </div>
            </div>

            <div className="modal-actions">
              <button
                onClick={() => setEditingReport(null)}
                className="btn-cancel"
              >
                Cancel
              </button>
              <button onClick={handleSaveEdit} className="btn-save">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
