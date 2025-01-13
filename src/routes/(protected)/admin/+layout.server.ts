// src/routes/(protected)/admin/+layout.server.ts
import { adminOnly } from '$lib/server/guards';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
  adminOnly(event);
  return {};
};
