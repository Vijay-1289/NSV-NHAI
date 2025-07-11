import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { DashboardHeader } from '@/components/DashboardHeader';
import GoogleRouteMap from '@/components/GoogleRouteMap';
import { MetricsPanel } from '@/components/MetricsPanel';
import { FilterPanel } from '@/components/FilterPanel';
import { SegmentInspector } from '@/components/SegmentInspector';
import { NotificationPanel } from '@/components/NotificationPanel';
import RoutePlanner from '@/components/RoutePlanner';
import { HighwaySearch } from '@/components/HighwaySearch';
import { geocodeHighwayName } from '@/services/geocodeService';
import { UserDashboard } from '@/components/UserDashboard';
import { UserRole } from '@/integrations/supabase/types';
import MapView from '@/components/MapView';
import { HighwayService } from '@/services/highwayService';

const GOOGLE_API_KEY = 'AIzaSyA8lpEzD_QSfrtefxiVETxsTv7lnbFeWqY';

const Index = () => {
  const navigate = useNavigate();
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [userRole, setUserRole] = useState<UserRole>('user'); // Default to user role
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
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Load user profile on mount
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const profile = await HighwayService.getUserProfile(user.id);
        setUserProfile(profile);
        setUserRole(profile.role);
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  };

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
    if (start && end && window.google && window.google.maps) {
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: { lat: start[0], lng: start[1] },
          destination: { lat: end[0], lng: end[1] },
          travelMode: window.google.maps.TravelMode.DRIVING,
          provideRouteAlternatives: true,
        },
        (result, status) => {
          if (status === 'OK' && result.routes.length > 0) {
            setAllRoutes(result.routes);
            // Fastest route is the first
            const fastest = result.routes[0];
            const decoded = fastest.overview_path.map((latLng) => [latLng.lat(), latLng.lng()]);
            setRoute(decoded);
            // Analysis
            const fastestSummary = `Fastest: ${fastest.summary} (${fastest.legs[0].distance.text}, ${fastest.legs[0].duration.text})`;
            const alternatives = result.routes.slice(1).map((r, i) => {
              let reason = '';
              if (r.legs[0].duration.value > fastest.legs[0].duration.value) reason += 'Slower';
              if (r.legs[0].distance.value > fastest.legs[0].distance.value) reason += (reason ? ', ' : '') + 'Longer';
              return `Alt ${i+1}: ${r.summary} (${r.legs[0].distance.text}, ${r.legs[0].duration.text})${reason ? ' - ' + reason : ''}`;
            });
            setRouteAnalysis({ fastest: fastestSummary, alternatives });
          }
        }
      );
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

  const handleHighwaySearch = async (highway: string) => {
    try {
      const { start: s, end: e } = await geocodeHighwayName(highway, GOOGLE_API_KEY);
      setStart(s);
      setEnd(e);
    } catch (err: any) {
      alert('Could not find highway: ' + (err.message || err));
    }
  };

  // New handlers for role-based functionality
  const handleImageUpload = async (file: File, location: [number, number]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Upload file to Supabase storage
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${timestamp}.${fileExt}`;
      
      const fileUrl = await HighwayService.uploadFile(file, fileName);
      
      // Create highway issue
      const issue = await HighwayService.createHighwayIssue({
        user_id: user.id,
        location: location,
        description: `Issue reported by user`,
        severity: 'medium',
        image_url: fileUrl,
        status: 'reported'
      });

      console.log('Issue created:', issue);
      alert('Issue reported successfully! Inspector will be notified.');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    }
  };

  const handlePinPlacement = async (location: [number, number], severity: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create inspection issue
      const issue = await HighwayService.createHighwayIssue({
        user_id: user.id,
        location: location,
        description: `Inspection pin placed by inspector`,
        severity: severity as any,
        status: 'inspected'
      });

      console.log('Inspection pin placed:', issue);
      alert('Pin placed! Engineers will be notified.');
    } catch (error) {
      console.error('Pin placement failed:', error);
      alert('Failed to place pin. Please try again.');
    }
  };

  const handleStatusUpdate = async (issueId: string, status: string) => {
    try {
      const updatedIssue = await HighwayService.updateIssueStatus(issueId, status);
      console.log('Issue updated:', updatedIssue);
      alert(`Issue ${issueId} marked as ${status}!`);
    } catch (error) {
      console.error('Status update failed:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  const handleIssueSelect = (issue: any) => {
    setSelectedIssue(issue);
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
        {/* Left Panel - Role-based Dashboard */}
        <div className="w-full lg:w-80 p-4 space-y-4 overflow-y-auto">
          <UserDashboard
            userRole={userRole}
            onImageUpload={handleImageUpload}
            onPinPlacement={handlePinPlacement}
            onStatusUpdate={handleStatusUpdate}
          />
          
          {/* Show highway search for all roles */}
          <HighwaySearch onSearch={handleHighwaySearch} />
          
          {/* Show additional components based on role */}
          {userRole === 'user' && (
            <>
              <RoutePlanner
                onSetStart={setStart}
                onSetEnd={setEnd}
                onPlanRoutes={handlePlanRoutes}
                fastestRouteInfo={routeAnalysis.fastest}
                alternativeRoutesInfo={routeAnalysis.alternatives}
              />
              <MetricsPanel />
            </>
          )}
          
          {userRole === 'inspector' && (
            <NotificationPanel />
          )}
          
          {userRole === 'engineer' && (
            <MetricsPanel />
          )}
        </div>

        {/* Main Content - Map */}
        <div className="flex-1 p-4">
          <MapView
            filters={filters}
            start={start}
            end={end}
            route={route}
            setStart={setStart}
            setEnd={setEnd}
            setRoute={setRoute}
            allRoutes={allRoutes}
            userRole={userRole}
            onPinPlacement={handlePinPlacement}
            onIssueSelect={handleIssueSelect}
          />
        </div>

        {/* Right Panel - Issue Details */}
        {selectedIssue && (
          <div className="w-full lg:w-96 p-4">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Issue Details</h3>
                <button
                  onClick={() => setSelectedIssue(null)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-3 text-sm">
                <div>
                  <strong className="text-slate-300">ID:</strong>
                  <span className="text-white ml-2">{selectedIssue.id.slice(0, 8)}</span>
                </div>
                <div>
                  <strong className="text-slate-300">Description:</strong>
                  <p className="text-white mt-1">{selectedIssue.description}</p>
                </div>
                <div>
                  <strong className="text-slate-300">Severity:</strong>
                  <span className="text-white ml-2 capitalize">{selectedIssue.severity}</span>
                </div>
                <div>
                  <strong className="text-slate-300">Status:</strong>
                  <span className="text-white ml-2 capitalize">{selectedIssue.status}</span>
                </div>
                <div>
                  <strong className="text-slate-300">Location:</strong>
                  <p className="text-white mt-1">
                    {selectedIssue.location[0].toFixed(4)}, {selectedIssue.location[1].toFixed(4)}
                  </p>
                </div>
                <div>
                  <strong className="text-slate-300">Reported:</strong>
                  <p className="text-white mt-1">
                    {new Date(selectedIssue.created_at).toLocaleString()}
                  </p>
                </div>
                
                {selectedIssue.image_url && (
                  <div>
                    <strong className="text-slate-300">Image:</strong>
                    <img 
                      src={selectedIssue.image_url} 
                      alt="Issue" 
                      className="w-full h-32 object-cover rounded mt-2"
                    />
                  </div>
                )}
                
                {userRole === 'engineer' && (
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleStatusUpdate(selectedIssue.id, 'inspected')}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-xs"
                    >
                      Mark Inspected
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedIssue.id, 'resolved')}
                      className="px-3 py-1 bg-green-600 text-white rounded text-xs"
                    >
                      Mark Resolved
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
