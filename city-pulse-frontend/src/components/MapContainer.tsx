import "./MapContainer.css";
import MapView from "./MapView";
import type { Report } from "../types/report";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { isAdmin } from "../utils/authUtils";
import Modal from "react-modal";
import StatisticsDashboard from "./StatsDashboard";
import { MapPin, X } from "lucide-react";
import type { LatLngBoundsExpression } from "leaflet";

Modal.setAppElement("#root");

interface City {
  id: number;
  name: string;
  lat: number;
  lng: number;
  boundingbox?: [string, string, string, string];
}

interface MapContainerProps {
  reports: Report[];
  onReportClick: (report: Report) => void;
  onCityChange?: (cityId: number | null) => void;
}

const MapContainer = ({
  reports,
  onReportClick,
  onCityChange,
}: MapContainerProps) => {
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);

  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleCitySelect = useCallback(
    async (city: City) => {
      let cityWithBounds = { ...city };
      if (!city.boundingbox) {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
              city.name
            )}&format=json&limit=1`
          );
          const data = await res.json();
          if (data && data.length > 0 && data[0].boundingbox) {
            cityWithBounds.boundingbox = data[0].boundingbox;
          }
        } catch (err) {
          console.error("Failed to fetch city bounding box", err);
        }
      }

      setSelectedCity(cityWithBounds);
      if (onCityChange) {
        onCityChange(city.id);
      }
      setIsDropdownOpen(false);
    },
    [onCityChange]
  );

  // Fetch cities, one time
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/cities");
        const data = await res.json();
        setCities(data);

        if (data.length > 0) {
          const preferred =
            data.find((c: City) => c.name.toLowerCase().includes("cluj")) ||
            data[0];
          // Set initial city without triggering a new report fetch
          handleCitySelect(preferred);
        }
      } catch (err) {
        console.error("Failed to fetch cities", err);
      }
    };
    fetchCities();
  }, [handleCitySelect]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const cityCenter: [number, number] = useMemo(
    () => (selectedCity ? [selectedCity.lat, selectedCity.lng] : [0, 0]),
    [selectedCity]
  );

  const maxBounds: LatLngBoundsExpression | undefined = useMemo(() => {
    if (!selectedCity?.boundingbox) return undefined;
    return [
      [
        parseFloat(selectedCity.boundingbox[0]),
        parseFloat(selectedCity.boundingbox[2]),
      ],
      [
        parseFloat(selectedCity.boundingbox[1]),
        parseFloat(selectedCity.boundingbox[3]),
      ],
    ];
  }, [selectedCity]);

  if (!selectedCity) {
    return (
      <div className="map-container">
        <div className="map-placeholder">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            Loading map...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="map-container">
      <div className="city-selector">
        <div className="city-selector-inner" ref={dropdownRef}>
          <MapPin size={18} color="#2563eb" />
          <div className="custom-select-container">
            <button
              className="custom-select-trigger"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span>{selectedCity.name}</span>
            </button>
            {isDropdownOpen && (
              <div className="custom-select-options">
                {cities.map((city) => (
                  <div
                    key={city.id}
                    className={`custom-select-option ${selectedCity.id === city.id ? "selected" : ""
                      }`}
                    onClick={() => handleCitySelect(city)}
                  >
                    {city.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="map-placeholder">
        <MapView
          reports={reports}
          cityCenter={cityCenter}
          cityId={selectedCity.id}
          onReportClick={onReportClick}
          onShowStatsClick={() => setIsStatsModalOpen(true)}
          maxBounds={maxBounds}
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
            <StatisticsDashboard cityId={selectedCity.id} />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MapContainer;
