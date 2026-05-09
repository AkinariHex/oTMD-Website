import { supabaseAdmin } from '@/config/supabaseClient';
import NextAuth from 'next-auth';
import { v4 as uuidv4 } from 'uuid';

const postUserDBsupabase = async (profile) => {
  try {
    const { error } = await supabaseAdmin.from('users').insert([
      {
        ID: profile.id,
        username: profile.username || 'Unknown',
        UUID: uuidv4(),
        permissions: 'User',
        discord: profile.discord || null,
        twitter: profile.twitter || null,
        country: profile.country ? JSON.stringify(profile.country) : null,
        discordChannelsMatch: '[]',
        dateJoin: Math.floor(new Date().getTime() / 1000.0),
      },
    ]);

    if (error) {
      console.log('Post user error:', error);
    }
  } catch (e) {
    console.log('Post user exception:', e);
  }
};

const checkUserDBsupabase = async (profile) => {
  try {
    const player = await supabaseAdmin.from('users').select('*').eq('ID', profile.id);

    if (player.data && player.data.length > 0) {
      const { error } = await supabaseAdmin
        .from('users')
        .update({
          username: profile.username,
        })
        .eq('ID', profile.id);

      if (error) {
        console.log('Update user error:', error);
      }
      return;
    }
    if (player.data && player.data.length === 0) {
      return postUserDBsupabase(profile);
    }
  } catch (e) {
    console.log('Check user error:', e);
  }
};

export const authOptions = {
  providers: [
    {
      id: 'osu',
      name: 'Osu!',
      type: 'oauth',
      token: 'https://osu.ppy.sh/oauth/token',
      authorization: {
        url: 'https://osu.ppy.sh/oauth/authorize',
        params: {
          scope: 'identify public',
        },
      },
      userinfo: 'https://osu.ppy.sh/api/v2/me',
      profile(profile) {
        return {
          id: String(profile.id),
          name: profile.username || profile.name,
          image: profile.avatar_url,
          email: profile.email || null,
        };
      },
      clientId: process.env.OSU_CLIENT_ID,
      clientSecret: process.env.OSU_CLIENT_SECRET,
    },
  ],

  session: {
    strategy: 'jwt',
  },

  callbacks: {
    async session({ session, token }) {
      if (!token?.access_token) {
        return session;
      }

      const userData = await fetch(`https://osu.ppy.sh/api/v2/me`, {
        headers: {
          Authorization: `Bearer ${token.access_token}`,
        },
      }).then((res) => res.json());

      if (userData.id) {
        return {
          ...session,
          id: userData.id,
          username: userData.username,
          avatar_url: userData.avatar_url,
          access_token: token.access_token,
          refresh_token: token.refresh_token,
        };
      }

      return session;
    },
    async jwt({ token, account, profile }) {
      if (account?.access_token) {
        token.access_token = account.access_token;
        token.refresh_token = account.refresh_token;
        if (profile?.id) {
          checkUserDBsupabase(profile);
        }
      }

      return token;
    },
  },

  pages: {
    signin: '/',
  },
};

export default NextAuth(authOptions);
