import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { DashboardHeader } from '@/components/DashboardHeader';
import { NotificationPanel } from '@/components/NotificationPanel';
import { HighwaySearch } from '@/components/HighwaySearch';
import { UserDashboard as UserDashboardComponent } from '@/components/UserDashboard';
import { UserRole } from '@/integrations/supabase/types';
import MapView from '@/components/MapView';
import { HighwayService } from '@/services/highwayService';
import { geocodeHighwayName } from '@/services/geocodeService';

// Define types
type Coordinate = [number, number];

interface HighwayIssue {
  id: string;
  user_id: string;
  location: Coordinate;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'inspected' | 'resolved' | 'pending' | string; // add other statuses if needed
  created_at: string;
  image_url?: string;
}

interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  [key: string]: unknown;
}

type Route = Coordinate[];

const GOOGLE_API_KEY = 'AIzaSyA8lpEzD_QSfrtefxiVETxsTv7lnbFeWqY';

const InspectorDashboard = () => {
  const navigate = useNavigate();

  const [userRole, setUserRole] = useState<UserRole>('inspector');
  const [filters, setFilters] = useState({
    dateRange: 'today',
    distressLevel: 'all',
    location: 'all'
  });

  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<HighwayIssue | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [start, setStart] = useState<Coordinate | null>(null);
  const [end, setEnd] = useState<Coordinate | null>(null);
  const [route, setRoute] = useState<Coordinate[]>([]);
  const [allRoutes, setAllRoutes] = useState<Route[]>([]);

  // Load user profile, wrapped in useCallback for exhaustive-deps lint fix
  const loadUserProfile = useCallback(async (userId: string) => {
    try {
      const profile = await HighwayService.getUserProfile(userId);
      if (!profile || !profile.role) {
        navigate('/onboarding');
        setLoading(false);
        return;
      }

      if (profile.role !== 'inspector') {
        navigate(`/dashboard/${profile.role}`);
        setLoading(false);
        return;
      }

      setUserProfile(profile);
      setUserRole(profile.role);
      setLoading(false);
    } catch (error) {
      console.warn('User profile not found:', error);
      setAuthError('Failed to load user profile. Please try again or log out.');
      setLoading(false);
    }
  }, [navigate]);

  // Auth check and subscription effect
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        setAuthError(null);

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          setAuthError('Authentication error. Please try logging in again.');
          navigate('/auth');
          setLoading(false);
          return;
        }

        if (!session) {
          navigate('/auth');
          setLoading(false);
          return;
        }

        await loadUserProfile(session.user.id);
      } catch {
        setAuthError('Failed to verify authentication. Please try again.');
        navigate('/auth');
        setLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate('/auth');
      } else if (event === 'SIGNED_IN' && session) {
        await loadUserProfile(session.user.id);
        setLoading(false);
      } else if (event === 'TOKEN_REFRESHED' && session) {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, loadUserProfile]);

  // Handle pin placement, with typed severity
  const handlePinPlacement = async (location: Coordinate, severity: 'low' | 'medium' | 'high' | 'critical') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const issue = await HighwayService.createHighwayIssue({
        user_id: user.id,
        location,
        description: `Inspection pin placed by inspector`,
        severity,
        status: 'inspected'
      });

      alert('Pin placed! Engineers will be notified.');
    } catch {
      alert('Failed to place pin. Please try again.');
    }
  };

  // Update issue status
  const handleStatusUpdate = async (issueId: string, status: string) => {
    try {
      await HighwayService.updateIssueStatus(issueId, status);
      alert(`Issue ${issueId} marked as ${status}!`);
    } catch {
      alert('Failed to update status. Please try again.');
    }
  };

  const handleIssueSelect = (issue: HighwayIssue) => {
    setSelectedIssue(issue);
  };

  const handleHighwaySearch = async (highway: string): Promise<void> => {
    try {
      const { start: s, end: e } = await geocodeHighwayName(highway, GOOGLE_API_KEY);
      setStart(s);
      setEnd(e);
    } catch (err) {
      if (err instanceof Error) alert('Could not find highway: ' + err.message);
      else alert('Could not find highway.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="bg-red-600 p-4 rounded-lg mb-4">
            <strong>Error:</strong> {authError}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2"
          >
            Retry
          </button>
          <button
            onClick={async () => { await supabase.auth.signOut(); navigate('/auth'); }}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Log Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <DashboardHeader userRole={userRole} />
      
      <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)]">
        {/* Left Panel - Inspector Dashboard */}
        <div className="w-full lg:w-80 p-4 space-y-4 overflow-y-auto">
          <UserDashboardComponent
            userRole={userRole}
            onImageUpload={() => {}} // Not used for inspectors
            onPinPlacement={handlePinPlacement}
            onStatusUpdate={handleStatusUpdate}
          />
          
          <HighwaySearch onSearch={handleHighwaySearch} />
          
          <NotificationPanel />
        </div>

        {/* Main Content - Map for placing inspection pins */}
        <div className="flex-1 p-4">
          <div className="h-full">
            <div className="mb-4 text-white">
              <h2 className="text-xl font-bold mb-2">Highway Inspector Dashboard</h2>
              <p className="text-slate-300">
                Click on the map to place inspection pins. Monitor real-time notifications and manage highway issues.
              </p>
            </div>
            
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
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InspectorDashboard;
