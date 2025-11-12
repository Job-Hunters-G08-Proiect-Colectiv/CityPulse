import { useEffect, useState } from "react";
import StatCard from "./StatCard";
import StatsBarChart from "./StatsBarChart";
import DistrictStatsTable from "./DistrictStatsTable";
import type { DistrictStats } from "./DistrictStatsTable";
import "./StatCard.css";

interface OverviewStats {
  total_reports: number;
  pending: number;
  working: number;
  planning: number;
  done: number;
}

interface CategoryStats {
  category: string;
  count: number;
}

interface SeverityStats {
  severity: string;
  count: number;
}

// Assuming cityId '1' for Cluj-Napoca. You might pass this as a prop.
const CITY_ID = 1;

async function fetchApi<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }
  const result = await response.json();
  if (!result.success) {
    throw new Error(`API error: ${result.message}`);
  }
  return result.data as T;
}
const StatisticsDashboard = () => {
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [districtStats, setDistrictStats] = useState<DistrictStats[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [severityStats, setSeverityStats] = useState<SeverityStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [overviewData, districtData, categoryData, severityData] =
          await Promise.all([
            fetchApi<OverviewStats>("/api/statistics/overview"),
            fetchApi<DistrictStats[]>(`/api/statistics/by-district/${CITY_ID}`),
            fetchApi<CategoryStats[]>("/api/statistics/by-category"),
            fetchApi<SeverityStats[]>("/api/statistics/by-severity"),
          ]);

        setOverview(overviewData);
        setDistrictStats(districtData);
        setCategoryStats(categoryData);
        setSeverityStats(severityData);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch statistics:", err);
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  if (loading) {
    return <div style={{ padding: "20px" }}>Loading statistics...</div>;
  }

  if (error) {
    return <div style={{ padding: "20px", color: "red" }}>{error}</div>;
  }

  if (!overview) {
    return <div style={{ padding: "20px" }}>No data available.</div>;
  }

  const categoryChartData = categoryStats.map((item) => ({
    name: item.category,
    count: item.count,
  }));
  const severityChartData = severityStats.map((item) => ({
    name: item.severity,
    count: item.count,
  }));

  return (
    <div className="statistics-dashboard" style={{ padding: "20px" }}>
      {/* 1. Overview Cards */}
      <div className="stat-card-grid">
        <StatCard title="Total Reports" value={overview.total_reports} />
        <StatCard title="Pending" value={overview.pending} />
        <StatCard title="Working" value={overview.working} />
        <StatCard title="Planning" value={overview.planning} />
        <StatCard title="Done" value={overview.done} />
      </div>

      {/* 2. Charts */}
      <div
        className="stats-charts-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "24px",
          marginBottom: "24px",
        }}
      >
        <StatsBarChart data={categoryChartData} title="Reports by Category" />
        <StatsBarChart data={severityChartData} title="Reports by Severity" />
      </div>

      {/* 3. District Table */}
      <DistrictStatsTable data={districtStats} />
    </div>
  );
};

export default StatisticsDashboard;
