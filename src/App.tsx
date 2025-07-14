import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import Onboarding from "./pages/Onboarding";
import UserDashboard from "./pages/UserDashboard";
import InspectorDashboard from "./pages/InspectorDashboard";
import EngineerDashboard from "./pages/EngineerDashboard";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import EarthImage from '../Earth.jpg';

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    const handleUnload = () => {
      // Sign out from Supabase and clear browser storage
      window.localStorage.clear();
      window.sessionStorage.clear();
      // Optionally, sign out from Supabase (async, may not always complete before unload)
      supabase.auth.signOut();
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <div className="relative min-h-screen">
          <img
            src={EarthImage}
            alt="Earth background"
            className="fixed top-0 left-0 w-full h-full object-cover z-0"
            style={{ pointerEvents: 'none' }}
          />
          <div className="relative z-10">
            <Router>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/login" element={<Login />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/dashboard/user" element={<UserDashboard />} />
                <Route path="/dashboard/inspector" element={<InspectorDashboard />} />
                <Route path="/dashboard/engineer" element={<EngineerDashboard />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Router>
          </div>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
