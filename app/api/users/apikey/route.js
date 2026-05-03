import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/config/supabaseClient';
import generateApiKey from 'generate-api-key';

const randomString = (length = 32) => {
  let chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:<>?,./';

  let str = '';
  for (let i = 0; i < length; i++) {
    str += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return str;
};

export async function POST(request) {
  try {
    const { userId, uuid } = await request.json();

    let newAPI = generateApiKey({
      method: 'uuidv5',
      name: randomString(),
      namespace: uuid,
      prefix: userId,
    });

    const { data, error } = await supabaseAdmin
      .from('users')
      .update({
        api_key: newAPI,
      })
      .eq('ID', userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, api_key: newAPI });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { userId } = await request.json();

    const { data, error } = await supabaseAdmin
      .from('users')
      .update({
        api_key: null,
      })
      .eq('ID', userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}