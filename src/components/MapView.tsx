import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents, GeoJSON, Popup, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import WeatherOverlay from "./WeatherOverlay";
import TrafficOverlay from "./TrafficOverlay";

const HIGHWAYS_GEOJSON_URL = "https://raw.githubusercontent.com/datameet/road-network/master/data/india_national_highways.geojson";

// Example pavement condition data (replace with real API if available)
const PAVEMENT_CONDITIONS = [
  { id: 1, lat: 28.7041, lng: 77.1025, severity: "low", iri: 2.5, crackIndex: 10, rutting: 5 },
  { id: 2, lat: 19.076, lng: 72.8777, severity: "high", iri: 7.2, crackIndex: 40, rutting: 25 },
  { id: 3, lat: 13.0827, lng: 80.2707, severity: "critical", iri: 9.1, crackIndex: 60, rutting: 40 },
  { id: 4, lat: 26.8467, lng: 80.9462, severity: "medium", iri: 4.8, crackIndex: 20, rutting: 10 },
];

const severityColor = (severity: string) => {
    switch (severity) {
    case "low": return "#10b981";
    case "medium": return "#f59e0b";
    case "high": return "#f97316";
    case "critical": return "#ef4444";
    default: return "#6b7280";
  }
};

const MapView: React.FC = () => {
  const [start, setStart] = useState<[number, number] | null>(null);
  const [end, setEnd] = useState<[number, number] | null>(null);
  const [route, setRoute] = useState<[number, number][]>([]);
  const [highways, setHighways] = useState<any>(null);

  // Fetch highways GeoJSON
  useEffect(() => {
    fetch(HIGHWAYS_GEOJSON_URL)
      .then(res => res.json())
      .then(setHighways);
  }, []);

  // Fetch route from Bhuvan when both points are set
  useEffect(() => {
    if (start && end) {
      fetch(
        `https://bhuvan-app1.nrsc.gov.in/api/routing/curl_routing_state.php?lat1=${start[0]}&lon1=${start[1]}&lat2=${end[0]}&lon2=${end[1]}&token=3265a114cf7f9f05fd03035b51dcda177e22e663`
      )
        .then(res => res.json())
        .then(data => {
          if (data.route) setRoute(data.route.map(([lat, lng]: [number, number]) => [lat, lng]));
        });
    }
  }, [start, end]);

  // Map click handler
  function LocationSelector() {
    useMapEvents({
      click(e) {
        if (!start) setStart([e.latlng.lat, e.latlng.lng]);
        else if (!end) setEnd([e.latlng.lat, e.latlng.lng]);
        else {
          setStart([e.latlng.lat, e.latlng.lng]);
          setEnd(null);
          setRoute([]);
        }
      }
    });
    return null;
  }

  return (
    <MapContainer center={[22.9734, 78.6569]} zoom={5} style={{ height: "80vh", width: "100%" }}>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {highways && <GeoJSON data={highways} style={{ color: "#1976d2", weight: 2 }} />}
      {start && <Marker position={start}><Popup>Start Point</Popup></Marker>}
      {end && <Marker position={end}><Popup>End Point</Popup></Marker>}
      {route.length > 0 && <Polyline positions={route} color="#ff5722" weight={4} />}
      {/* Pavement Condition Monitoring Markers */}
      {PAVEMENT_CONDITIONS.map(pc => (
        <CircleMarker
          key={pc.id}
          center={[pc.lat, pc.lng]}
          radius={10}
          pathOptions={{ color: severityColor(pc.severity), fillColor: severityColor(pc.severity), fillOpacity: 0.7 }}
        >
          <Popup>
            <div>
              <strong>Severity:</strong> <span style={{ color: severityColor(pc.severity) }}>{pc.severity.toUpperCase()}</span><br />
              <strong>IRI:</strong> {pc.iri}<br />
              <strong>Crack Index:</strong> {pc.crackIndex}%<br />
              <strong>Rutting:</strong> {pc.rutting} mm
            </div>
          </Popup>
        </CircleMarker>
      ))}
      {/* Weather Overlay */}
      <WeatherOverlay center={[22.9734, 78.6569]} radius={100} gridSpacing={50} />
      {/* Traffic Overlay (only if route exists) */}
      {route.length > 1 && <TrafficOverlay route={route} />}
      <LocationSelector />
    </MapContainer>
  );
};

export default MapView;
