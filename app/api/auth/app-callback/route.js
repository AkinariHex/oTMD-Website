import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

// Used exclusively by the Electron app after login.
// The app opens: /api/auth/signin/osu?callbackUrl=%2Fapi%2Fauth%2Fapp-callback
// NextAuth completes OAuth, then lands here with a valid session,
// which we forward to the app via the otmd:// custom protocol.

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.access_token) {
      return NextResponse.redirect(new URL('/', process.env.NEXTAUTH_URL));
    }

    const params = new URLSearchParams({
      access_token: session.access_token || '',
      refresh_token: session.refresh_token || '',
      user_id: String(session.id || ''),
      username: session.username || '',
    });

    const deepLink = `otmd://auth?${params.toString()}`;
    const isDev = process.env.NODE_ENV === 'development';

    if (isDev) {
      const html = `<!DOCTYPE html>
<html>
<head>
  <title>OAuth Callback — Dev Mode</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; padding: 2rem; max-width: 600px; margin: 0 auto; background: #0d1117; color: #e6edf3; }
    h1 { color: #ff66aa; }
    .box { background: #161b22; border: 1px solid #30363d; padding: 1rem; border-radius: 8px; word-break: break-all; margin: 1rem 0; }
    .box strong { display: block; margin-bottom: 0.4rem; color: #8b949e; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; }
    pre { background: #0d1117; color: #79c0ff; padding: 0.8rem; border-radius: 6px; overflow-x: auto; font-size: 0.78rem; margin: 0.4rem 0 0; white-space: pre-wrap; }
    .actions { display: flex; gap: 0.6rem; margin-top: 1.5rem; flex-wrap: wrap; }
    button { background: #ff66aa; color: white; border: none; padding: 0.5rem 1.2rem; border-radius: 6px; cursor: pointer; font-size: 0.9rem; }
    button:hover { background: #e0559a; }
    button.secondary { background: #21262d; border: 1px solid #30363d; color: #e6edf3; }
    button.secondary:hover { background: #30363d; }
    small { color: #8b949e; }
  </style>
</head>
<body>
  <h1>✓ OAuth Successful!</h1>
  <p><strong>Development mode</strong> — automatic <code>otmd://</code> redirect is skipped.<br/>
  Use the buttons below to open the app or copy the deep link.</p>
  <div class="box"><strong>Logged in as</strong>${session.username} (ID: ${session.id})</div>
  <div class="box"><strong>Access Token</strong><pre>${session.access_token}</pre></div>
  <div class="box"><strong>Refresh Token</strong><pre>${session.refresh_token || 'N/A'}</pre></div>
  <div class="actions">
    <button onclick="window.location.href='${deepLink}'">Open in App</button>
    <button class="secondary" onclick="navigator.clipboard.writeText('${deepLink}').then(()=>{this.textContent='Copied!';setTimeout(()=>this.textContent='Copy Deep Link',2000)})">Copy Deep Link</button>
  </div>
  <p><small>If "Open in App" doesn't work, make sure the Electron app is running so the <code>otmd://</code> protocol is registered.</small></p>
</body>
</html>`;
      return new Response(html, { headers: { 'Content-Type': 'text/html' } });
    }

    return NextResponse.redirect(deepLink);
  } catch (error) {
    console.error('App callback error:', error);
    return NextResponse.redirect(new URL('/', process.env.NEXTAUTH_URL));
  }
}
