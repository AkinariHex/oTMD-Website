import { validateApiKey } from '@/lib/auth';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const auth = await validateApiKey(request);
    if (auth.error) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }

    return NextResponse.json({ user: auth.user.ID }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    console.error('API key validation failed');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
