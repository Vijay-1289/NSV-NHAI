import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { LocateFixed, MapPin, Route } from 'lucide-react';

interface RoutePlannerProps {
  onSetStart: (coords: [number, number]) => void;
  onSetEnd: (coords: [number, number]) => void;
  onPlanRoutes: () => void;
  fastestRouteInfo?: string;
  alternativeRoutesInfo?: string[];
}

const RoutePlanner: React.FC<RoutePlannerProps> = ({
  onSetStart,
  onSetEnd,
  onPlanRoutes,
  fastestRouteInfo,
  alternativeRoutesInfo
}) => {
  const [destination, setDestination] = useState('');
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDetectLocation = () => {
    setLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          onSetStart([pos.coords.latitude, pos.coords.longitude]);
          setLocating(false);
        },
        () => setLocating(false)
      );
    } else {
      setLocating(false);
      alert('Geolocation is not supported by your browser.');
    }
  };

  const handleDestinationInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDestination(e.target.value);
    setError(null);
  };

  const handleSetDestination = () => {
    setError(null);
    if (!destination.trim()) {
      setError('Please enter a destination.');
      return;
    }
    if (window.google && window.google.maps) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: destination }, (results, status) => {
        if (status === 'OK' && results && results.length > 0) {
          const loc = results[0].geometry.location;
          onSetEnd([loc.lat(), loc.lng()]);
        } else {
          setError('Location not found. Please enter a valid city or address.');
        }
      });
    } else {
      setError('Google Maps API not loaded.');
    }
  };

  return (
    <div className="bg-slate-800/70 p-4 rounded-lg shadow-lg w-full max-w-xs space-y-4">
      <div className="flex items-center gap-2 text-white text-lg font-semibold mb-2">
        <Route className="w-5 h-5 text-blue-400" />
        Route Planner
      </div>
      <Button onClick={handleDetectLocation} disabled={locating} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
        <LocateFixed className="w-4 h-4 mr-2" />
        {locating ? 'Detecting...' : 'Use My Location'}
      </Button>
      <div>
        <label className="block text-slate-300 text-sm mb-1">Destination</label>
        <div className="flex gap-2">
          <Input
            placeholder="Enter city or address"
            value={destination}
            onChange={handleDestinationInput}
            className="flex-1 bg-slate-700 border-slate-600 text-white"
          />
          <Button onClick={handleSetDestination} className="bg-blue-500 hover:bg-blue-600 text-white px-3">
            <MapPin className="w-4 h-4" />
          </Button>
        </div>
        {error && <div className="text-red-400 text-xs mt-1">{error}</div>}
      </div>
      <Button onClick={onPlanRoutes} className="w-full bg-green-600 hover:bg-green-700 text-white">
        Show Routes
      </Button>
      {fastestRouteInfo && (
        <div className="mt-4 p-3 bg-green-100/10 border-l-4 border-green-400 text-green-200 rounded">
          <div className="font-semibold">Fastest Route</div>
          <div className="text-xs">{fastestRouteInfo}</div>
        </div>
      )}
      {alternativeRoutesInfo && alternativeRoutesInfo.length > 0 && (
        <div className="mt-2">
          <div className="font-semibold text-slate-200 mb-1">Other Routes</div>
          <ul className="text-xs text-slate-300 space-y-1">
            {alternativeRoutesInfo.map((info, idx) => (
              <li key={idx} className="bg-slate-700/50 rounded px-2 py-1">{info}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RoutePlanner;
 