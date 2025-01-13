// src/routes/(auth)/login/+page.server.ts
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { lucia } from '$lib/server/auth';
import { Argon2id } from 'oslo/password';
import { db } from '$lib/server/db';
import { users } from '$lib/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals, url }) => {
  if (locals.user) {
    throw redirect(302, '/');
  }
  
  return {
    redirectTo: url.searchParams.get('redirectTo') ?? '/'
  };
};

export const actions: Actions = {
  default: async ({ request, locals, url }) => {
    const formData = await request.formData();
    const email = formData.get('email');
    const password = formData.get('password');
    const redirectTo = url.searchParams.get('redirectTo') ?? '/';

    // basic validation
    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !email ||
      !password
    ) {
      return fail(400, {
        message: 'Invalid input'
      });
    }

    try {
      const result = await db.select().from(users).where(eq(users.email, email));
      const user = result[0];

      if (!user) {
        return fail(400, {
          message: 'Invalid email or password'
        });
      }

      const validPassword = await new Argon2id().verify(
        user.hashedPassword,
        password
      );

      if (!validPassword) {
        return fail(400, {
          message: 'Invalid email or password'
        });
      }

      const session = await lucia.createSession(user.id, {});
      locals.setSession(session);
      throw redirect(302, redirectTo);
    } catch (error) {
      return fail(500, {
        message: 'An unknown error occurred'
      });
    }

    throw redirect(302, '/');
  }
};
