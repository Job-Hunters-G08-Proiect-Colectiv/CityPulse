import "./MapContainer.css";
import MapView from "./MapView";
import type { Report } from "../types/report";
import { useState, useEffect } from "react";
import Modal from "react-modal";
import StatisticsDashboard from "./StatsDashboard";
import { X } from "lucide-react";

Modal.setAppElement("#root");

interface MapContainerProps {
  reports: Report[];
  onReportClick: (report: Report) => void;
}

const MapContainer = ({ reports, onReportClick }: MapContainerProps) => {
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);

  const [mapKey, setMapKey] = useState(0);

  useEffect(() => {
    if (!isStatsModalOpen) {
      const timer = setTimeout(() => setMapKey((prevKey) => prevKey + 1), 10);
      return () => clearTimeout(timer);
    }
  }, [isStatsModalOpen]);

  const modalStyles: Modal.Styles = {
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.75)",
      zIndex: 3000,
    },
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      background: "#f4f7fa",
      width: "90vw",
      maxWidth: "1200px",
      height: "90vh",
      padding: "0",
      border: "none",
      borderRadius: "8px",
    },
  };

  return (
    <div className="map-container">
      <div className="map-placeholder" key={mapKey}>
        {" "}
        <MapView
          reports={reports}
          onReportClick={onReportClick}
          onShowStatsClick={() => setIsStatsModalOpen(true)}
        />
      </div>

      <Modal
        isOpen={isStatsModalOpen}
        onRequestClose={() => setIsStatsModalOpen(false)}
        style={modalStyles}
        contentLabel="Statistics Dashboard"
      >
        <div
          style={{ height: "100%", display: "flex", flexDirection: "column" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px 24px",
              borderBottom: "1px solid #ddd",
              background: "#fff",
              flexShrink: 0,
            }}
          >
            <h2 style={{ margin: 0 }}>Dashboard Statistics</h2>
            <button
              onClick={() => setIsStatsModalOpen(false)}
              title="Close"
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              <X size={24} />
            </button>
          </div>

          <div style={{ overflowY: "auto", flexGrow: 1 }}>
            <StatisticsDashboard />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MapContainer;
