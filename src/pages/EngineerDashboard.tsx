// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { supabase } from '@/integrations/supabase/client';
// import { DashboardHeader } from '@/components/DashboardHeader';
// import { MetricsPanel } from '@/components/MetricsPanel';
// import { HighwaySearch } from '@/components/HighwaySearch';
// import { UserDashboard as UserDashboardComponent } from '@/components/UserDashboard';
// import { UserRole } from '@/integrations/supabase/types';
// import { HighwayService } from '@/services/highwayService';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';
// import { CheckCircle, AlertTriangle, Clock, Wrench } from 'lucide-react';

// const EngineerDashboard = () => { 
//   const navigate = useNavigate();
//   const [userRole, setUserRole] = useState<UserRole>('engineer');
//   const [loading, setLoading] = useState(true);
//   const [authError, setAuthError] = useState<string | null>(null);
//   const [userProfile, setUserProfile] = useState<any>(null);
//   const [activeIssues, setActiveIssues] = useState<any[]>([]);
//   const [selectedIssue, setSelectedIssue] = useState<any>(null);
//   const [issuesLoading, setIssuesLoading] = useState(true);

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

//       // Redirect if user is not an engineer
//       if (profile.role !== 'engineer') {
//         navigate(`/dashboard/${profile.role}`);
//         setLoading(false);
//         return;
//       }

//       setUserProfile(profile);
//       setUserRole(profile.role);
//       console.log('Engineer profile loaded:', profile);
//       setLoading(false);
      
//       // Load active issues after profile is loaded
//       await loadActiveIssues();
//     } catch (error) {
//       console.warn('User profile not found:', error);
//       setAuthError('Failed to load user profile. Please try again or log out.');
//       setLoading(false);
//     }
//   };

//   const loadActiveIssues = async () => {
//     try {
//       setIssuesLoading(true);
//       const issues = await HighwayService.getHighwayIssues();
//       setActiveIssues(issues);
//     } catch (error) {
//       console.error('Failed to load active issues:', error);
//     } finally {
//       setIssuesLoading(false);
//     }
//   };

//   const handleStatusUpdate = async (issueId: string, status: string) => {
//     try {
//       const updatedIssue = await HighwayService.updateIssueStatus(issueId, status);
//       console.log('Issue updated:', updatedIssue);
//       alert(`Issue ${issueId} marked as ${status}!`);
      
//       // Reload issues to reflect changes
//       await loadActiveIssues();
//     } catch (error) {
//       console.error('Status update failed:', error);
//       alert('Failed to update status. Please try again.');
//     }
//   };

//   const getSeverityColor = (severity: string) => {
//     switch (severity) {
//       case 'low': return 'bg-green-100 text-green-800';
//       case 'medium': return 'bg-yellow-100 text-yellow-800';
//       case 'high': return 'bg-orange-100 text-orange-800';
//       case 'critical': return 'bg-red-100 text-red-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };

//   const getStatusIcon = (status: string) => {
//     switch (status) {
//       case 'resolved': return <CheckCircle className="w-4 h-4 text-green-600" />;
//       case 'inspected': return <Wrench className="w-4 h-4 text-blue-600" />;
//       default: return <AlertTriangle className="w-4 h-4 text-orange-600" />;
//     }
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
//         {/* Left Panel - Engineer Dashboard */}
//         <div className="w-full lg:w-80 p-4 space-y-4 overflow-y-auto">
//           <UserDashboardComponent
//             userRole={userRole}
//             onImageUpload={() => {}} // Not used for engineers
//             onPinPlacement={() => {}} // Not used for engineers
//             onStatusUpdate={handleStatusUpdate}
//           />
          
//           <HighwaySearch onSearch={() => {}} />
          
//           <MetricsPanel />
//         </div>

