import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const ROHINI_CENTER = [28.7158, 77.1091]; // Depot coordinate from earlier phases

export default function RoutePlannerPage() {
  return (
    <MapContainer
      center={ROHINI_CENTER}
      zoom={14}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
    </MapContainer>
  );
}
