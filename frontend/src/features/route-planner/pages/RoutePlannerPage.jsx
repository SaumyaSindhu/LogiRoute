import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import { useState } from "react";
import "leaflet/dist/leaflet.css";

const DEPOT = [28.7158, 77.1091]; // Depot coordinate from earlier phases

function ClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null; // this component renders nothing visible — it only listens for events
}
export default function RoutePlannerPage() {
    const [stops, setStops] = useState([]);

    function handleMapClick(coord) {
        setStops([...stops, coord]);
    }
  return (
    <MapContainer
      center={DEPOT}
      zoom={14}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={DEPOT}>
        <Popup>Depot</Popup>
      </Marker>

      {stops.map((stop, index) => (
        <Marker key={index} position={stop}>
            <Popup>Stop {index + 1}</Popup>
        </Marker>
      ))}

      <ClickHandler onMapClick={handleMapClick} />
    </MapContainer>
  );
}