//         {/* Main Content - Issue Management */}
//         <div className="flex-1 p-4">
//           <div className="h-full">
//             <div className="mb-6 text-white">
//               <h2 className="text-2xl font-bold mb-2">Engineer Dashboard</h2>
//               <p className="text-slate-300">
//                 Manage and resolve highway issues reported by inspectors and users.
//               </p>
//             </div>
            
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               {/* Active Issues */}
//               <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
//                 <CardHeader>
//                   <CardTitle className="text-white flex items-center">
//                     <Wrench className="w-5 h-5 mr-2 text-orange-400" />
//                     Active Issues
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   {issuesLoading ? (
//                     <div className="text-center text-white py-4">
//                       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
//                       Loading issues...
//                     </div>
//                   ) : activeIssues.length === 0 ? (
//                     <div className="text-center text-slate-400 py-4">
//                       No active issues found
//                     </div>
//                   ) : (
//                     <div className="space-y-3 max-h-96 overflow-y-auto">
//                       {activeIssues.map((issue) => (
//                         <div 
//                           key={issue.id} 
//                           className="p-3 bg-slate-700/30 rounded cursor-pointer hover:bg-slate-700/50 transition-colors"
//                           onClick={() => setSelectedIssue(issue)}
//                         >
//                           <div className="flex items-center justify-between mb-2">
//                             <div className="flex items-center gap-2">
//                               {getStatusIcon(issue.status)}
//                               <span className="text-sm font-medium text-white">
//                                 Issue #{issue.id.slice(0, 8)}
//                               </span>
//                             </div>
//                             <Badge className={getSeverityColor(issue.severity)}>
//                               {issue.severity}
//                             </Badge>
//                           </div>
//                           <p className="text-sm text-slate-300 mb-2">{issue.description}</p>
//                           <div className="flex gap-2">
//                             <Button
//                               size="sm"
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 handleStatusUpdate(issue.id, 'inspected');
//                               }}
//                               className="bg-blue-600 hover:bg-blue-700"
//                             >
//                               Mark Inspected
//                             </Button>
//                             <Button
//                               size="sm"
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 handleStatusUpdate(issue.id, 'resolved');
//                               }}
//                               className="bg-green-600 hover:bg-green-700"
//                             >
//                               Mark Resolved
//                             </Button>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </CardContent>
//               </Card>

//               {/* Issue Details */}
//               {selectedIssue && (
//                 <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
//                   <CardHeader>
//                     <div className="flex items-center justify-between">
//                       <CardTitle className="text-white">Issue Details</CardTitle>
//                       <button
//                         onClick={() => setSelectedIssue(null)}
//                         className="text-slate-400 hover:text-white"
//                       >
//                         ✕
//                       </button>
//                     </div>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="space-y-3 text-sm">
//                       <div>
//                         <strong className="text-slate-300">ID:</strong>
//                         <span className="text-white ml-2">{selectedIssue.id.slice(0, 8)}</span>
//                       </div>
//                       <div>
//                         <strong className="text-slate-300">Description:</strong>
//                         <p className="text-white mt-1">{selectedIssue.description}</p>
//                       </div>
//                       <div>
//                         <strong className="text-slate-300">Severity:</strong>
//                         <span className="text-white ml-2 capitalize">{selectedIssue.severity}</span>
//                       </div>
//                       <div>
//                         <strong className="text-slate-300">Status:</strong>
//                         <span className="text-white ml-2 capitalize">{selectedIssue.status}</span>
//                       </div>
//                       <div>
//                         <strong className="text-slate-300">Location:</strong>
//                         <p className="text-white mt-1">
//                           {selectedIssue.location[0].toFixed(4)}, {selectedIssue.location[1].toFixed(4)}
//                         </p>
//                       </div>
//                       <div>
//                         <strong className="text-slate-300">Reported:</strong>
//                         <p className="text-white mt-1">
//                           {new Date(selectedIssue.created_at).toLocaleString()}
//                         </p>
//                       </div>
                      
//                       {selectedIssue.image_url && (
//                         <div>
//                           <strong className="text-slate-300">Image:</strong>
//                           <img 
//                             src={selectedIssue.image_url} 
//                             alt="Issue" 
//                             className="w-full h-32 object-cover rounded mt-2"
//                           />
//                         </div>
//                       )}
                      
//                       <div className="flex gap-2 mt-4">
//                         <Button
//                           onClick={() => handleStatusUpdate(selectedIssue.id, 'inspected')}
//                           className="bg-blue-600 hover:bg-blue-700"
//                         >
//                           Mark Inspected
//                         </Button>
//                         <Button
//                           onClick={() => handleStatusUpdate(selectedIssue.id, 'resolved')}
//                           className="bg-green-600 hover:bg-green-700"
//                         >
//                           Mark Resolved
//                         </Button>
//                       </div>
//                     </div>
//                   </CardContent>
//                 </Card>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EngineerDashboard; 
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { DashboardHeader } from '@/components/DashboardHeader';
import { MetricsPanel } from '@/components/MetricsPanel';
import { HighwaySearch } from '@/components/HighwaySearch';
import { UserDashboard as UserDashboardComponent } from '@/components/UserDashboard';
import { UserRole } from '@/integrations/supabase/types';
import { HighwayService } from '@/services/highwayService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertTriangle, Wrench } from 'lucide-react';

interface UserProfile {
  id: string;
  role: UserRole;
  [key: string]: unknown;
}

interface Issue {
  id: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical' | string;
  status: string;
  location: [number, number];
  created_at: string;
  image_url?: string;
}

const EngineerDashboard = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<UserRole>('engineer');
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeIssues, setActiveIssues] = useState<Issue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [issuesLoading, setIssuesLoading] = useState(true);

  // loadActiveIssues callback
  const loadActiveIssues = useCallback(async () => {
    try {
      setIssuesLoading(true);
      const issues = await HighwayService.getHighwayIssues();
      setActiveIssues(issues);
    } catch (error) {
      console.error('Failed to load active issues:', error);
    } finally {
      setIssuesLoading(false);
    }
  }, []);

  // loadUserProfile callback includes loadActiveIssues in dependencies
  const loadUserProfile = useCallback(
    async (userId: string) => {
      try {
        const profile = await HighwayService.getUserProfile(userId);
        if (!profile || !profile.role) {
          navigate('/onboarding');
          setLoading(false);
          return;
        }

        if (profile.role !== 'engineer') {
          navigate(`/dashboard/${profile.role}`);
          setLoading(false);
          return;
        }

        setUserProfile(profile);
        setUserRole(profile.role);
        console.log('Engineer profile loaded:', profile);
        setLoading(false);

        // Load active issues after profile is loaded
        await loadActiveIssues();
      } catch (error) {
        console.warn('User profile not found:', error);
        setAuthError('Failed to load user profile. Please try again or log out.');
        setLoading(false);
      }
    },
    [navigate, loadActiveIssues] // Added loadActiveIssues here to fix eslint warning
  );

  useEffect(() => {
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
          console.log('No session found, redirecting to auth');
          navigate('/auth');
          setLoading(false);
          return;
        }

        console.log('Session found:', session.user.email);

        await loadUserProfile(session.user.id);
      } catch (error) {
        console.error('Auth check error:', error);
        setAuthError('Failed to verify authentication. Please try again.');
        navigate('/auth');
        setLoading(false);
      }
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
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
  }, [navigate, loadUserProfile]);

  const handleStatusUpdate = async (issueId: string, status: string) => {
    try {
      const updatedIssue = await HighwayService.updateIssueStatus(issueId, status);
      console.log('Issue updated:', updatedIssue);
      alert(`Issue ${issueId} marked as ${status}!`);

      await loadActiveIssues();
    } catch (error) {
      console.error('Status update failed:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'inspected':
        return <Wrench className="w-4 h-4 text-blue-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
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
        <div className="w-full lg:w-80 p-4 space-y-4 overflow-y-auto">
          <UserDashboardComponent
            userRole={userRole}
            onImageUpload={() => {}}
            onPinPlacement={() => {}}
            onStatusUpdate={handleStatusUpdate}
          />

          <HighwaySearch onSearch={() => {}} />

          <MetricsPanel />
        </div>

        <div className="flex-1 p-4">
          <div className="h-full">
            <div className="mb-6 text-white">
              <h2 className="text-2xl font-bold mb-2">Engineer Dashboard</h2>
              <p className="text-slate-300">Manage and resolve highway issues reported by inspectors and users.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Wrench className="w-5 h-5 mr-2 text-orange-400" />
                    Active Issues
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {issuesLoading ? (
                    <div className="text-center text-white py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                      Loading issues...
                    </div>
                  ) : activeIssues.length === 0 ? (
                    <div className="text-center text-slate-400 py-4">No active issues found</div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {activeIssues.map((issue) => (
                        <div
                          key={issue.id}
                          className="p-3 bg-slate-700/30 rounded cursor-pointer hover:bg-slate-700/50 transition-colors"
                          onClick={() => setSelectedIssue(issue)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(issue.status)}
                              <span className="text-sm font-medium text-white">Issue #{issue.id.slice(0, 8)}</span>
                            </div>
                            <Badge className={getSeverityColor(issue.severity)}>{issue.severity}</Badge>
                          </div>
                          <p className="text-sm text-slate-300 mb-2">{issue.description}</p>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusUpdate(issue.id, 'inspected');
                              }}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Mark Inspected
                            </Button>
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusUpdate(issue.id, 'resolved');
                              }}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Mark Resolved
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {selectedIssue && (
                <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white">Issue Details</CardTitle>
                      <button onClick={() => setSelectedIssue(null)} className="text-slate-400 hover:text-white">
                        ✕
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent>
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

                      <div className="flex gap-2 mt-4">
                        <Button onClick={() => handleStatusUpdate(selectedIssue.id, 'inspected')} className="bg-blue-600 hover:bg-blue-700">
                          Mark Inspected
                        </Button>
                        <Button onClick={() => handleStatusUpdate(selectedIssue.id, 'resolved')} className="bg-green-600 hover:bg-green-700">
                          Mark Resolved
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EngineerDashboard;
