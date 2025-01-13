<script lang="ts">
  import { cn } from '$lib/utils';
  import type { HTMLAttributes } from 'svelte/elements';

  type Variant = 'default' | 'destructive';

  let className: HTMLAttributes<HTMLDivElement>['class'] = undefined;
  export { className as class };
  export let variant: Variant = 'default';
</script>

<div
  role="alert"
  class={cn(
    'relative w-full rounded-lg border p-4',
    {
      'bg-background text-foreground': variant === 'default',
      'border-destructive/50 text-destructive dark:border-destructive': variant === 'destructive'
    },
    className
  )}
  {...$$restProps}
>
  <slot />
</div>
