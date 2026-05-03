import { getServerSession } from 'next-auth/next';
import { authOptions } from './[...nextauth]';
import { redirect } from 'next/navigation';

export default async function AppCallback(req, res) {
  const session = await getServerSession(authOptions);

  if (session?.access_token) {
    const params = new URLSearchParams({
      access_token: session.access_token || '',
      refresh_token: session.refresh_token || '',
      user_id: session.id || '',
      username: session.username || '',
    });

    const redirectUrl = `otmd://auth?${params.toString()}`;
    return redirect(redirectUrl);
  }

  return redirect('/');
}