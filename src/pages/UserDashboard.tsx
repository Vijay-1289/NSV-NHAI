// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { supabase } from '@/integrations/supabase/client';
// import { DashboardHeader } from '@/components/DashboardHeader';
// import { MetricsPanel } from '@/components/MetricsPanel';
// import RoutePlanner from '@/components/RoutePlanner';
// import { HighwaySearch } from '@/components/HighwaySearch';
// import { UserDashboard as UserDashboardComponent } from '@/components/UserDashboard';
// import { UserRole } from '@/integrations/supabase/types';
// import MapView from '@/components/MapView';
// import { HighwayService } from '@/services/highwayService';
// import { geocodeHighwayName } from '@/services/geocodeService';

// const GOOGLE_API_KEY = 'AIzaSyA8lpEzD_QSfrtefxiVETxsTv7lnbFeWqY';

// const UserDashboard = () => {
//   const navigate = useNavigate();
//   const [userRole, setUserRole] = useState<UserRole>('user');
//   const [filters, setFilters] = useState({
//     dateRange: 'today',
//     distressLevel: 'all',
//     location: 'all'
//   });
//   const [loading, setLoading] = useState(true);
//   const [authError, setAuthError] = useState<string | null>(null);
//   const [start, setStart] = useState<[number, number] | null>(null);
//   const [end, setEnd] = useState<[number, number] | null>(null);
//   const [route, setRoute] = useState<[number, number][]>([]);
//   const [allRoutes, setAllRoutes] = useState<any[]>([]);
//   const [routeAnalysis, setRouteAnalysis] = useState<{ fastest: string; alternatives: string[] }>({ fastest: '', alternatives: [] });
//   const [selectedIssue, setSelectedIssue] = useState<any>(null);
//   const [userProfile, setUserProfile] = useState<any>(null);

//   // Check authentication and role on mount
//   useEffect(() => {
//     const checkAuth = async () => {
//       try {
//         setLoading(true);
//         setAuthError(null);
        
//         const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
//         if (sessionError) {
//           console.error('Session error:', sessionError);
//           setAuthError('Authentication error. Please try logging in again.');
//           navigate('/auth');
//           setLoading(false);
//           return;
//         }

//         if (!session) {
//           console.log('No session found, redirecting to auth');
//           navigate('/auth');
//           setLoading(false);
//           return;
//         }

//         console.log('Session found:', session.user.email);
        
//         // Load user profile and check role
//         await loadUserProfile(session.user.id);
//       } catch (error) {
//         console.error('Auth check error:', error);
//         setAuthError('Failed to verify authentication. Please try again.');
//         navigate('/auth');
//         setLoading(false);
//       }
//     };

//     checkAuth();

//     const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
//       console.log('Auth state change:', event, session?.user?.email);
      
//       if (event === 'SIGNED_OUT') {
//         console.log('User signed out');
//         navigate('/auth');
//       } else if (event === 'SIGNED_IN' && session) {
//         console.log('User signed in:', session.user.email);
//         await loadUserProfile(session.user.id);
//         setLoading(false);
//       } else if (event === 'TOKEN_REFRESHED' && session) {
//         console.log('Token refreshed');
//         setLoading(false);
//       }
//     });

//     return () => subscription.unsubscribe();
//   }, [navigate]);

//   const loadUserProfile = async (userId: string) => {
//     try {
//       const profile = await HighwayService.getUserProfile(userId);
//       if (!profile || !profile.role) {
//         navigate('/onboarding');
//         setLoading(false);
//         return;
//       }

//       // Redirect if user is not a normal user
//       if (profile.role !== 'user') {
//         navigate(`/dashboard/${profile.role}`);
//         setLoading(false);
//         return;
//       }

//       setUserProfile(profile);
//       setUserRole(profile.role);
//       console.log('User profile loaded:', profile);
//       setLoading(false);
//     } catch (error) {
//       console.warn('User profile not found:', error);
//       setAuthError('Failed to load user profile. Please try again or log out.');
//       setLoading(false);
//     }
//   };

