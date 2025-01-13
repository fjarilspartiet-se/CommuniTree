<!-- src/lib/components/LanguageSwitcher.svelte -->
<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { locale } from 'svelte-i18n';
  import { Button } from './ui/button';

  function toggleLocale() {
    $locale = $locale === 'en' ? 'sv' : 'en';
  }
</script>

<Button
  variant="ghost"
  size="sm"
  on:click={toggleLocale}
>
  {$locale === 'en' ? 'Svenska' : 'English'}
</Button>
