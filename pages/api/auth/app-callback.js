import { getServerSession } from 'next-auth/next';
import { authOptions } from './[...nextauth]';

export default async function handler(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions);

    if (session?.access_token) {
      const params = new URLSearchParams({
        access_token: session.access_token || '',
        refresh_token: session.refresh_token || '',
        user_id: session.id || '',
        username: session.username || '',
      });

      const redirectUrl = `otmd://auth?${params.toString()}`;
      return res.redirect(redirectUrl);
    }

    return res.redirect('/');
  } catch (error) {
    console.error('App callback error:', error);
    return res.redirect('/');
  }
}