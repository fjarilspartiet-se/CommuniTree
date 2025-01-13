<script lang="ts">
  import { page } from '$app/stores';
  import { Button } from '$lib/components/ui/button';
  import { _ } from 'svelte-i18n';

</script>

<div class="min-h-[50vh] flex flex-col items-center justify-center">
  <div class="text-center space-y-4 max-w-md mx-auto">
    <h1 class="text-2xl font-semibold mb-2">
      {#if $page.status === 401}
        {$_('auth.sessionExpired')}
      {:else}
        {$_('error.title', { code: $page.status })}
      {/if}
    </h1>
    
    <p class="text-muted-foreground mb-6">
      {$page.error?.message}
    </p>

    <div class="flex gap-4 justify-center">
      <Button href="/login">
        {$_('auth.backToLogin')}
      </Button>
    </div>
  </div>
</div>