//   // Handler to plan routes
//   const handlePlanRoutes = () => {
//     if (start && end && window.google && window.google.maps) {
//       const directionsService = new window.google.maps.DirectionsService();
//       directionsService.route(
//         {
//           origin: { lat: start[0], lng: start[1] },
//           destination: { lat: end[0], lng: end[1] },
//           travelMode: window.google.maps.TravelMode.DRIVING,
//           provideRouteAlternatives: true,
//         },
//         (result, status) => {
//           if (status === 'OK' && result.routes.length > 0) {
//             setAllRoutes(result.routes);
//             const fastest = result.routes[0];
//             const decoded = fastest.overview_path.map((latLng) => [latLng.lat(), latLng.lng()] as [number, number]);
//             setRoute(decoded);
//             const fastestSummary = `Fastest: ${fastest.summary} (${fastest.legs[0].distance.text}, ${fastest.legs[0].duration.text})`;
//             const alternatives = result.routes.slice(1).map((r, i) => {
//               let reason = '';
//               if (r.legs[0].duration.value > fastest.legs[0].duration.value) reason += 'Slower';
//               if (r.legs[0].distance.value > fastest.legs[0].distance.value) reason += (reason ? ', ' : '') + 'Longer';
//               return `Alt ${i+1}: ${r.summary} (${r.legs[0].distance.text}, ${r.legs[0].duration.text})${reason ? ' - ' + reason : ''}`;
//             });
//             setRouteAnalysis({ fastest: fastestSummary, alternatives });
//           }
//         }
//       );
//     }
//   };

//   const handleHighwaySearch = async (highway: string) => {
//     try {
//       const { start: s, end: e } = await geocodeHighwayName(highway, GOOGLE_API_KEY);
//       setStart(s);
//       setEnd(e);
//     } catch (err: any) {
//       alert('Could not find highway: ' + (err.message || err));
//     }
//   };

//   const handleImageUpload = async (file: File, location: [number, number]) => {
//     try {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) throw new Error('User not authenticated');

//       const timestamp = Date.now();
//       const fileExt = file.name.split('.').pop();
//       const fileName = `${user.id}/${timestamp}.${fileExt}`;
      
//       const fileUrl = await HighwayService.uploadFile(file, fileName);
      
//       const issue = await HighwayService.createHighwayIssue({
//         user_id: user.id,
//         location: location,
//         description: `Issue reported by user`,
//         severity: 'medium',
//         image_url: fileUrl,
//         status: 'reported'
//       });

//       console.log('Issue created:', issue);
//       alert('Issue reported successfully! Inspector will be notified.');
//     } catch (error) {
//       console.error('Upload failed:', error);
//       alert('Upload failed. Please try again.');
//     }
//   };

//   const handleIssueSelect = (issue: any) => {
//     setSelectedIssue(issue);
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
//         <div className="text-center text-white">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
//           <div className="text-lg">Loading...</div>
//         </div>
//       </div>
//     );
//   }

//   if (authError) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
//         <div className="text-center text-white">
//           <div className="bg-red-600 p-4 rounded-lg mb-4">
//             <strong>Error:</strong> {authError}
//           </div>
//           <button
//             onClick={() => window.location.reload()}
//             className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2"
//           >
//             Retry
//           </button>
//           <button
//             onClick={async () => { await supabase.auth.signOut(); navigate('/auth'); }}
//             className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
//           >
//             Log Out
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
//       <DashboardHeader userRole={userRole} />
      
//       <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)]">
//         {/* Left Panel - User Dashboard */}
//         <div className="w-full lg:w-80 p-4 space-y-4 overflow-y-auto">
//           <UserDashboardComponent
//             userRole={userRole}
//             onImageUpload={handleImageUpload}
//             onPinPlacement={() => {}} // Not used for normal users
//             onStatusUpdate={() => {}} // Not used for normal users
//           />
          
//           <HighwaySearch onSearch={handleHighwaySearch} />
          
//           <RoutePlanner
//             onSetStart={setStart}
//             onSetEnd={setEnd}
//             onPlanRoutes={handlePlanRoutes}
//             fastestRouteInfo={routeAnalysis.fastest}
//             alternativeRoutesInfo={routeAnalysis.alternatives}
//           />
          
//           <MetricsPanel />
//         </div>

