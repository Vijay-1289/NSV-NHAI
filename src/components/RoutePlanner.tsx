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
  };

  const handleSetDestination = () => {
    // For now, just mock: use a fixed lat/lng for demo
    // In a real app, use geocoding API to convert address to lat/lng
    if (destination.toLowerCase().includes('delhi')) {
      onSetEnd([28.6139, 77.2090]);
    } else if (destination.toLowerCase().includes('mumbai')) {
      onSetEnd([19.0760, 72.8777]);
    } else if (destination.toLowerCase().includes('chennai')) {
      onSetEnd([13.0827, 80.2707]);
    } else if (destination.toLowerCase().includes('kolkata')) {
      onSetEnd([22.5726, 88.3639]);
    } else {
      alert('Please enter a known city (Delhi, Mumbai, Chennai, Kolkata) for demo.');
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
            placeholder="Enter city (e.g. Delhi)"
            value={destination}
            onChange={handleDestinationInput}
            className="flex-1 bg-slate-700 border-slate-600 text-white"
          />
          <Button onClick={handleSetDestination} className="bg-blue-500 hover:bg-blue-600 text-white px-3">
            <MapPin className="w-4 h-4" />
          </Button>
        </div>
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
 