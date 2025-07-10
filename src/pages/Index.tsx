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

  // Handler to plan routes (fetch from API, here mock)
  const handlePlanRoutes = () => {
    if (start && end) {
      fetch(
        `https://bhuvan-app1.nrsc.gov.in/api/routing/curl_routing_state.php?lat1=${start[0]}&lon1=${start[1]}&lat2=${end[0]}&lon2=${end[1]}&token=3265a114cf7f9f05fd03035b51dcda177e22e663`
      )
        .then(res => res.json())
        .then(data => {
          if (data.route) setRoute(data.route.map(([lat, lng]: [number, number]) => [lat, lng]));
        });
    }
  };

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
            fastestRouteInfo={route.length > 0 ? 'This is the fastest route based on current traffic and weather.' : undefined}
            alternativeRoutesInfo={route.length > 0 ? ['Other routes have more traffic or rain.'] : []}
          />
          <MetricsPanel />
          <NotificationPanel />
        </div>

        {/* Main Content - Map */}
        <div className="flex-1 p-4">
          <MapView filters={filters} start={start} end={end} route={route} setStart={setStart} setEnd={setEnd} setRoute={setRoute} />
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
