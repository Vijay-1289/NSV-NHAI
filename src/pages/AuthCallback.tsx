import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash.substr(1); // Remove the '#'
    const params = new URLSearchParams(hash);

    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');

    if (access_token && refresh_token) {
      supabase.auth.setSession({
        access_token,
        refresh_token,
      }).then(() => {
        navigate('/'); // Redirect to home/dashboard
      });
    } else {
      // Handle error
      navigate('/auth?error=missing_tokens');
    }
  }, [navigate]);

  return <div>Signing you in...</div>;
};

export default AuthCallback; 