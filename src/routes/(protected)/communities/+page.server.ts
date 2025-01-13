// src/routes/(protected)/communities/+page.server.ts
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { communities } from '$lib/db/schema';

export const load: PageServerLoad = async () => {
  const userCommunities = await db.select().from(communities);
  return {
    communities: userCommunities
  };
};
