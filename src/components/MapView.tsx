
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Zap, AlertTriangle } from 'lucide-react';

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
  // Mock data for demonstration
  const segments: Segment[] = [
    { id: '1', lat: 28.6139, lng: 77.2090, iri: 3.2, crackIndex: 15, rutting: 8, severity: 'medium', timestamp: '2024-01-15 14:30' },
    { id: '2', lat: 28.6169, lng: 77.2120, iri: 5.8, crackIndex: 35, rutting: 22, severity: 'high', timestamp: '2024-01-15 14:32' },
    { id: '3', lat: 28.6199, lng: 77.2150, iri: 7.2, crackIndex: 45, rutting: 35, severity: 'critical', timestamp: '2024-01-15 14:34' },
    { id: '4', lat: 28.6229, lng: 77.2180, iri: 2.1, crackIndex: 8, rutting: 4, severity: 'low', timestamp: '2024-01-15 14:36' },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      case 'high': return <Zap className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  return (
    <Card className="h-full bg-slate-800/50 backdrop-blur-sm border-slate-700/50 overflow-hidden">
      <div className="h-full relative">
        {/* Map Container - This would contain actual map integration */}
        <div className="h-full bg-gradient-to-br from-slate-800 to-slate-900 relative overflow-hidden">
          {/* Simulated Map Background */}
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full bg-gradient-to-br from-blue-900/30 to-cyan-900/30"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]"></div>
          </div>

          {/* Route Visualization */}
          <svg className="absolute inset-0 w-full h-full">
            <defs>
              <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8" />
              </linearGradient>
            </defs>
            <path
              d="M 100 200 Q 300 100 500 300 Q 700 400 900 200"
              stroke="url(#routeGradient)"
              strokeWidth="4"
              fill="none"
              strokeDasharray="10,5"
              className="animate-pulse"
            />
          </svg>

          {/* Segment Markers */}
          {segments.map((segment, index) => (
            <div
              key={segment.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 hover:scale-110 ${
                selectedSegment?.id === segment.id ? 'scale-125 z-20' : 'z-10'
              }`}
              style={{
                left: `${20 + index * 20}%`,
                top: `${30 + index * 15}%`,
              }}
              onClick={() => onSegmentSelect(segment)}
            >
              <div className={`w-6 h-6 rounded-full ${getSeverityColor(segment.severity)} flex items-center justify-center text-white shadow-lg`}>
                {getSeverityIcon(segment.severity)}
              </div>
              {selectedSegment?.id === segment.id && (
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-slate-900/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-white whitespace-nowrap border border-slate-600">
                  <div className="font-medium">Segment {segment.id}</div>
                  <div className="text-slate-300">IRI: {segment.iri}</div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900/90"></div>
                </div>
              )}
            </div>
          ))}

          {/* Live Vehicle Position */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
              <Navigation className="w-4 h-4 text-white" />
            </div>
            <div className="absolute inset-0 w-8 h-8 bg-blue-500/30 rounded-full animate-ping"></div>
          </div>

          {/* Map Controls */}
          <div className="absolute bottom-4 right-4 space-y-2">
            <Button size="sm" variant="secondary" className="bg-slate-700/80 hover:bg-slate-600/80 text-white">
              <MapPin className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="secondary" className="bg-slate-700/80 hover:bg-slate-600/80 text-white">
              <Navigation className="w-4 h-4" />
            </Button>
          </div>

          {/* Legend */}
          <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-sm rounded-lg p-3 space-y-2">
            <h3 className="text-sm font-medium text-white mb-2">Severity Levels</h3>
            {[
              { level: 'Low', color: 'bg-green-500' },
              { level: 'Medium', color: 'bg-yellow-500' },
              { level: 'High', color: 'bg-orange-500' },
              { level: 'Critical', color: 'bg-red-500' },
            ].map(({ level, color }) => (
              <div key={level} className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${color}`}></div>
                <span className="text-xs text-slate-300">{level}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};
