import React, { useState, useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Zap, AlertTriangle, RefreshCw } from 'lucide-react';

interface Segment {
  id: string;
  lat: number;
  lng: number;
  iri: number;
  crackIndex: number;
  rutting: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
}

interface MapViewProps {
  selectedSegment: Segment | null;
  onSegmentSelect: (segment: Segment) => void;
  filters: any;
}

export const MapView: React.FC<MapViewProps> = ({ selectedSegment, onSegmentSelect, filters }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [highways, setHighways] = useState<any[]>([]);
  const [startPoint, setStartPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [endPoint, setEndPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [routePolyline, setRoutePolyline] = useState<any>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [highwaysGeoJson, setHighwaysGeoJson] = useState<any>(null);
  const [highwaysLoading, setHighwaysLoading] = useState(true);
  const [highwaysError, setHighwaysError] = useState<string | null>(null);

  // Google Maps API Key
  const GOOGLE_MAPS_API_KEY = 'AIzaSyDUFIDF3WwnG96bDA_uLESoF-f9mu3hw6E';
  const GEMINI_API_KEY = 'AIzaSyCtrET1QS7KMbatA3PkOdoMrPqBtCgNu9g';

  // Placeholder for fetching all highways and routing
  const handleMapClick = (e: any) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    if (!startPoint) {
      setStartPoint({ lat, lng });
    } else if (!endPoint) {
      setEndPoint({ lat, lng });
      // After both points are set, call Bhuvan routing API (to be implemented)
    } else {
      setStartPoint({ lat, lng });
      setEndPoint(null);
    }
  };

  // Initialize Google Maps
  const initializeMap = async () => {
    if (!mapRef.current) return;

    const loader = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: 'weekly',
    });

    try {
      await loader.load();
      
      const map = new (window as any).google.maps.Map(mapRef.current, {
        center: { lat: 20.5937, lng: 78.9629 }, // India center
        zoom: 5,
        mapTypeId: (window as any).google.maps.MapTypeId.SATELLITE,
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: (window as any).google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
          position: (window as any).google.maps.ControlPosition.TOP_CENTER,
        },
        zoomControl: true,
        streetViewControl: false,
        fullscreenControl: true,
      });

      mapInstanceRef.current = map;
      map.addListener('click', handleMapClick);
      updateMapMarkers();
    } catch (error) {
      console.error('Error loading Google Maps:', error);
    }
  };

  // Update map markers
  const updateMapMarkers = () => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add new markers
    segments.forEach(segment => {
      const marker = new (window as any).google.maps.Marker({
        position: { lat: segment.lat, lng: segment.lng },
        map: mapInstanceRef.current!,
        title: `${segment.id} - IRI: ${segment.iri.toFixed(1)}`,
        icon: {
          path: (window as any).google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: getSeverityHexColor(segment.severity),
          fillOpacity: 0.8,
          strokeWeight: 2,
          strokeColor: '#ffffff',
        },
      });

      // Add click listener
      marker.addListener('click', () => {
        onSegmentSelect(segment);
      });

      // Add info window
      const infoWindow = new (window as any).google.maps.InfoWindow({
        content: `
          <div style="color: #1f2937; font-family: system-ui; min-width: 180px;">
            <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">${segment.id}</h3>
            <div style="font-size: 12px; line-height: 1.4;">
              <div><strong>IRI:</strong> ${segment.iri.toFixed(1)}</div>
              <div><strong>Crack Index:</strong> ${segment.crackIndex.toFixed(1)}%</div>
              <div><strong>Rutting:</strong> ${segment.rutting.toFixed(1)}mm</div>
              <div><strong>Severity:</strong> <span style="color: ${getSeverityHexColor(segment.severity)}; font-weight: 600; text-transform: uppercase;">${segment.severity}</span></div>
              <div style="margin-top: 4px; color: #6b7280;"><strong>Updated:</strong> ${new Date(segment.timestamp).toLocaleTimeString()}</div>
            </div>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(mapInstanceRef.current!, marker);
      });

      markersRef.current.push(marker);
    });
  };

  const getSeverityHexColor = (severity: string) => {
    switch (severity) {
      case 'low': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'high': return '#f97316';
      case 'critical': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      case 'high': return <Zap className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // Placeholder for fetching all highways and routing
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Initial data fetch and map initialization
  useEffect(() => {
    initializeMap();
  }, []);

  // Update markers when segments change
  useEffect(() => {
    if (mapInstanceRef.current) {
      updateMapMarkers();
    }
  }, [segments]);

  // Fetch National Highways GeoJSON from a public URL
  useEffect(() => {
    setHighwaysLoading(true);
    setHighwaysError(null);
    fetch('https://raw.githubusercontent.com/datameet/road-network/master/data/india_national_highways.geojson')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch highways data');
        return res.json();
      })
      .then(data => {
        setHighwaysGeoJson(data);
        setHighwaysLoading(false);
      })
      .catch(err => {
        setHighwaysError(err.message || 'Error loading highways data');
        setHighwaysLoading(false);
      });
  }, []);

  // Fetch and display all National Highways as polylines
  useEffect(() => {
    if (!mapInstanceRef.current || !highwaysGeoJson) return;
    // Remove existing highway polylines
    if (mapInstanceRef.current.highwayPolylines) {
      mapInstanceRef.current.highwayPolylines.forEach((poly: any) => poly.setMap(null));
    }
    // Draw new polylines from GeoJSON
    const polylines: any[] = [];
    highwaysGeoJson.features.forEach((feature: any) => {
      if (feature.geometry.type === 'LineString') {
        const path = feature.geometry.coordinates.map(([lng, lat]: [number, number]) => ({ lat, lng }));
        const polyline = new (window as any).google.maps.Polyline({
          path,
          geodesic: true,
          strokeColor: '#1976d2',
          strokeOpacity: 0.7,
          strokeWeight: 4,
          map: mapInstanceRef.current,
        });
        polylines.push(polyline);
      }
    });
    mapInstanceRef.current.highwayPolylines = polylines;
  }, [highwaysGeoJson, mapInstanceRef.current]);

  // Fetch and display route when two points are selected
  useEffect(() => {
    if (!startPoint || !endPoint || !mapInstanceRef.current) return;
    setRouteLoading(true);
    setRouteError(null);
    const fetchRoute = async () => {
      try {
        const url = `https://bhuvan-app1.nrsc.gov.in/api/routing/curl_routing_state.php?lat1=${startPoint.lat}&lon1=${startPoint.lng}&lat2=${endPoint.lat}&lon2=${endPoint.lng}&token=3265a114cf7f9f05fd03035b51dcda177e22e663`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch route');
        const data = await res.json();
        // Assume data.route is an array of [lat, lng] pairs
        if (routePolyline) routePolyline.setMap(null);
        const path = data.route.map(([lat, lng]: [number, number]) => ({ lat, lng }));
        const polyline = new (window as any).google.maps.Polyline({
          path,
          geodesic: true,
          strokeColor: '#ff5722',
          strokeOpacity: 0.9,
          strokeWeight: 5,
          map: mapInstanceRef.current,
        });
        setRoutePolyline(polyline);
      } catch (err: any) {
        setRouteError(err.message || 'Error fetching route');
      } finally {
        setRouteLoading(false);
      }
    };
    fetchRoute();
    // Cleanup on unmount or new route
    return () => {
      if (routePolyline) routePolyline.setMap(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startPoint, endPoint]);

  return (
    <Card className="h-full bg-slate-800/50 backdrop-blur-sm border-slate-700/50 overflow-hidden">
      <div className="h-full relative">
        {/* Google Maps Container */}
        <div ref={mapRef} className="h-full w-full" />

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="bg-slate-800/90 rounded-lg p-4 flex items-center space-x-3">
              <RefreshCw className="w-5 h-5 animate-spin text-blue-400" />
              <span className="text-white">Fetching real-time data...</span>
            </div>
          </div>
        )}

        {/* Real-time Status */}
        <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-sm rounded-lg p-3 z-20">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-white font-medium">LIVE DATA</span>
          </div>
          <div className="text-xs text-slate-300">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {segments.length} segments monitored
          </div>
        </div>

        {/* Manual Refresh Button */}
        <div className="absolute bottom-4 right-4 space-y-2 z-20">
          <Button
            size="sm"
            variant="secondary"
            className="bg-slate-700/80 hover:bg-slate-600/80 text-white"
            onClick={initializeMap}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button size="sm" variant="secondary" className="bg-slate-700/80 hover:bg-slate-600/80 text-white">
            <Navigation className="w-4 h-4" />
          </Button>
        </div>

        {/* Legend */}
        <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-sm rounded-lg p-3 space-y-2 z-20">
          <h3 className="text-sm font-medium text-white mb-2">Highway Condition</h3>
          {[
            { level: 'Low Risk', color: 'bg-green-500' },
            { level: 'Medium Risk', color: 'bg-yellow-500' },
            { level: 'High Risk', color: 'bg-orange-500' },
            { level: 'Critical', color: 'bg-red-500' },
          ].map(({ level, color }) => (
            <div key={level} className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${color}`}></div>
              <span className="text-xs text-slate-300">{level}</span>
            </div>
          ))}
          <div className="pt-2 border-t border-slate-600">
            <div className="text-xs text-slate-400">Real-time NSV data</div>
          </div>
        </div>

        {routeLoading && <div>Loading route...</div>}
        {routeError && <div style={{ color: 'red' }}>{routeError}</div>}

        {highwaysLoading && <div>Loading highways...</div>}
        {highwaysError && <div style={{ color: 'red' }}>{highwaysError}</div>}
      </div>
    </Card>
  );
};
