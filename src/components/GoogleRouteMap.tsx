import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, DirectionsService, DirectionsRenderer, Marker } from '@react-google-maps/api';
import type { Libraries } from '@react-google-maps/api';

interface GoogleRouteMapProps {
  start: [number, number] | null;
  end: [number, number] | null;
  setRouteAnalysis: (info: { fastest: string; alternatives: string[] }) => void;
}

const containerStyle = {
  width: '100%',
  height: '80vh',
};

const center = { lat: 22.9734, lng: 78.6569 };

const GOOGLE_MAP_LIBRARIES: Libraries = ['places'];

const GoogleRouteMap: React.FC<GoogleRouteMapProps> = ({ start, end, setRouteAnalysis }) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: 'AIzaSyAaQhDfUQKG-VbbCDD0hanBSm4q2S0a6SE',
    libraries: GOOGLE_MAP_LIBRARIES,
  });

  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [request, setRequest] = useState<google.maps.DirectionsRequest | null>(null);
  const [markerBouncing, setMarkerBouncing] = useState(false);

  React.useEffect(() => {
    if (start) {
      setMarkerBouncing(true);
      const timer = setTimeout(() => setMarkerBouncing(false), 1500);
      return () => clearTimeout(timer);
    } else {
      setMarkerBouncing(false);
    }
  }, [start]);

  React.useEffect(() => {
    if (start && end) {
      setRequest({
        origin: { lat: start[0], lng: start[1] },
        destination: { lat: end[0], lng: end[1] },
        travelMode: google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: true,
      });
    } else {
      setRequest(null);
      setDirections(null);
    }
  }, [start, end]);

  const directionsCallback = useCallback((result: google.maps.DirectionsResult | null, status: google.maps.DirectionsStatus) => {
    if (status === 'OK' && result) {
      setDirections(result);
      // Route analysis for sidebar
      const fastest = result.routes[0];
      const fastestSummary = `Fastest: ${fastest.summary} (${fastest.legs[0].distance.text}, ${fastest.legs[0].duration.text})`;
      const alternatives = result.routes.slice(1).map((r, i) => {
        let reason = '';
        if (r.legs[0].duration.value > fastest.legs[0].duration.value) reason += 'Slower';
        if (r.legs[0].distance.value > fastest.legs[0].distance.value) reason += (reason ? ', ' : '') + 'Longer';
        return `Alt ${i+1}: ${r.summary} (${r.legs[0].distance.text}, ${r.legs[0].duration.text})${reason ? ' - ' + reason : ''}`;
      });
      setRouteAnalysis({ fastest: fastestSummary, alternatives });
    }
  }, [setRouteAnalysis]);

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={start ? { lat: start[0], lng: start[1] } : center}
      zoom={start ? 7 : 5}
    >
      {/* Animated marker for user's location */}
      {start && (
        <Marker
          position={{ lat: start[0], lng: start[1] }}
          animation={markerBouncing && window.google && window.google.maps ? window.google.maps.Animation.BOUNCE : undefined}
        />
      )}
      {request && (
        <DirectionsService
          options={request}
          callback={directionsCallback}
        />
      )}
      {directions && directions.routes.map((route, idx) => (
        <DirectionsRenderer
          key={idx}
          directions={{ ...directions, routes: [route] }}
          options={{
            polylineOptions: {
              strokeColor: idx === 0 ? '#22c55e' : '#3b82f6',
              strokeWeight: idx === 0 ? 6 : 4,
              strokeOpacity: idx === 0 ? 0.9 : 0.5,
            },
            suppressMarkers: false,
          }}
        />
      ))}
    </GoogleMap>
  ) : (
    <div className="flex items-center justify-center h-full text-white">Loading Google Map...</div>
  );
};

export default GoogleRouteMap; 