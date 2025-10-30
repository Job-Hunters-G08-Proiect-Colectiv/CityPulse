import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
  useMap,
} from "react-leaflet";
import { ThumbsUp, ChevronLeft, ChevronRight } from 'lucide-react';
import "./MapView.css";
<<<<<<< HEAD
import type { LatLngExpression } from "leaflet";
import L from "leaflet";
import "leaflet.heat";
import MarkerClusterGroup from "react-leaflet-markercluster";
import { useEffect, useRef, useState } from "react";
import { severityToIntensity, type Report } from "../types/report";
=======
import { type LatLngExpression } from "leaflet";
import L from 'leaflet';
import MarkerClusterGroup from "react-leaflet-markercluster";
import "./MapView.css";
import type { Report } from "../types/report";
import { useEffect, useRef, useState } from "react";
>>>>>>> 145167a2bb027cf60865b28b74f48b41ba3d135c
import { getSeverityColor, getIconSize, getGlowRadius, getCategoryIconPath } from "../utils/reportUtils";

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

// Create custom icon with glow effect
const createCustomIcon = (report: Report) => {
  const iconPath = getCategoryIconPath(report.category);
  const color = getSeverityColor(report.severityLevel);
  const glowRadius = getGlowRadius(report.upvotes);
  const iconSize = getIconSize(report.upvotes);
  
  const glowStyle = glowRadius > 0 
    ? `filter: drop-shadow(0 0 ${glowRadius * 0.2}px ${color}) drop-shadow(0 0 ${glowRadius * 0.4}px ${color}) drop-shadow(0 0 ${glowRadius * 0.7}px ${color}) drop-shadow(0 0 ${glowRadius}px ${color});`
    : '';

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
      <svg width="${iconSize * 1.8}" height="${iconSize * 1.8}" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg"
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
    className: 'custom-marker-icon',
    iconSize: [iconSize, iconSize * 1.3],
    iconAnchor: [iconSize / 2, iconSize * 1.3],
    popupAnchor: [0, -iconSize * 1.3]
  });
};

// Check if a file is a video/gif based on its extension
const isVideo = (filename: string) => {
  return filename.toLowerCase().endsWith('.gif') ||
         filename.toLowerCase().endsWith('.mp4') ||
         filename.toLowerCase().endsWith('.webm');
};

interface ReportMediaProps {
  report: Report;
  currentImageIndex: number;
  onPrev: (e: React.MouseEvent) => void;
  onNext: (e: React.MouseEvent) => void;
}

const ReportMedia = ({ report, currentImageIndex, onPrev, onNext }: ReportMediaProps) => {
  const hasMedia = report.images && report.images.length > 0;
  if (!hasMedia) return null;

  const gif = report.images.find(isVideo);

  const imageStyle: React.CSSProperties = {
    width: '100%',
    maxHeight: '200px',
    objectFit: 'cover',
    borderRadius: '8px'
  };

  const buttonStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'rgba(255, 255, 255, 0.8)',
    border: 'none',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
  };

  return (
    <div style={{ marginTop: '10px', marginBottom: '10px', position: 'relative' }}>
      {gif ? (
        <img src={gif} alt="Report media" style={imageStyle} />
      ) : (
        <>
          <img src={report.images[currentImageIndex]} alt={`Report image ${currentImageIndex + 1}`} style={imageStyle} />
          {report.images.length > 1 && (
            <>
              <button onClick={onPrev} style={{ ...buttonStyle, left: '5px' }}>
                <ChevronLeft size={20} />
              </button>
              <button onClick={onNext} style={{ ...buttonStyle, right: '5px' }}>
                <ChevronRight size={20} />
              </button>
              <div style={{
                position: 'absolute',
                bottom: '8px',
                right: '8px',
                background: 'rgba(0, 0, 0, 0.6)',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px'
              }}>
                {currentImageIndex + 1} / {report.images.length}
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
  const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: number]: number }>({}); // State to track images on carousel
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null); // Timeout id

  // Handler for image carousel navigation:
  const nextImage = (reportId: number, totalImages: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => ({
      ...prev,
      [reportId]: ((prev[reportId] || 0) + 1) % totalImages
    }));
  };

  // Same as previous handler but goes backward
  const prevImage = (reportId: number, totalImages: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => ({
      ...prev,
      [reportId]: ((prev[reportId] || 0) - 1 + totalImages) % totalImages
    }));
  };

  // Cancel the pending timeout (popup about to close) and open the popup
  const handleMarkerMouseOver = (reportId: number) => {
    if (hoverTimeoutRef.current !== null) {
      clearTimeout(hoverTimeoutRef.current);
    }
    if (markerRefs.current[reportId]) {
      markerRefs.current[reportId].openPopup();
    }
  };

  // Start a timeout to close the popup after a delay when mouse leaves the marker
  const handleMarkerMouseOut = (reportId: number) => {
    hoverTimeoutRef.current = setTimeout(() => {
      if (markerRefs.current[reportId]) {
        markerRefs.current[reportId].closePopup();
      }
    }, 300); // 300 ms delay before closing
  };

  // Cancel the pending timeout when mouse hover over the popup
  const handlePopupMouseEnter = () => {
    if (hoverTimeoutRef.current !== null) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };

  // Start a timeout to close the popup after a delay when mouse leaves the popup
  const handlePopupMouseLeave = (reportId: number) => {
    hoverTimeoutRef.current = setTimeout(() => {
      if (markerRefs.current[reportId]) {
        markerRefs.current[reportId].closePopup();
      }
    }, 300);
  };

  // Clear timeout on component unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current !== null) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

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
    <MapContainer center={position} minZoom={12} zoom={13} id="map" zoomControl={false} maxBounds={maxBounds} doubleClickZoom={false}>
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

