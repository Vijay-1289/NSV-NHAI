export const handler = async (event, context) => {
  console.log('Function called with method:', event.httpMethod);
  console.log('Full event:', JSON.stringify(event, null, 2));
  
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      },
      body: '',
    };
  }

  // Check for different OAuth parameters
  const { code, error, state } = event.queryStringParameters || {};
  
  console.log('Auth callback received with code:', code ? 'present' : 'missing');
  console.log('Auth callback received with error:', error || 'none');
  console.log('Auth callback received with state:', state || 'none');
  console.log('Query parameters:', event.queryStringParameters);
  
  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error);
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: `OAuth error: ${error}` }),
    };
  }
  
  if (!code) {
    console.error('No code parameter found in query string');
    console.log('Available parameters:', Object.keys(event.queryStringParameters || {}));
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        error: 'Missing code parameter',
        availableParams: Object.keys(event.queryStringParameters || {}),
        queryString: event.queryStringParameters
      }),
    };
  }

  try {
    // Exchange code for session with Supabase
    const response = await fetch(`${process.env.VITE_SUPABASE_URL}/auth/v1/token?grant_type=pkce`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        code,
        redirect_uri: process.env.SUPABASE_REDIRECT_URI || `${process.env.URL}/.netlify/functions/auth-callback`,
      }),
    });

    const data = await response.json();
    
    console.log('Supabase response status:', response.status);
    console.log('Supabase response data keys:', Object.keys(data));
    console.log('Has access_token:', !!data.access_token);
    console.log('Has refresh_token:', !!data.refresh_token);

    if (!data.access_token) {
      console.error('Failed to exchange code for session:', data);
      return {
        statusCode: 401,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Failed to exchange code for session', details: data }),
      };
    }

    // Set cookies with session data - using non-HttpOnly for client-side access
    const cookies = [
      `sb-access-token=${data.access_token}; Path=/; Secure; SameSite=Lax; Max-Age=3600`,
      `sb-refresh-token=${data.refresh_token}; Path=/; Secure; SameSite=Lax; Max-Age=604800`,
    ];

    console.log('Setting cookies:', cookies);

    return {
      statusCode: 302,
      headers: {
        'Set-Cookie': cookies,
        'Location': '/',
        'Access-Control-Allow-Origin': '*',
      },
      body: '',
    };
  } catch (error) {
    console.error('Error in auth callback:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
}; 