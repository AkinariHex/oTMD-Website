import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const authorization = request.headers.get('authorization');

  try {
    const data = await fetch(`https://osu.ppy.sh/api/v2/users/${params.user_id}/osu`, {
      method: 'GET',
      headers: {
        Authorization: authorization,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }).then((res) => res.json());

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching osu user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}
