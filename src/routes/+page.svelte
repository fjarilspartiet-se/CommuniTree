<!-- src/routes/+page.svelte -->
<script lang="ts">
  import { _ } from 'svelte-i18n';
  import Button from '$lib/components/ui/button/index.svelte';
</script>

<div class="min-h-screen bg-background">
  <main class="container mx-auto px-4 py-16">
    <div class="max-w-3xl mx-auto text-center">
      <h1 class="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
        CommuniTree
      </h1>
      
      <p class="text-xl text-muted-foreground mb-12">
        {$_('home.tagline')}
      </p>

      <div class="space-y-4">
        <p class="text-lg mb-8">
          {$_('home.description')}
        </p>

        <div class="flex gap-4 justify-center">
          <Button href="/login" size="lg">
            {$_('home.signIn')}
          </Button>
          <Button href="/register" variant="outline" size="lg">
            {$_('home.joinNow')}
          </Button>
        </div>
      </div>

      <div class="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="p-6 rounded-lg border bg-card">
          <h3 class="text-lg font-semibold mb-2">{$_('home.features.community')}</h3>
          <p class="text-muted-foreground">{$_('home.features.communityDesc')}</p>
        </div>
        
        <div class="p-6 rounded-lg border bg-card">
          <h3 class="text-lg font-semibold mb-2">{$_('home.features.resources')}</h3>
          <p class="text-muted-foreground">{$_('home.features.resourcesDesc')}</p>
        </div>
        
        <div class="p-6 rounded-lg border bg-card">
          <h3 class="text-lg font-semibold mb-2">{$_('home.features.sustainable')}</h3>
          <p class="text-muted-foreground">{$_('home.features.sustainableDesc')}</p>
        </div>
      </div>
    </div>
  </main>
</div>
