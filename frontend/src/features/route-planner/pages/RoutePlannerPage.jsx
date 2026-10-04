import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMapEvents,
} from "react-leaflet";
import { useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import ControlPanel from "../components/ControlPanel";
import "./RoutePlannerPage.scss";

const DEPOT = { id: "depot", lat: 28.7158, lng: 77.1091 };

function createNumberedIcon(label) {
  return L.divIcon({
    html: `<div class="stop-number-marker">${label}</div>`,
    className: "",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

function getStopOrderNumber(id, optimizedRoute) {
  if (!optimizedRoute) return null;
  const index = optimizedRoute.route.indexOf(id);
  return index === -1 ? null : index;
}

function ClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

export default function RoutePlannerPage() {
  const [stops, setStops] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [optimizedRoute, setOptimizedRoute] = useState(null);

  function handleMapClick(coord) {
    const newStop = {
      id: `stop-${Date.now()}`,
      lat: coord[0],
      lng: coord[1],
    };
    setStops([...stops, newStop]);
  }

  function getPointById(id) {
    if (id === DEPOT.id) return DEPOT;
    return stops.find((s) => s.id === id);
  }

  async function handleOptimize() {
    if (stops.length < 1) {
      setError("Add at least 1 delivery stop before optimizing.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setOptimizedRoute(null);

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

      setOptimizedRoute(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  const routeCoordinates = optimizedRoute
    ? optimizedRoute.route
        .map((id) => getPointById(id))
        .filter(Boolean)
        .map((point) => [point.lat, point.lng])
    : [];

  return (
    <div className="route-planner">
      <div className="route-planner__map">
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

          {stops.map((stop) => {
            const orderNumber = getStopOrderNumber(stop.id, optimizedRoute);
            return (
              <Marker
                key={stop.id}
                position={[stop.lat, stop.lng]}
                icon={createNumberedIcon(
                  orderNumber !== null ? orderNumber : "•",
                )}
              >
                <Popup>{stop.id}</Popup>
              </Marker>
            );
          })}

          {routeCoordinates.length > 0 && (
            <Polyline positions={routeCoordinates} color="#2563eb" weight={4} />
          )}

          <ClickHandler onMapClick={handleMapClick} />
        </MapContainer>
      </div>

      <ControlPanel
        stopCount={stops.length}
        isLoading={isLoading}
        error={error}
        optimizedRoute={optimizedRoute}
        onOptimize={handleOptimize}
      />
    </div>
  );
}
