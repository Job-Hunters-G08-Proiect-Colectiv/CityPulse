import "./MapContainer.css";
import MapView from "./MapView";
import type { Report } from "../types/report";

interface MapContainerProps {
  reports: Report[];
  onReportClick: (report: Report) => void;
}

const MapContainer = ({ reports, onReportClick }: MapContainerProps) => {
  return (
    <div className="map-container">
      <div className="map-placeholder">
        <MapView reports={reports} onReportClick={onReportClick} />
      </div>
    </div>
  );
};

export default MapContainer;
