// src/lib/components/LogoutButton.svelte
<script lang="ts">
  import { goto } from '$app/navigation';
  import { _ } from 'svelte-i18n';
  import Button from '$lib/components/ui/button/index.svelte';
  
  let isLoading = false;

  async function handleLogout() {
    isLoading = true;
    try {
      const response = await fetch('/logout', {
        method: 'POST'
      });
      if (response.ok) {
        goto('/login');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      isLoading = false;
    }
  }
</script>

<Button
  variant="ghost"
  on:click={handleLogout}
  disabled={isLoading}
>
  {$_('auth.logout')}
</Button>
