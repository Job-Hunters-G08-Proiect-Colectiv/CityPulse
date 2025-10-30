import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
  useMap,
} from "react-leaflet";
import { ThumbsUp, ChevronLeft, ChevronRight } from "lucide-react";
import "./MapView.css";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";
import "leaflet.heat";
import MarkerClusterGroup from "react-leaflet-markercluster";
import { useEffect, useRef, useState } from "react";
import { severityToIntensity, type Report } from "../types/report";
import {
  getSeverityColor,
  getIconSize,
  getGlowRadius,
  getCategoryIconPath,
} from "../utils/reportUtils";

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

const createCustomIcon = (report: Report) => {
  const iconPath = getCategoryIconPath(report.category);
  const color = getSeverityColor(report.severityLevel);
  const glowRadius = getGlowRadius(report.upvotes);
  const iconSize = getIconSize(report.upvotes);

  const glowStyle =
    glowRadius > 0
      ? `filter: drop-shadow(0 0 ${
          glowRadius * 0.2
        }px ${color}) drop-shadow(0 0 ${
          glowRadius * 0.4
        }px ${color}) drop-shadow(0 0 ${
          glowRadius * 0.7
        }px ${color}) drop-shadow(0 0 ${glowRadius}px ${color});`
      : "";

  const html = `
    <div style="
      width: ${iconSize}px;
      height: ${iconSize * 1.3}px;
      ${glowStyle}
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <svg width="${iconSize * 1.8}" height="${
    iconSize * 1.8
  }" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg"
           style="position: absolute; z-index: 1;">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" 
              fill="${color}" 
              stroke="white" 
              stroke-width="1.5"
              transform="scale(1)"/>
      </svg>
      <img 
        src="${iconPath}" 
        style="
          position: absolute;
          top: 20%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: ${iconSize * 0.5}px;
          height: ${iconSize * 0.5}px;
          filter: brightness(0) saturate(100%) invert(100%);
          z-index: 2;
        "
      />
    </div>
  `;

  return L.divIcon({
    html: html,
    className: "custom-marker-icon",
    iconSize: [iconSize, iconSize * 1.3],
    iconAnchor: [iconSize / 2, iconSize * 1.3],
    popupAnchor: [0, -iconSize * 1.3],
  });
};

const isVideo = (filename: string) => {
  return (
    filename.toLowerCase().endsWith(".gif") ||
    filename.toLowerCase().endsWith(".mp4") ||
    filename.toLowerCase().endsWith(".webm")
  );
};

const ReportMedia = ({ report }: { report: Report }) => {
  const hasMedia = report.images && report.images.length > 0;
  const [index, setIndex] = useState(0);
  if (!hasMedia) return null;

  const gif = report.images.find(isVideo);

  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIndex((i) => (i + 1) % report.images.length);
  };

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIndex((i) => (i - 1 + report.images.length) % report.images.length);
  };

  const imageStyle: React.CSSProperties = {
    width: "100%",
    maxHeight: "200px",
    objectFit: "cover",
    borderRadius: "8px",
  };

  const buttonStyle: React.CSSProperties = {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    background: "rgba(255, 255, 255, 0.8)",
    border: "none",
    borderRadius: "50%",
    width: "32px",
    height: "32px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
  };

  return (
    <div
      style={{ marginTop: "10px", marginBottom: "10px", position: "relative" }}
      onClick={(e) => e.stopPropagation()}
    >
      {gif ? (
        <img src={gif} alt="Report media" style={imageStyle} />
      ) : (
        <>
          <img
            src={report.images[index]}
            alt={`Report image ${index + 1}`}
            style={imageStyle}
          />
          {report.images.length > 1 && (
            <>
              <button onClick={prev} style={{ ...buttonStyle, left: "5px" }}>
                <ChevronLeft size={20} />
              </button>
              <button onClick={next} style={{ ...buttonStyle, right: "5px" }}>
                <ChevronRight size={20} />
              </button>
              <div
                style={{
                  position: "absolute",
                  bottom: "8px",
                  right: "8px",
                  background: "rgba(0, 0, 0, 0.6)",
                  color: "white",
                  padding: "4px 8px",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              >
                {index + 1} / {report.images.length}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

const MapView = ({ reports, onReportClick }: MapViewProps) => {
  const position: LatLngExpression =
    reports.length > 0
      ? [reports[0].location.lat, reports[0].location.lng]
      : [46.77, 23.62];

  const topLeftBound = L.latLng(46.876, 23.323);
  const bottomRightBound = L.latLng(46.688, 23.781);
  const maxBounds = L.latLngBounds(topLeftBound, bottomRightBound);

  const markerRefs = useRef<Record<number, L.Marker | null>>({});
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);

  const heatPoints = reports.map(
    (r) =>
      [
        r.location.lat,
        r.location.lng,
        severityToIntensity[r.severityLevel],
      ] as [number, number, number]
  );

  const handleMarkerMouseOver = (id: number) => {
    if (hoverTimeoutRef.current !== null) clearTimeout(hoverTimeoutRef.current);
    markerRefs.current[id]?.openPopup();
  };

  const handleMarkerMouseOut = (id: number) => {
    hoverTimeoutRef.current = setTimeout(() => {
      markerRefs.current[id]?.closePopup();
    }, 300);
  };

  const handlePopupMouseEnter = () => {
    if (hoverTimeoutRef.current !== null) clearTimeout(hoverTimeoutRef.current);
  };

  const handlePopupMouseLeave = (id: number) => {
    hoverTimeoutRef.current = setTimeout(() => {
      markerRefs.current[id]?.closePopup();
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current !== null)
        clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  return (
    <MapContainer
      center={position}
      minZoom={12}
      zoom={13}
      id="map"
      zoomControl={false}
      maxBounds={maxBounds}
      doubleClickZoom={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="OpenStreetMap contributors"
      />
      <ZoomControl position="topright" />
      center={position}
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
        <MarkerClusterGroup>
          {reports.map((report) => (
            <Marker
              key={report.id}
              position={[report.location.lat, report.location.lng]}
              icon={createCustomIcon(report)}
              ref={(ref) => void (markerRefs.current[report.id] = ref)}
              eventHandlers={{
                mouseover: () => handleMarkerMouseOver(report.id),
                mouseout: () => handleMarkerMouseOut(report.id),
                click: () => onReportClick(report),
              }}
            >
              <Popup maxWidth={300} minWidth={250}>
                <div
                  style={{ padding: "8px" }}
                  onClick={(e) => e.stopPropagation()}
                  onMouseEnter={handlePopupMouseEnter}
                  onMouseLeave={() => handlePopupMouseLeave(report.id)}
                >
                  <b style={{ fontSize: "16px" }}>{report.name}</b>
                  <br />
                  <span style={{ fontSize: "14px", color: "#666" }}>
                    Category: {report.category}
                  </span>
                  <br />
                  <span style={{ fontSize: "14px", color: "#666" }}>
                    Severity: {report.severityLevel}
                  </span>
                  <br />

                  <ReportMedia report={report} />

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      marginTop: "8px",
                    }}
                  >
                    <ThumbsUp size={16} /> {report.upvotes}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      )}
    </MapContainer>
  );
};

export default MapView;
