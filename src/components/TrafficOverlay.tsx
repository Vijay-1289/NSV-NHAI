import React, { useEffect, useState } from 'react';
import { Polyline, CircleMarker, Popup } from 'react-leaflet';
import { TrafficService, TrafficSegment } from '../services/trafficService';

interface TrafficOverlayProps {
  route: [number, number][];
}

const TrafficOverlay: React.FC<TrafficOverlayProps> = ({ route }) => {
  const [trafficSegments, setTrafficSegments] = useState<TrafficSegment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!route || route.length < 2) {
      setTrafficSegments([]);
      return;
    }
    setLoading(true);
    setError(null);
    TrafficService.getTrafficAlongRoute(route)
      .then(setTrafficSegments)
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to fetch traffic data'))
      .finally(() => setLoading(false));
  }, [route]);

  if (!route || route.length < 2) return null;

  return (
    <>
      {trafficSegments.map((segment, idx) => (
        <React.Fragment key={idx}>
          <Polyline
            positions={[segment.start, segment.end]}
            pathOptions={{
              color: TrafficService.getTrafficColor(segment.traffic_data.congestion_level),
              weight: 6,
              opacity: 0.7
            }}
          />
          <CircleMarker
            center={[(segment.start[0] + segment.end[0]) / 2, (segment.start[1] + segment.end[1]) / 2]}
            radius={8}
            pathOptions={{
              color: TrafficService.getTrafficColor(segment.traffic_data.congestion_level),
              fillColor: TrafficService.getTrafficColor(segment.traffic_data.congestion_level),
              fillOpacity: 0.7,
              weight: 2
            }}
          >
            <Popup>
              <div className="traffic-popup">
                <div className="font-semibold text-sm mb-1">Traffic Info</div>
                <div className="text-xs">
                  <div><span className="font-medium">Congestion:</span> {segment.traffic_data.congestion_level.toUpperCase()}</div>
                  <div><span className="font-medium">Speed:</span> {segment.traffic_data.speed.toFixed(1)} km/h</div>
                  <div><span className="font-medium">Volume:</span> {segment.traffic_data.volume} veh/hr</div>
                  <div><span className="font-medium">Delay:</span> {segment.traffic_data.delay.toFixed(1)} min</div>
                  <div><span className="font-medium">Road Type:</span> {segment.traffic_data.road_type}</div>
                  <div><span className="font-medium">Severity:</span> <span className={`px-2 py-1 rounded text-xs ${
                    TrafficService.getTrafficSeverity(segment.traffic_data.congestion_level) === 'critical' ? 'bg-red-100 text-red-800' :
                    TrafficService.getTrafficSeverity(segment.traffic_data.congestion_level) === 'high' ? 'bg-orange-100 text-orange-800' :
                    TrafficService.getTrafficSeverity(segment.traffic_data.congestion_level) === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {TrafficService.getTrafficSeverity(segment.traffic_data.congestion_level).toUpperCase()}
                  </span></div>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        </React.Fragment>
      ))}
    </>
  );
};

export default TrafficOverlay; 