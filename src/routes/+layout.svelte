<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import '../app.css';
  import '$lib/i18n';
  import { page } from '$app/stores';
  import LogoutButton from '$lib/components/LogoutButton.svelte';
  import { _, isLoading } from 'svelte-i18n';
</script>

<div class="min-h-screen">
  {#if $isLoading}
    <div class="flex items-center justify-center min-h-screen">
      <p class="text-lg text-muted-foreground">Loading...</p>
    </div>
  {:else}
    {#if $page.data.user}
      <nav class="border-b px-4 py-2">
        <div class="container mx-auto flex items-center justify-between">
          <a href="/" class="text-lg font-semibold">
            CommuniTree
          </a>
          
          <div class="flex items-center gap-4">
            <span>{$page.data.user.username}</span>
            <LogoutButton />
          </div>
        </div>
      </nav>
    {/if}

    <main class="container mx-auto py-6">
      <slot />
    </main>
  {/if}
</div>
