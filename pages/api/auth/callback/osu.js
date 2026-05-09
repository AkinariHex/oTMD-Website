import { getServerSession } from 'next-auth/next';
import { authOptions } from '../[...nextauth]';

export default async function handler(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions);
    const isApp = req.query.app === 'true';

    if (session?.access_token) {
      if (isApp) {
        const params = new URLSearchParams({
          access_token: session.access_token || '',
          refresh_token: session.refresh_token || '',
          user_id: session.id || '',
          username: session.username || '',
        });

        const isDev = process.env.NODE_ENV === 'development';
        
        if (isDev) {
          const html = `
            <!DOCTYPE html>
            <html>
            <head>
              <title>OAuth Callback - Development Mode</title>
              <style>
                body { font-family: system-ui, sans-serif; padding: 2rem; max-width: 600px; margin: 0 auto; }
                .token-box { background: #f5f5f5; padding: 1rem; border-radius: 8px; word-break: break-all; margin: 1rem 0; }
                button { background: #ff66aa; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; }
                pre { background: #1a1a2e; color: #eee; padding: 1rem; border-radius: 8px; overflow-x: auto; }
              </style>
            </head>
            <body>
              <h1>OAuth Successful!</h1>
              <p>Development mode: Copy these tokens manually</p>
              <div class="token-box">
                <strong>Access Token:</strong><br/>
                <pre>${session.access_token}</pre>
              </div>
              <div class="token-box">
                <strong>Refresh Token:</strong><br/>
                <pre>${session.refresh_token || 'N/A'}</pre>
              </div>
              <div class="token-box">
                <strong>User ID:</strong> ${session.id}<br/>
                <strong>Username:</strong> ${session.username}
              </div>
              <button onclick="navigator.clipboard.writeText('otmd://auth?${params.toString()}')">Copy Deep Link</button>
              <p><small>Or open the Electron app and try again - the protocol handler should be registered when the app is running.</small></p>
            </body>
            </html>
          `;
          return res.send(html);
        }

        const redirectUrl = `otmd://auth?${params.toString()}`;
        return res.redirect(redirectUrl);
      }

      return res.redirect('/hub');
    }

    return res.redirect('/');
  } catch (error) {
    console.error('Callback error:', error);
    return res.redirect('/');
  }
}