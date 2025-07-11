import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents, GeoJSON, Popup, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import WeatherOverlay from "./WeatherOverlay";
import TrafficOverlay from "./TrafficOverlay";
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { getSnappedRoadRoute } from '@/services/roadService';
import { getStreetViewImageUrl } from '@/services/streetViewService';
import { getPavementConditionFromBackend } from '@/services/pavementService';
import { HighwayService } from '@/services/highwayService';
import { UserRole } from '@/integrations/supabase/types';

// Fix Leaflet's default icon path so markers show up
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Remove highways GeoJSON fetch and state
// Remove Bhuvan API fetch logic
// Only keep logic for displaying Google Maps JS API routes and overlays

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

interface MapViewProps {
  filters: {
    dateRange: string;
    distressLevel: string;
    location: string;
  };
  start: [number, number] | null;
  end: [number, number] | null;
  route: [number, number][];
  setStart: (coords: [number, number] | null) => void;
  setEnd: (coords: [number, number] | null) => void;
  setRoute: (route: [number, number][]) => void;
  allRoutes?: any[];
  userRole: UserRole;
  onPinPlacement?: (location: [number, number], severity: string) => void;
  onIssueSelect?: (issue: any) => void;
}

const GOOGLE_API_KEY = 'AIzaSyA8lpEzD_QSfrtefxiVETxsTv7lnbFeWqY';

