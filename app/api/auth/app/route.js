import { NextResponse } from 'next/server';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const access_token = searchParams.get('access_token');
  const refresh_token = searchParams.get('refresh_token');
  const user_id = searchParams.get('user_id');
  const username = searchParams.get('username');

  if (access_token) {
    const redirectUrl = `otmd://auth?access_token=${encodeURIComponent(access_token)}&refresh_token=${encodeURIComponent(refresh_token || '')}&user_id=${encodeURIComponent(user_id || '')}&username=${encodeURIComponent(username || '')}`;
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.redirect('/');
}