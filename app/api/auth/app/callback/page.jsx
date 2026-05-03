'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

export default function AppCallback() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated' && session?.access_token) {
      const params = new URLSearchParams({
        access_token: session.access_token || '',
        refresh_token: session.refresh_token || '',
        user_id: session.id || '',
        username: session.username || '',
      });

      window.location.href = `otmd://auth?${params.toString()}`;
    }
  }, [session, status]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: '#1a1a2e',
      color: '#fff',
      fontFamily: 'sans-serif',
    }}>
      <h1>Authenticating...</h1>
      <p>Please wait while we complete the authentication</p>
    </div>
  );
}