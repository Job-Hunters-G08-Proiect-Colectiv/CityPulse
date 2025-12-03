import "./MapContainer.css";
import MapView from "./MapView";
import type { Report } from "../types/report";
import { useState, useEffect } from "react";
import Modal from "react-modal";
import StatisticsDashboard from "./StatsDashboard";
import { MapPin, X } from "lucide-react";

Modal.setAppElement("#root");

interface City {
  id: number;
  name: string;
  lat: number;
  lng: number;
}

interface MapContainerProps {
  reports: Report[];
  onReportClick: (report: Report) => void;
  onCityChange?: (cityId: number | null) => void;
}

const MapContainer = ({ reports, onReportClick, onCityChange }: MapContainerProps) => {
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [mapKey, setMapKey] = useState(0);

  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  // Fetch cities, one time
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/cities");
        const data = await res.json();
        setCities(data);

        // Prefer Cluj-Napoca as default if it exists, otherwise first city
        if (data.length > 0) {
          const preferred =
            data.find((c: City) => c.name.toLowerCase().includes("cluj")) ||
            data[0];
          setSelectedCity(preferred);
          if (onCityChange) {
            onCityChange(preferred.id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch cities", err);
      }
    };
    fetchCities();
  }, []);

  // Dropdown handler
  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cityId = parseInt(e.target.value);
    const city = cities.find((c) => c.id === cityId);
    if (city) {
      setSelectedCity(city);
      if (onCityChange) {
        onCityChange(city.id);
      }
    }
  };

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
      <div className="city-selector">
        <div className="city-selector-inner">
          <MapPin size={18} color="#2563eb" />
          <select
            className="city-select"
            value={selectedCity?.id || ""}
            onChange={handleCityChange}
          >
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="map-placeholder" key={mapKey}>
        {selectedCity ? (
          <MapView
            reports={reports}
            cityCenter={[selectedCity.lat, selectedCity.lng]} 
            cityId={selectedCity.id}
            onReportClick={onReportClick}
            onShowStatsClick={() => setIsStatsModalOpen(true)}
          />
        ) : (
          <div style={{display:'flex', alignItems:'center', justifyContent:'center', height:'100%'}}>
            Loading map...
          </div>
        )}
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
