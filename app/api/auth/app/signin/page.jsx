'use client';

import { signIn, useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function AppSignIn() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/api/auth/app/callback';

  useEffect(() => {
    if (status === 'authenticated') {
      const params = new URLSearchParams({
        access_token: session.access_token || '',
        refresh_token: session.refresh_token || '',
        user_id: session.id || '',
        username: session.username || '',
      });

      window.location.href = `otmd://auth?${params.toString()}`;
    } else if (status === 'unauthenticated') {
      signIn('osu', { callbackUrl });
    }
  }, [session, status, callbackUrl]);

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
      <h1>Authenticating with osu!...</h1>
      <p>You will be redirected to the o!TMD desktop app</p>
    </div>
  );
}