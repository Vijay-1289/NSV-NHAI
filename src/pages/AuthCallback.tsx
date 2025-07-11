import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Processing login...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const hash = window.location.hash.substr(1); // Remove the '#'
    const params = new URLSearchParams(hash);

    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');

    if (access_token && refresh_token) {
      setStatus('Setting session...');
      supabase.auth.setSession({
        access_token,
        refresh_token,
      }).then(({ error }) => {
        if (error) {
          setError('Failed to set session: ' + error.message);
          setStatus('Login failed.');
          console.error('Supabase setSession error:', error);
        } else {
          setStatus('Session set! Redirecting to dashboard...');
          setTimeout(() => navigate('/'), 1000);
        }
      });
    } else {
      setError('Missing access or refresh token in callback URL.');
      setStatus('Login failed.');
      console.error('Missing tokens in callback URL:', { access_token, refresh_token, hash });
      setTimeout(() => navigate('/auth?error=missing_tokens'), 2000);
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">
      <div className="bg-slate-800/80 p-8 rounded shadow-lg max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">Signing you in...</h1>
        <p className="mb-2">{status}</p>
        {error && <div className="bg-red-600/20 border border-red-600/50 text-red-400 p-3 rounded mt-2">{error}</div>}
        <p className="text-xs mt-4 text-slate-400">If you are not redirected, <a href="/auth" className="underline">click here to login</a>.</p>
      </div>
    </div>
  );
};

export default AuthCallback; 