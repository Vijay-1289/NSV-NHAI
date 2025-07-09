import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Chrome, MapPin, BarChart3, Shield } from 'lucide-react';

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/');
      }
    };
    checkUser();
  }, [navigate]);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        toast({
          title: "Authentication Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-blue-600/20 p-4 rounded-full">
              <MapPin className="w-12 h-12 text-blue-400" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">NSV Vehicle Monitoring</h1>
            <p className="text-slate-300">Advanced highway condition monitoring system</p>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-2">
            <div className="bg-slate-800/50 p-3 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-400 mx-auto" />
            </div>
            <p className="text-xs text-slate-300">Real-time Analytics</p>
          </div>
          <div className="space-y-2">
            <div className="bg-slate-800/50 p-3 rounded-lg">
              <MapPin className="w-6 h-6 text-green-400 mx-auto" />
            </div>
            <p className="text-xs text-slate-300">Live Tracking</p>
          </div>
          <div className="space-y-2">
            <div className="bg-slate-800/50 p-3 rounded-lg">
              <Shield className="w-6 h-6 text-orange-400 mx-auto" />
            </div>
            <p className="text-xs text-slate-300">Safety Monitoring</p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
          <CardHeader className="text-center">
            <CardTitle className="text-white">Access Dashboard</CardTitle>
            <CardDescription className="text-slate-300">
              Sign in with Google to access the highway monitoring dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-white hover:bg-gray-100 text-gray-900 font-medium"
              size="lg"
            >
              <Chrome className="w-5 h-5 mr-2" />
              {loading ? "Signing in..." : "Continue with Google"}
            </Button>
            
            <div className="text-center">
              <p className="text-xs text-slate-400">
                Secure authentication powered by Supabase
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-slate-400">
          <p>© 2024 NSV Vehicle Monitoring System</p>
          <p>Real-time highway condition monitoring</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;