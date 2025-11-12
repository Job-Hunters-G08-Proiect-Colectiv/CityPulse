import "./DistrictStatsTable.css";

// Define the type to match your API output
export interface DistrictStats {
  district: string;
  total_reports: number;
  pending: number;
  done: number;
}

interface DistrictStatsTableProps {
  data: DistrictStats[];
}

const DistrictStatsTable = ({ data }: DistrictStatsTableProps) => {
  return (
    <div className="stats-table-container">
      <h3>Reports by District</h3>
      <table className="stats-table">
        <thead>
          <tr>
            <th>District</th>
            <th>Total Reports</th>
            <th>Pending</th>
            <th>Done</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.district}>
              <td>{row.district}</td>
              <td>{row.total_reports}</td>
              <td>{row.pending}</td>
              <td>{row.done}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DistrictStatsTable;
