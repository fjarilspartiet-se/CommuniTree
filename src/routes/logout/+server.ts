// src/routes/logout/+server.ts
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { lucia } from '$lib/server/auth';

export const POST: RequestHandler = async ({ locals }) => {
  if (!locals.session) {
    throw redirect(302, '/');
  }

  await lucia.invalidateSession(locals.session.id);
  const sessionCookie = lucia.createBlankSessionCookie();
  
  return new Response(null, {
    status: 302,
    headers: {
      'Set-Cookie': sessionCookie.serialize(),
      Location: '/login'
    }
  });
};
