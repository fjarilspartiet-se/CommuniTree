<script lang="ts">
  import RequireAuth from '$lib/components/guards/RequireAuth.svelte';
</script>

<RequireAuth requireAdmin>
  <!-- Admin content here -->
</RequireAuth>