//         {/* Main Content - Map */}
//         <div className="flex-1 p-4">
//           <MapView
//             filters={filters}
//             start={start}
//             end={end}
//             route={route}
//             setStart={setStart}
//             setEnd={setEnd}
//             setRoute={setRoute}
//             allRoutes={allRoutes}
//             userRole={userRole}
//             onPinPlacement={() => {}} // Not used for normal users
//             onIssueSelect={handleIssueSelect}
//           />
//         </div>

//         {/* Right Panel - Issue Details */}
//         {selectedIssue && (
//           <div className="w-full lg:w-96 p-4">
//             <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-4">
//               <div className="flex items-center justify-between mb-4">
//                 <h3 className="text-lg font-semibold text-white">Issue Details</h3>
//                 <button
//                   onClick={() => setSelectedIssue(null)}
//                   className="text-slate-400 hover:text-white"
//                 >
//                   ✕
//                 </button>
//               </div>
              
//               <div className="space-y-3 text-sm">
//                 <div>
//                   <strong className="text-slate-300">ID:</strong>
//                   <span className="text-white ml-2">{selectedIssue.id.slice(0, 8)}</span>
//                 </div>
//                 <div>
//                   <strong className="text-slate-300">Description:</strong>
//                   <p className="text-white mt-1">{selectedIssue.description}</p>
//                 </div>
//                 <div>
//                   <strong className="text-slate-300">Severity:</strong>
//                   <span className="text-white ml-2 capitalize">{selectedIssue.severity}</span>
//                 </div>
//                 <div>
//                   <strong className="text-slate-300">Status:</strong>
//                   <span className="text-white ml-2 capitalize">{selectedIssue.status}</span>
//                 </div>
//                 <div>
//                   <strong className="text-slate-300">Location:</strong>
//                   <p className="text-white mt-1">
//                     {selectedIssue.location[0].toFixed(4)}, {selectedIssue.location[1].toFixed(4)}
//                   </p>
//                 </div>
//                 <div>
//                   <strong className="text-slate-300">Reported:</strong>
//                   <p className="text-white mt-1">
//                     {new Date(selectedIssue.created_at).toLocaleString()}
//                   </p>
//                 </div>
                
//                 {selectedIssue.image_url && (
//                   <div>
//                     <strong className="text-slate-300">Image:</strong>
//                     <img 
//                       src={selectedIssue.image_url} 
//                       alt="Issue" 
//                       className="w-full h-32 object-cover rounded mt-2"
//                     />
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default UserDashboard; 
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { DashboardHeader } from '@/components/DashboardHeader';
import { MetricsPanel } from '@/components/MetricsPanel';
import RoutePlanner from '@/components/RoutePlanner';
import { HighwaySearch } from '@/components/HighwaySearch';
import { UserDashboard as UserDashboardComponent } from '@/components/UserDashboard';
import { UserRole } from '@/integrations/supabase/types';
import MapView from '@/components/MapView';
import { HighwayService } from '@/services/highwayService';
import { geocodeHighwayName } from '@/services/geocodeService';

const GOOGLE_API_KEY = 'AIzaSyA8lpEzD_QSfrtefxiVETxsTv7lnbFeWqY';

// Define Issue type explicitly
interface Issue {
  id: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  status: string;
  location: [number, number];
  created_at: string;
  image_url?: string;
}

// Define UserProfile type explicitly
interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  // Add other profile fields if needed
}

// Route type for Google Maps route points
type Route = [number, number][];

