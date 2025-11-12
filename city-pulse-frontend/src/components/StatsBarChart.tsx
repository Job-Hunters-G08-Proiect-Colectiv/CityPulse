import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import "./StatsBarChart.css";

interface ChartData {
  name: string;
  count: number;
}

interface StatsBarChartProps {
  data: ChartData[];
  title: string;
}

const StatsBarChart = ({ data, title }: StatsBarChartProps) => {
  return (
    <div className="stats-chart-container">
      <h3>{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical" margin={{ left: 30 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="name"
            width={100}
            tick={{ fontSize: 12 }}
          />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatsBarChart;
