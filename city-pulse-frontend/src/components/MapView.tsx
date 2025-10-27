import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
} from "react-leaflet";
import { ThumbsUp, ChevronLeft, ChevronRight } from 'lucide-react';
import "./MapView.css";
import type { LatLngExpression } from "leaflet";
import type { Report } from "../types/report";
import { useRef, useState } from "react";

interface MapViewProps {
  reports: Report[];
  onReportClick: (report: Report) => void;
}

const MapView = ({ reports, onReportClick }: MapViewProps) => {
  const position: LatLngExpression =
    reports.length > 0
      ? [reports[0].location.lat, reports[0].location.lng]
      : [46.77, 23.62];

  const markerRefs = useRef<any>({});
  const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: number]: number }>({});

  const isVideo = (filename: string) => {
    return filename.toLowerCase().endsWith('.gif') ||
           filename.toLowerCase().endsWith('.mp4') ||
           filename.toLowerCase().endsWith('.webm');
  };

  const nextImage = (reportId: number, totalImages: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => ({
      ...prev,
      [reportId]: ((prev[reportId] || 0) + 1) % totalImages
    }));
  };

  const prevImage = (reportId: number, totalImages: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => ({
      ...prev,
      [reportId]: ((prev[reportId] || 0) - 1 + totalImages) % totalImages
    }));
  };

  return (
    <MapContainer center={position} zoom={13} id="map" zoomControl={false}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="OpenStreetMap contributors"
      />

      <ZoomControl position="topright" />

      {reports.map((report) => {
        const hasMedia = report.images && report.images.length > 0;
        const currentIndex = currentImageIndex[report.id] || 0;
        const hasGif = hasMedia && report.images.some(img => isVideo(img));

        return (
        <Marker
          key={report.id}
          position={[report.location.lat, report.location.lng]}
          ref={(ref) => void (markerRefs.current[report.id] = ref)}
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
          <Popup maxWidth={300} minWidth={250}>
              <div style={{ padding: '8px' }}>
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
                
                {/* Media Display */}
                {hasMedia && (
                  <div style={{ marginTop: '10px', marginBottom: '10px' }}>
                    {hasGif ? (
                      // Show only GIF/video if present
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
                      // Show image carousel if no GIF
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
                            
                            {/* Image counter */}
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
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '8px' }}>
                  <ThumbsUp size={16} /> {report.upvotes}
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default MapView;
