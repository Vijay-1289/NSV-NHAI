import React, { useState, useEffect } from 'react';
import { supabase, setSessionFromCookies } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DebugAuth = () => {
  const [session, setSession] = useState<any>(null);
  const [cookies, setCookies] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const checkSession = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    setSession(session);
    setLoading(false);
  };

  const checkCookies = () => {
    const allCookies = document.cookie;
    setCookies(allCookies);
  };

  const testSetSessionFromCookies = async () => {
    setLoading(true);
    const result = await setSessionFromCookies();
    console.log('setSessionFromCookies result:', result);
    await checkSession();
    setLoading(false);
  };

  const clearCookies = () => {
    document.cookie = 'sb-access-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'sb-refresh-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    checkCookies();
  };

  useEffect(() => {
    checkSession();
    checkCookies();
  }, []);

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Auth Debug Panel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={checkSession} disabled={loading}>
              Check Session
            </Button>
            <Button onClick={checkCookies}>
              Check Cookies
            </Button>
            <Button onClick={testSetSessionFromCookies} disabled={loading}>
              Set Session from Cookies
            </Button>
            <Button onClick={clearCookies} variant="destructive">
              Clear Cookies
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Current Session:</h3>
              <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                {session ? JSON.stringify(session, null, 2) : 'No session'}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold mb-2">All Cookies:</h3>
              <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                {cookies || 'No cookies'}
              </pre>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Supabase Auth State:</h3>
            <div className="bg-gray-100 p-2 rounded">
              <p>User: {session?.user?.email || 'Not signed in'}</p>
              <p>Access Token: {session?.access_token ? 'Present' : 'Missing'}</p>
              <p>Refresh Token: {session?.refresh_token ? 'Present' : 'Missing'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DebugAuth; 