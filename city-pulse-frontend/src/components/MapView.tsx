import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
} from "react-leaflet";
import "./MapView.css";
import type { LatLngExpression } from "leaflet";

const MapView = () => {
  const position: LatLngExpression = [46.77, 23.62];

  return (
    <MapContainer center={position} zoom={13} id="map" zoomControl={false}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="OpenStreetMap contributors"
      />

      <ZoomControl position="topright" />

      <Marker position={position}>
        <Popup>
          <b>Broken streetlight</b>
          <br />
          Severity: High.
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default MapView;