// The type for Google Maps DirectionsRoute from the Google Maps API typings
declare global {
  interface Window {
    google: typeof google;
  }
}

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [userRole, setUserRole] = useState<UserRole>('user');
  const [filters, setFilters] = useState({
    dateRange: 'today',
    distressLevel: 'all',
    location: 'all',
  });

  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const [start, setStart] = useState<[number, number] | null>(null);
  const [end, setEnd] = useState<[number, number] | null>(null);
  const [route, setRoute] = useState<Route>([]);
  const [allRoutes, setAllRoutes] = useState<google.maps.DirectionsRoute[]>([]);

  const [routeAnalysis, setRouteAnalysis] = useState<{ fastest: string; alternatives: string[] }>({
    fastest: '',
    alternatives: [],
  });

  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const loadUserProfile = async (userId: string) => {
      try {
        const profile = await HighwayService.getUserProfile(userId);
        if (!profile || !profile.role) {
          navigate('/onboarding');
          setLoading(false);
          return;
        }

        // Redirect if user is not a normal user
        if (profile.role !== 'user') {
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
    };

    const checkAuth = async () => {
      try {
        setLoading(true);
        setAuthError(null);

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Session error:', sessionError);
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
      } catch (error) {
        console.error('Auth check error:', error);
        setAuthError('Failed to verify authentication. Please try again.');
        navigate('/auth');
        setLoading(false);
      }
    };

    checkAuth();

    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate('/auth');
      } else if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
        await loadUserProfile(session.user.id);
        setLoading(false);
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, [navigate]);

  // Plan routes handler
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
        (result: google.maps.DirectionsResult | null, status: google.maps.DirectionsStatus) => {
          if (status === 'OK' && result && result.routes.length > 0) {
            setAllRoutes(result.routes);

            const fastest = result.routes[0];
            const decoded = fastest.overview_path.map((latLng) => [latLng.lat(), latLng.lng()] as [number, number]);
            setRoute(decoded);

            const fastestSummary = `Fastest: ${fastest.summary} (${fastest.legs[0].distance.text}, ${fastest.legs[0].duration.text})`;

            const alternatives = result.routes.slice(1).map((r, i) => {
              let reason = '';
              if (r.legs[0].duration.value > fastest.legs[0].duration.value) reason += 'Slower';
              if (r.legs[0].distance.value > fastest.legs[0].distance.value) reason += (reason ? ', ' : '') + 'Longer';
              return `Alt ${i + 1}: ${r.summary} (${r.legs[0].distance.text}, ${r.legs[0].duration.text})${reason ? ' - ' + reason : ''}`;
            });

            setRouteAnalysis({ fastest: fastestSummary, alternatives });
          }
        }
      );
    }
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

  // Fix for upload: explicitly type file param as File, location as tuple
  const handleImageUpload = async (file: File, location: [number, number]): Promise<void> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('User not authenticated');

      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop() ?? '';
      const fileName = `${user.id}/${timestamp}.${fileExt}`;

      const fileUrl = await HighwayService.uploadFile(file, fileName);

      const issue = await HighwayService.createHighwayIssue({
        user_id: user.id,
        location,
        description: `Issue reported by user`,
        severity: 'medium',
        image_url: fileUrl,
        status: 'reported',
      });

      alert('Issue reported successfully! Inspector will be notified.');
      console.log('Issue created:', issue);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    }
  };

  const handleIssueSelect = (issue: Issue): void => {
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
            onClick={async () => {
              await supabase.auth.signOut();
              navigate('/auth');
            }}
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
        {/* Left Panel - User Dashboard */}
        <div className="w-full lg:w-80 p-4 space-y-4 overflow-y-auto">
          <UserDashboardComponent
            userRole={userRole}
            onImageUpload={handleImageUpload}
            onPinPlacement={() => {}}
            onStatusUpdate={() => {}}
          />

          <HighwaySearch onSearch={handleHighwaySearch} />

          <RoutePlanner
            onSetStart={setStart}
            onSetEnd={setEnd}
            onPlanRoutes={handlePlanRoutes}
            fastestRouteInfo={routeAnalysis.fastest}
            alternativeRoutesInfo={routeAnalysis.alternatives}
          />

          <MetricsPanel />
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
            allRoutes={allRoutes.map(route => route.overview_path.map(latLng => [latLng.lat(), latLng.lng()]))}
            userRole={userRole}
            onPinPlacement={() => {}}
            onIssueSelect={handleIssueSelect}
          />
        </div>

        {/* Right Panel - Issue Details */}
        {selectedIssue && (
          <div className="w-full lg:w-96 p-4">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Issue Details</h3>
                <button onClick={() => setSelectedIssue(null)} className="text-slate-400 hover:text-white">
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
                  <p className="text-white mt-1">{new Date(selectedIssue.created_at).toLocaleString()}</p>
                </div>

                {selectedIssue.image_url && (
                  <div>
                    <strong className="text-slate-300">Image:</strong>
                    <img src={selectedIssue.image_url} alt="Issue" className="w-full h-32 object-cover rounded mt-2" />
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

export default UserDashboard;
