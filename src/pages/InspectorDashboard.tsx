import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { DashboardHeader } from '@/components/DashboardHeader';
import { NotificationPanel } from '@/components/NotificationPanel';
import { HighwaySearch } from '@/components/HighwaySearch';
import { UserDashboard as UserDashboardComponent } from '@/components/UserDashboard';
import { UserRole } from '@/integrations/supabase/types';
import MapView from '@/components/MapView';
import { HighwayService } from '@/services/highwayService';

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
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [start, setStart] = useState<[number, number] | null>(null);
  const [end, setEnd] = useState<[number, number] | null>(null);
  const [route, setRoute] = useState<[number, number][]>([]);
  const [allRoutes, setAllRoutes] = useState<any[]>([]);

  // Check authentication and role on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        setAuthError(null);
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setAuthError('Authentication error. Please try logging in again.');
          navigate('/auth');
          setLoading(false);
          return;
        }

        if (!session) {
          console.log('No session found, redirecting to auth');
          navigate('/auth');
          setLoading(false);
          return;
        }

        console.log('Session found:', session.user.email);
        
        // Load user profile and check role
        await loadUserProfile(session.user.id);
      } catch (error) {
        console.error('Auth check error:', error);
        setAuthError('Failed to verify authentication. Please try again.');
        navigate('/auth');
        setLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.email);
      
      if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        navigate('/auth');
      } else if (event === 'SIGNED_IN' && session) {
        console.log('User signed in:', session.user.email);
        await loadUserProfile(session.user.id);
        setLoading(false);
      } else if (event === 'TOKEN_REFRESHED' && session) {
        console.log('Token refreshed');
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadUserProfile = async (userId: string) => {
    try {
      const profile = await HighwayService.getUserProfile(userId);
      if (!profile || !profile.role) {
        navigate('/onboarding');
        setLoading(false);
        return;
      }

      // Redirect if user is not an inspector
      if (profile.role !== 'inspector') {
        navigate(`/dashboard/${profile.role}`);
        setLoading(false);
        return;
      }

      setUserProfile(profile);
      setUserRole(profile.role);
      console.log('Inspector profile loaded:', profile);
      setLoading(false);
    } catch (error) {
      console.warn('User profile not found:', error);
      setAuthError('Failed to load user profile. Please try again or log out.');
      setLoading(false);
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
          
          <HighwaySearch onSearch={() => {}} />
          
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