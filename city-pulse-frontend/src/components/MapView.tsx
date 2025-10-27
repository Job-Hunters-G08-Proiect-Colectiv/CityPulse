import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import { ThumbsUp } from 'lucide-react';
import "./MapView.css";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";
import type { Report } from "../types/report";
import { useRef } from "react";

interface MapViewProps {
  reports: Report[];
  onReportClick: (report: Report) => void;
}

const MapView = ({ reports, onReportClick }: MapViewProps) => {
  const position: LatLngExpression =
    reports.length > 0
      ? [reports[0].location.lat, reports[0].location.lng]
      : [46.77, 23.62];
  const topLeftBound = L.latLng(46.876, 23.323);
  const bottomRightBound = L.latLng(46.688, 23.781);
  const maxBounds = L.latLngBounds(topLeftBound, bottomRightBound);
  const markerRefs = useRef<any>({});

  return (
    <MapContainer center={position} minZoom={12} zoom={13} id="map" zoomControl={false} maxBounds={maxBounds}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="OpenStreetMap contributors"
      />

      <ZoomControl position="topright" />

      <MarkerClusterGroup>
        {reports.map((report) => (
          <Marker
            key={report.id}
            position={[report.location.lat, report.location.lng]}
            ref={(ref) => (markerRefs.current[report.id] = ref)}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <ThumbsUp size={16} /> {report.upvotes}
              </div>
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
};

export default MapView;
