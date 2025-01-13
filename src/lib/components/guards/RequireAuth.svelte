<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  
  export let requireAdmin = false;
  export let requireModerator = false;

  onMount(() => {
    if (!$page.data.user) {
      goto(`/login?redirectTo=${window.location.pathname}`);
      return;
    }

    if (requireAdmin && $page.data.user.role !== 'ADMIN') {
      goto('/');
      return;
    }

    if (requireModerator && !['ADMIN', 'MODERATOR'].includes($page.data.user.role)) {
      goto('/');
      return;
    }
  });
</script>

<slot />