<<<<<<< HEAD
      {showHeatmap ? (
        <HeatmapLayer points={heatPoints} />
      ) : (
        <MarkerClusterGroup>
          {reports.map((report) => {
            const currentIndex = currentImageIndex[report.id] || 0; // Get current image index for this report

            return (
              <Marker
              key={report.id}
              position={[report.location.lat, report.location.lng]}
              icon={createCustomIcon(report)}
              ref={(ref) => void (markerRefs.current[report.id] = ref)}
=======
      <MarkerClusterGroup>
        {reports.map((report) => {
          const hasMedia = report.images && report.images.length > 0;
          const currentIndex = currentImageIndex[report.id] || 0;
          const hasGif = hasMedia && report.images.some(img => isVideo(img));

          return (
            <Marker
              key={report.id}
              position={[report.location.lat, report.location.lng]}
              icon={createCustomIcon(report)}
              ref={(ref) => {
                markerRefs.current[report.id] = ref;
              }}
>>>>>>> 145167a2bb027cf60865b28b74f48b41ba3d135c
              eventHandlers={{
                mouseover: () => handleMarkerMouseOver(report.id),
                mouseout: () => handleMarkerMouseOut(report.id),
                click: () => {
                  onReportClick(report)
                },
              }}
            >
              <Popup maxWidth={300} minWidth={250}>
                <div style={{ padding: '8px' }}
                    onMouseEnter={handlePopupMouseEnter}
                    onMouseLeave={() => handlePopupMouseLeave(report.id)}>
                  <b style={{ fontSize: '16px' }}>{report.name}</b>
                  <br />
                  <span style={{ fontSize: '14px', color: '#666' }}>
                    Category: {report.category}
                  </span>
                  <br />
                  <span style={{ fontSize: '14px', color: '#666' }}>
                    Severity: {report.severityLevel}
                  </span>
                  <br />
                  
<<<<<<< HEAD
                  <ReportMedia
                    report={report}
                    currentImageIndex={currentIndex}
                    onPrev={(e) => prevImage(report.id, report.images.length, e)}
                    onNext={(e) => nextImage(report.id, report.images.length, e)}
                  />
=======
                  {/* Media Display */}
                  {hasMedia && (
                    <div style={{ marginTop: '10px', marginBottom: '10px' }}>
                      {hasGif ? (
                        <div style={{ position: 'relative' }}>
                          {report.images.filter(img => isVideo(img)).map((gif, idx) => (
                            <img
                              key={idx}
                              src={gif}
                              alt="Report media"
                              style={{
                                width: '100%',
                                maxHeight: '200px',
                                objectFit: 'cover',
                                borderRadius: '8px'
                              }}
                            />
                          ))[0]}
                        </div>
                      ) : (
                        <div style={{ position: 'relative' }}>
                          <img
                            src={report.images[currentIndex]}
                            alt={`Report image ${currentIndex + 1}`}
                            style={{
                              width: '100%',
                              maxHeight: '200px',
                              objectFit: 'cover',
                              borderRadius: '8px'
                            }}
                          />
                          
                          {report.images.length > 1 && (
                            <>
                              <button
                                onClick={(e) => prevImage(report.id, report.images.length, e)}
                                style={{
                                  position: 'absolute',
                                  left: '5px',
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  background: 'rgba(255, 255, 255, 0.8)',
                                  border: 'none',
                                  borderRadius: '50%',
                                  width: '32px',
                                  height: '32px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                }}
                              >
                                <ChevronLeft size={20} />
                              </button>
                              <button
                                onClick={(e) => nextImage(report.id, report.images.length, e)}
                                style={{
                                  position: 'absolute',
                                  right: '5px',
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  background: 'rgba(255, 255, 255, 0.8)',
                                  border: 'none',
                                  borderRadius: '50%',
                                  width: '32px',
                                  height: '32px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                }}
                              >
                                <ChevronRight size={20} />
                              </button>
                              
                              <div style={{
                                position: 'absolute',
                                bottom: '8px',
                                right: '8px',
                                background: 'rgba(0, 0, 0, 0.6)',
                                color: 'white',
                                padding: '4px 8px',
                                borderRadius: '12px',
                                fontSize: '12px'
                              }}>
                                {currentIndex + 1} / {report.images.length}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}
>>>>>>> 145167a2bb027cf60865b28b74f48b41ba3d135c
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '8px' }}>
                    <ThumbsUp size={16} /> {report.upvotes}
                  </div>
                </div>
              </Popup>
            </Marker>
<<<<<<< HEAD
            )
          })}
        </MarkerClusterGroup>
      )}
=======
          );
        })}
      </MarkerClusterGroup>
>>>>>>> 145167a2bb027cf60865b28b74f48b41ba3d135c
    </MapContainer>
  );
};

export default MapView;
