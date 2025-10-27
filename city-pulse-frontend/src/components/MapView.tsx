import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
  useMap,
} from "react-leaflet";
import { ThumbsUp } from "lucide-react";
import "./MapView.css";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";
import "leaflet.heat";
import { severityToIntensity, type Report } from "../types/report";
import { useRef, useState, useEffect } from "react";

interface MapViewProps {
  reports: Report[];
  onReportClick: (report: Report) => void;
}

function HeatmapLayer({ points }: { points: [number, number, number?][] }) {
  const map = useMap();

  useEffect(() => {
    const heatLayer = L.heatLayer(points, {
      radius: 45,
      blur: 25,
      maxZoom: 17,
      minOpacity: 0.4,
      maxOpacity: 0.9,
      gradient: {
        0.0: "rgba(0, 128, 255, 0.7)",
        0.3: "rgba(0, 255, 0, 0.7)",
        0.5: "rgba(255, 255, 0, 0.8)",
        0.7: "rgba(255, 132, 0, 0.8)",
        1.0: "rgba(255, 0, 0, 1.0)",
      },
    });
    heatLayer.addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points]);

  return null;
}

const MapView = ({ reports, onReportClick }: MapViewProps) => {
  const position: LatLngExpression =
    reports.length > 0
      ? [reports[0].location.lat, reports[0].location.lng]
      : [46.77, 23.62];

  const markerRefs = useRef<any>({});

  const [showHeatmap, setShowHeatmap] = useState(false);
  const heatPoints = reports.map(
    (r) =>
      [
        r.location.lat,
        r.location.lng,
        severityToIntensity[r.severityLevel],
      ] as [number, number, number]
  );

  return (
    <MapContainer
      center={position}
      zoom={13}
      id="map"
      zoomControl={false}
      doubleClickZoom={false}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 400,
          pointerEvents: "none",
        }}
      />

      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="OpenStreetMap contributors"
      />

      <ZoomControl position="topright" />

      <div
        className="leaflet-top leaflet-right"
        style={{ zIndex: 1000, marginTop: "80px" }}
      >
        <div className="leaflet-control leaflet-bar">
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            style={{
              background: "#fff",
              border: "none",
              borderRadius: "4px",
              padding: "6px 10px",
              cursor: "pointer",
              fontWeight: 600,
              boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
            }}
          >
            {showHeatmap ? "Show Markers" : "Show Heatmap"}
          </button>
        </div>
      </div>

      {showHeatmap ? (
        <HeatmapLayer points={heatPoints} />
      ) : (
        reports.map((report) => (
          <Marker
            key={report.id}
            position={[report.location.lat, report.location.lng]}
            ref={(ref) => {
              markerRefs.current[report.id] = ref;
            }}
            eventHandlers={{
              mouseover: () => {
                if (markerRefs.current[report.id]) {
                  markerRefs.current[report.id].openPopup();
                }
              },
              mouseout: () => {
                if (markerRefs.current[report.id]) {
                  markerRefs.current[report.id].closePopup();
                }
              },
              click: () => {
                onReportClick(report);
              },
            }}
          >
            <Popup>
              <b>{report.name}</b>
              <br />
              Category: {report.category}
              <br />
              Severity: {report.severityLevel}.
              <br />
              <div
                style={{ display: "flex", alignItems: "center", gap: "5px" }}
              >
                <ThumbsUp size={16} /> {report.upvotes}
              </div>
            </Popup>
          </Marker>
        ))
      )}
    </MapContainer>
  );
};

export default MapView;
