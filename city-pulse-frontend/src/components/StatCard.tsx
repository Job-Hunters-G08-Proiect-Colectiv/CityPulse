import "./StatCard.css";

interface StatCardProps {
  title: string;
  value: number | string;
}

const StatCard = ({ title, value }: StatCardProps) => (
  <div className="stat-card">
    <div className="stat-value">{value}</div>
    <div className="stat-title">{title}</div>
  </div>
);

export default StatCard;
