import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

const OSU_USER_LOOKUP = /^[\w \[\]-]{1,32}$/;

export async function GET(request, { params }) {
  try {
    const session = await getToken({ req: request });

    if (!session?.access_token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = decodeURIComponent(params.user_id);

    if (!OSU_USER_LOOKUP.test(user)) {
      return NextResponse.json({ error: 'Invalid user' }, { status: 400 });
    }

    const data = await fetch(`https://osu.ppy.sh/api/v2/users/${encodeURIComponent(user)}/osu`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      cache: 'no-store',
    }).then((res) => res.json());

    return NextResponse.json(data);
  } catch {
    console.error('Error fetching osu user');
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}