const MapView: React.FC<MapViewProps> = (props) => {
  const [pavementResults, setPavementResults] = useState<any[]>([]);
  const [highwayIssues, setHighwayIssues] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);

  // Load highway issues on component mount
  useEffect(() => {
    loadHighwayIssues();
  }, []);

  // Subscribe to real-time updates
  useEffect(() => {
    const subscription = HighwayService.subscribeToIssues((payload) => {
      console.log('Real-time update:', payload);
      loadHighwayIssues(); // Reload issues when there's an update
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadHighwayIssues = async () => {
    try {
      const issues = await HighwayService.getHighwayIssues();
      setHighwayIssues(issues);
    } catch (error) {
      console.error('Failed to load highway issues:', error);
    }
  };

  // Fetch and analyze route when route changes
  useEffect(() => {
    async function fetchAndAnalyzeRoute() {
      if (!props.start || !props.end) return;
      const path = `${props.start[0]},${props.start[1]}|${props.end[0]},${props.end[1]}`;
      try {
        // 1. Get snapped route
        const snapped = await getSnappedRoadRoute(path, GOOGLE_API_KEY);
        if (!snapped.snappedPoints) return;
        // 2. Get Street View images for each snapped point
        const imageUrls = snapped.snappedPoints.map(pt =>
          getStreetViewImageUrl(pt.location.latitude, pt.location.longitude, GOOGLE_API_KEY)
        );
        // 3. Download images as blobs
        const imageBlobs = await Promise.all(
          imageUrls.map(url => fetch(url).then(res => res.blob()))
        );
        // 4. Send images to backend for pavement condition
        const result = await getPavementConditionFromBackend(imageBlobs);
        setPavementResults(result.results || []);
      } catch (err) {
        setPavementResults([]);
      }
    }
    fetchAndAnalyzeRoute();
  }, [props.start, props.end]);

  // Map click handler with role-based functionality
  function LocationSelector() {
    useMapEvents({
      click(e) {
        const clickedLocation: [number, number] = [e.latlng.lat, e.latlng.lng];
        
        if (props.userRole === 'inspector') {
          // For inspectors, clicking places a pin
          setSelectedLocation(clickedLocation);
          if (props.onPinPlacement) {
            props.onPinPlacement(clickedLocation, 'medium'); // Default severity
          }
        } else if (props.userRole === 'user') {
          // For users, clicking sets start/end points
          if (!props.start) props.setStart(clickedLocation);
          else if (!props.end) props.setEnd(clickedLocation);
          else {
            props.setStart(clickedLocation);
            props.setEnd(null);
            props.setRoute([]);
          }
        }
        // Engineers can view but not place pins
      }
    });
    return null;
  }

  const getIssueColor = (severity: string) => {
    switch (severity) {
      case 'low': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'high': return '#f97316';
      case 'critical': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getIssueIcon = (status: string) => {
    switch (status) {
      case 'resolved': return '✅';
      case 'inspected': return '🔧';
      default: return '⚠️';
    }
  };

  return (
    <MapContainer center={[22.9734, 78.6569]} zoom={5} style={{ height: "80vh", width: "100%" }}>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Start/End markers */}
      {props.start && <Marker position={props.start}><Popup>Start Point</Popup></Marker>}
      {props.end && <Marker position={props.end}><Popup>End Point</Popup></Marker>}
      
      {/* Selected location for inspector pin placement */}
      {selectedLocation && props.userRole === 'inspector' && (
        <CircleMarker
          center={selectedLocation}
          radius={15}
          pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.7, weight: 3 }}
        >
          <Popup>
            <div>
              <strong>Pin Location</strong><br />
              <p>Click "Place Pin" to confirm this location</p>
            </div>
          </Popup>
        </CircleMarker>
      )}
      
      {/* Draw all Google routes if available */}
      {props.allRoutes && props.allRoutes.length > 0 && props.allRoutes.map((r, idx) => (
        <Polyline
          key={idx}
          positions={r.overview_path.map((latLng: any) => [latLng.lat(), latLng.lng()])}
          pathOptions={{ color: idx === 0 ? '#22c55e' : '#3b82f6', weight: idx === 0 ? 6 : 4, opacity: idx === 0 ? 0.9 : 0.5 }}
        />
      ))}
      
      {/* Highway Issues Markers */}
      {highwayIssues.map((issue) => (
        <CircleMarker
          key={issue.id}
          center={[issue.location[0], issue.location[1]]}
          radius={12}
          pathOptions={{ 
            color: getIssueColor(issue.severity), 
            fillColor: getIssueColor(issue.severity), 
            fillOpacity: 0.8,
            weight: 2
          }}
          eventHandlers={{
            click: () => {
              if (props.onIssueSelect) {
                props.onIssueSelect(issue);
              }
            }
          }}
        >
          <Popup>
            <div className="min-w-[200px]">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{getIssueIcon(issue.status)}</span>
                <strong>Issue #{issue.id.slice(0, 8)}</strong>
              </div>
              <p className="text-sm mb-2"><strong>Description:</strong> {issue.description}</p>
              <p className="text-sm mb-2"><strong>Severity:</strong> 
                <span style={{ color: getIssueColor(issue.severity) }}> {issue.severity.toUpperCase()}</span>
              </p>
              <p className="text-sm mb-2"><strong>Status:</strong> {issue.status}</p>
              <p className="text-xs text-gray-500">
                {new Date(issue.created_at).toLocaleDateString()}
              </p>
              {issue.image_url && (
                <img 
                  src={issue.image_url} 
                  alt="Issue" 
                  className="w-full h-20 object-cover rounded mt-2"
                />
              )}
            </div>
          </Popup>
        </CircleMarker>
      ))}
      
      {/* Pavement Condition Monitoring Markers */}
      {pavementResults.map((pc, idx) => (
        (pc.lat !== undefined && pc.lng !== undefined) && (
          <CircleMarker
            key={idx}
            center={[pc.lat, pc.lng]}
            radius={10}
            pathOptions={{ color: severityColor(pc.condition), fillColor: severityColor(pc.condition), fillOpacity: 0.7 }}
          >
            <Popup>
              <div>
                <strong>Severity:</strong> <span style={{ color: severityColor(pc.condition) }}>{pc.condition?.toUpperCase()}</span><br />
                <strong>IRI:</strong> {pc.iri}<br />
                <strong>Crack Index:</strong> {pc.crack_index}%<br />
                <strong>Rutting:</strong> {pc.rutting} mm
              </div>
            </Popup>
          </CircleMarker>
        )
      ))}
      
      {/* Weather Overlay */}
      <WeatherOverlay center={[22.9734, 78.6569]} radius={100} gridSpacing={50} />
      
      {/* Traffic Overlay (only if route exists) */}
      {props.route.length > 1 && <TrafficOverlay route={props.route} />}
      
      <LocationSelector />
    </MapContainer>
  );
};

export default MapView;
