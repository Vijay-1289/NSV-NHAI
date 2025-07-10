import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { DashboardHeader } from '@/components/DashboardHeader';
import MapView from '@/components/MapView';
import { MetricsPanel } from '@/components/MetricsPanel';
import { FilterPanel } from '@/components/FilterPanel';
import { SegmentInspector } from '@/components/SegmentInspector';
import { NotificationPanel } from '@/components/NotificationPanel';
import RoutePlanner from '@/components/RoutePlanner';

const Index = () => {
  const navigate = useNavigate();
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [userRole, setUserRole] = useState<'inspector' | 'supervisor'>('inspector');
  const [filters, setFilters] = useState({
    dateRange: 'today',
    distressLevel: 'all',
    location: 'all'
  });
  const [loading, setLoading] = useState(true);
  const [start, setStart] = useState<[number, number] | null>(null);
  const [end, setEnd] = useState<[number, number] | null>(null);
  const [route, setRoute] = useState<[number, number][]>([]);
  const [allRoutes, setAllRoutes] = useState<any[]>([]); // Store all Google routes
  const [routeAnalysis, setRouteAnalysis] = useState<{ fastest: string; alternatives: string[] }>({ fastest: '', alternatives: [] });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate('/auth');
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Handler to plan routes (fetch from Google Directions API)
  const handlePlanRoutes = () => {
    if (start && end) {
      const GOOGLE_API_KEY = 'AIzaSyAPer6Lb73eLonZQL-tWGCR2hVFzsAMPz0';
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${start[0]},${start[1]}&destination=${end[0]},${end[1]}&alternatives=true&key=${GOOGLE_API_KEY}`;
      fetch(url)
        .then(res => res.json())
        .then(data => {
          if (data.routes && data.routes.length > 0) {
            setAllRoutes(data.routes);
            // Fastest route is the first
            const fastest = data.routes[0];
            const decoded = decodePolyline(fastest.overview_polyline.points);
            setRoute(decoded);
            // Analysis
            const fastestSummary = `Fastest: ${fastest.summary} (${fastest.legs[0].distance.text}, ${fastest.legs[0].duration.text})`;
            const alternatives = data.routes.slice(1).map((r: any, i: number) => {
              let reason = '';
              if (r.legs[0].duration.value > fastest.legs[0].duration.value) reason += 'Slower';
              if (r.legs[0].distance.value > fastest.legs[0].distance.value) reason += (reason ? ', ' : '') + 'Longer';
              return `Alt ${i+1}: ${r.summary} (${r.legs[0].distance.text}, ${r.legs[0].duration.text})${reason ? ' - ' + reason : ''}`;
            });
            setRouteAnalysis({ fastest: fastestSummary, alternatives });
          }
        });
    }
  };

  // Polyline decoding helper (Google encoded polyline algorithm)
  function decodePolyline(encoded: string): [number, number][] {
    let points: [number, number][] = [];
    let index = 0, lat = 0, lng = 0;
    while (index < encoded.length) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;
      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;
      points.push([lat / 1e5, lng / 1e5]);
    }
    return points;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <DashboardHeader userRole={userRole} />
      
      <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)]">
        {/* Left Panel - Metrics and Filters */}
        <div className="w-full lg:w-80 p-4 space-y-4 overflow-y-auto">
          <FilterPanel filters={filters} onFiltersChange={setFilters} />
          <RoutePlanner
            onSetStart={setStart}
            onSetEnd={setEnd}
            onPlanRoutes={handlePlanRoutes}
            fastestRouteInfo={routeAnalysis.fastest}
            alternativeRoutesInfo={routeAnalysis.alternatives}
          />
          <MetricsPanel />
          <NotificationPanel />
        </div>

        {/* Main Content - Map */}
        <div className="flex-1 p-4">
          <MapView filters={filters} start={start} end={end} route={route} setStart={setStart} setEnd={setEnd} setRoute={setRoute} allRoutes={allRoutes} />
        </div>

        {/* Right Panel - Segment Inspector */}
        {selectedSegment && (
          <div className="w-full lg:w-96 p-4">
            <SegmentInspector 
              segment={selectedSegment}
              onClose={() => setSelectedSegment(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
