// src/routes/(auth)/register/+page.server.ts
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { lucia } from '$lib/server/auth';
import { Argon2id } from 'oslo/password';
import { db } from '$lib/db';
import { users } from '$lib/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
  if (locals.user) {
    throw redirect(302, '/');
  }
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const formData = await request.formData();
    const username = formData.get('username');
    const email = formData.get('email');
    const password = formData.get('password');

    // basic validation
    if (
      typeof username !== 'string' ||
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !username ||
      !email ||
      !password
    ) {
      return fail(400, {
        message: 'Invalid input'
      });
    }

    // validate username/email format
    if (username.length < 3 || username.length > 31) {
      return fail(400, {
        message: 'Username must be between 3 and 31 characters'
      });
    }
    if (!email.includes('@')) {
      return fail(400, {
        message: 'Invalid email'
      });
    }

    try {
      // check if username/email already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .or(eq(users.email, email));

      if (existingUser.length > 0) {
        return fail(400, {
          message: 'Username or email already taken'
        });
      }

      const hashedPassword = await new Argon2id().hash(password);

      const [user] = await db
        .insert(users)
        .values({
          username,
          email,
          hashedPassword,
          role: 'USER'
        })
        .returning();

      const session = await lucia.createSession(user.id, {});
      locals.setSession(session);
    } catch (error) {
      return fail(500, {
        message: 'An unknown error occurred'
      });
    }

    throw redirect(302, '/');
  }
};
