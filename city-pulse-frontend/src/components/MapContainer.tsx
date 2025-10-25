import "./MapContainer.css";
import MapView from "./MapView";
const MapContainer = () => {
  return (
    <div className="map-container">
      <div className="map-placeholder">
        {/* <h3>Interactive Map</h3>
        <p>Map integration to be implemented here</p> */}
        <MapView />
      </div>
    </div>
  );
};

export default MapContainer;
