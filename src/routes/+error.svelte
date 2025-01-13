<!-- src/routes/+error.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  import { _ } from 'svelte-i18n';
  import Button from '$lib/components/ui/button/index.svelte';
</script>

<div class="min-h-[50vh] flex flex-col items-center justify-center">
  <div class="text-center space-y-4">
    <h1 class="text-4xl font-bold mb-4">
      {$_('error.title', { values: { code: $page.status } })}
    </h1>
    
    <p class="text-xl text-muted-foreground mb-8">
      {#if $page.status === 404}
        {$_('error.notFound')}
      {:else if $page.status === 403}
        {$_('error.forbidden')}
      {:else if $page.status === 401}
        {$_('error.unauthorized')}
      {:else}
        {$_('error.unknown')}
      {/if}
    </p>

    <p class="text-sm text-muted-foreground mb-8">
      {$page.error?.message}
    </p>

    <div class="flex gap-4 justify-center">
      <Button onclick={() => history.back()}>
        {$_('error.goBack')}
      </Button>
      <Button href="/" variant="outline">
        {$_('error.goHome')}
      </Button>
    </div>
  </div>
</div>
