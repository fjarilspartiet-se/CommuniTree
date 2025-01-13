// src/lib/server/guards.ts
import { error, redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

export function protectRoute(event: RequestEvent) {
  if (!event.locals.user) {
    throw error(401, {
      message: 'You must be logged in to view this page'
    });
  }
}

export function adminOnly(event: RequestEvent) {
  protectRoute(event);
  if (event.locals.user?.role !== 'ADMIN') {
    throw error(403, {
      message: 'This page is only accessible to administrators'
    });
  }
}

export function moderatorAndAbove(event: RequestEvent) {
  protectRoute(event);
  if (!['ADMIN', 'MODERATOR'].includes(event.locals.user?.role ?? '')) {
    throw error(403, {
      message: 'This page is only accessible to moderators and administrators'
    });
  }
}
