import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
} from "react-leaflet";
import { ThumbsUp, ChevronLeft, ChevronRight } from 'lucide-react';
import "./MapView.css";
import { type LatLngExpression } from "leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import L from "leaflet";
import type { Report } from "../types/report";
import { useEffect, useRef, useState } from "react";
import { getSeverityColor, getIconSize, getGlowRadius, getCategoryIcon } from "../utils/reportUtils";

interface MapViewProps {
  reports: Report[];
  onReportClick: (report: Report) => void;
}

// Create custom icon with glow effect
const createCustomIcon = (report: Report) => {
  const icon = getCategoryIcon(report.category);
  const color = getSeverityColor(report.severityLevel);
  const glowRadius = getGlowRadius(report.upvotes);
  const iconSize = getIconSize(report.upvotes);

  const glowStyle = glowRadius > 0
    ? `filter: drop-shadow(0 0 ${glowRadius}px ${color}) drop-shadow(0 0 ${glowRadius * 0.5}px ${color}) drop-shadow(0 0 ${glowRadius * 0.1}px ${color});`
    : '';

  const html = `
    <div style="
      font-size: ${iconSize}px;
      ${glowStyle}
      text-align: center;
      line-height: 1;
    ">
      ${icon}
    </div>
  `;

  return L.divIcon({
    html: html,
    className: 'custom-marker-icon',
    iconSize: [iconSize, iconSize],
    iconAnchor: [iconSize / 2, iconSize / 2],
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

  return (
    <MapContainer center={position} minZoom={12} zoom={13} id="map" zoomControl={false} maxBounds={maxBounds}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="OpenStreetMap contributors"
      />

      <ZoomControl position="topright" />

      <MarkerClusterGroup>
        {reports.map((report) => {
          const currentIndex = currentImageIndex[report.id] || 0; // Get current image index for this report

          return (
            <Marker
            key={report.id}
            position={[report.location.lat, report.location.lng]}
            icon={createCustomIcon(report)}
            ref={(ref) => void (markerRefs.current[report.id] = ref)}
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
                  
                  <ReportMedia
                    report={report}
                    currentImageIndex={currentIndex}
                    onPrev={(e) => prevImage(report.id, report.images.length, e)}
                    onNext={(e) => nextImage(report.id, report.images.length, e)}
                  />
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '8px' }}>
                    <ThumbsUp size={16} /> {report.upvotes}
                  </div>
                </div>
            </Popup>
          </Marker>
          )
        })}
      </MarkerClusterGroup>
    </MapContainer>
  );
};

export default MapView;
