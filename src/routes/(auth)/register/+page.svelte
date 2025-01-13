<!-- src/routes/(auth)/register/+page.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import { _ } from 'svelte-i18n';
  import { Input } from '$lib/components/ui/input';
  import { Button } from '$lib/components/ui/button';
  import { Alert, AlertDescription } from '$lib/components/ui/alert';
  
  let error: string | null = null;
</script>

<div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
  <div class="sm:mx-auto sm:w-full sm:max-w-sm">
    <h2 class="mt-10 text-center text-2xl font-bold leading-9 tracking-tight">
      {$_('auth.registerTitle')}
    </h2>
  </div>

  <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
    <form method="POST" use:enhance class="space-y-6">
      {#if error}
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      {/if}

      <div>
        <label for="username" class="block text-sm font-medium leading-6">
          {$_('auth.usernameLabel')}
        </label>
        <div class="mt-2">
          <Input 
            id="username"
            name="username"
            type="text"
            required
            class="w-full"
          />
        </div>
      </div>

      <div>
        <label for="email" class="block text-sm font-medium leading-6">
          {$_('auth.emailLabel')}
        </label>
        <div class="mt-2">
          <Input 
            id="email"
            name="email"
            type="email"
            required
            class="w-full"
          />
        </div>
      </div>

      <div>
        <label for="password" class="block text-sm font-medium leading-6">
          {$_('auth.passwordLabel')}
        </label>
        <div class="mt-2">
          <Input
            id="password"
            name="password"
            type="password"
            required
            class="w-full"
          />
        </div>
      </div>

      <Button type="submit" class="w-full">
        {$_('auth.registerButton')}
      </Button>
    </form>

    <p class="mt-10 text-center text-sm text-gray-500">
      {$_('auth.haveAccount')}
      <a href="/login" class="font-semibold leading-6 text-primary hover:text-primary/80">
        {$_('auth.loginLink')}
      </a>
    </p>
  </div>
</div>
