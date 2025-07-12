import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, setSessionFromCookies } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DebugAuth from '@/components/DebugAuth';

const Auth = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);

  // Check if user is already authenticated or session is set after OAuth
  useEffect(() => {
    const checkAuth = async () => {
      // First try to set session from cookies (for OAuth callback)
      await setSessionFromCookies();
      
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log('Session found, navigating to home');
        navigate('/');
      }
    };
    checkAuth();

    // Listen for auth state changes (including after OAuth)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, session?.user?.email);
      if (session) {
        navigate('/');
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          console.log('Sign up successful:', data.user.email);
          alert('Account created successfully! Please check your email for verification.');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          console.log('Sign in successful:', data.user.email);
          navigate('/');
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      setError(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-4">
      <div className="max-w-4xl mx-auto">
        <DebugAuth />
        <div className="flex justify-center mt-8">
          <Card className="w-full max-w-md bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-white">
            {isSignUp ? 'Create Account' : 'Sign In'}
          </CardTitle>
          <p className="text-slate-400">
            {isSignUp ? 'Join NSV Highway Monitoring' : 'Welcome back to NSV Highway Monitoring'}
          </p>
        </CardHeader>
        <CardContent>
          {/* Google Login Button */}
          <Button
            type="button"
            className="w-full bg-white text-gray-900 border border-gray-300 hover:bg-gray-100 flex items-center justify-center mb-4"
            onClick={async () => {
              setLoading(true);
              setError(null);
              const redirectUrl = window.location.origin + '/auth/callback';
              console.log('OAuth redirect URL:', redirectUrl);
              
              const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                  redirectTo: redirectUrl,
                  queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                  },
                },
              });
              
              console.log('OAuth response:', { data, error });
              if (error) {
                setError(error.message);
                setLoading(false);
              } else {
                // The OAuth flow will redirect, so we don't need to handle the response here
                console.log('OAuth initiated successfully');
              }
            }}
            disabled={loading}
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5 mr-2" />
            Sign in with Google
          </Button>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="bg-slate-700/50 border-slate-600 text-white"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="bg-slate-700/50 border-slate-600 text-white"
                required
              />
            </div>

            {error && (
              <div className="bg-red-600/20 border border-red-600/50 text-red-400 p-3 rounded">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-slate-400 hover:text-white text-sm"
              >
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;