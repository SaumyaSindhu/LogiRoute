import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import { useState } from "react";
import "leaflet/dist/leaflet.css";

const DEPOT = { id: "depot", lat: 28.7158, lng: 77.1091 }; // Depot

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  function handleMapClick(coord) {
    const newStop = {
      id: `stop-${Date.now()}`,
      lat: coord[0],
      lng: coord[1],
    };
    setStops([...stops, newStop]);
  }

  async function handleOptimize() {
    if (stops.length < 1) {
      setError("Add at least 1 delivery stop before optimizing.");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        "http://localhost:3000/api/routes/optimize",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ depot: DEPOT, stops }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Optimization failed");
      }

      console.log("Optimized result:", data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div style={{ position: "relative", height: "100vh", width: "100%" }}>
      <button
        onClick={handleOptimize}
        disabled={isLoading}
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          zIndex: 1000,
          padding: "10px 16px",
        }}
      >
        {isLoading ? "Optimizing..." : "Optimize Route"}
      </button>

      {error && (
        <div
          style={{
            position: "absolute",
            top: 50,
            right: 10,
            zIndex: 1000,
            color: "red",
          }}
        >
          {error}
        </div>
      )}

      <MapContainer
        center={[DEPOT.lat, DEPOT.lng]}
        zoom={14}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={[DEPOT.lat, DEPOT.lng]}>
          <Popup>Depot</Popup>
        </Marker>

        {stops.map((stop) => (
          <Marker key={stop.id} position={[stop.lat, stop.lng]}>
            <Popup>{stop.id}</Popup>
          </Marker>
        ))}

        <ClickHandler onMapClick={handleMapClick} />
      </MapContainer>
    </div>
  );
}
