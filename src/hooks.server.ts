// src/hooks.server.ts
import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';
import { locale } from 'svelte-i18n';
import { lucia } from '$lib/server/auth';

const handleAuth: Handle = async ({ event, resolve }) => {
  const sessionId = event.cookies.get(lucia.sessionCookieName);
  if (!sessionId) {
    event.locals.user = null;
    event.locals.session = null;
    return resolve(event);
  }

  const { session, user } = await lucia.validateSession(sessionId);
  if (session && session.fresh) {
    const sessionCookie = lucia.createSessionCookie(session.id);
    event.cookies.set(sessionCookie.name, sessionCookie.value, {
      path: ".",
      ...sessionCookie.attributes
    });
  }
  if (!session) {
    const sessionCookie = lucia.createBlankSessionCookie();
    event.cookies.set(sessionCookie.name, sessionCookie.value, {
      path: ".",
      ...sessionCookie.attributes
    });
  }
  event.locals.user = user;
  event.locals.session = session;
  return resolve(event);
};

// Initialize locale for SSR
const handleI18n: Handle = async ({ event, resolve }) => {
  // Get user's preferred language from header or default to 'en'
  const lang = event.request.headers.get('accept-language')?.split(',')[0] || 'en';
  locale.set(lang);
  return resolve(event);
};

export const handle = sequence(handleAuth, handleI18n);
