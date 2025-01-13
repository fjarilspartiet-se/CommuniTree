import type { LayoutServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ url, locals }) => {
  // Check if the requested path exists in our routes
  const validRoutes = [
    '/',
    '/login',
    '/register',
    '/communities',
    '/profile',
    '/admin'
    // Add other valid routes here
  ];

  if (!validRoutes.some(route => url.pathname.startsWith(route))) {
    throw error(404, {
      message: 'Page not found'
    });
  }

  return {
    user: locals.user
  };
};
