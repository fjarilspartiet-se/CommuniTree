// src/routes/(protected)/+layout.server.ts
import { protectRoute } from '$lib/server/guards';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
  protectRoute(event);
  return {};
};
