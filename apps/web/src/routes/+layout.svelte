<script lang="ts">
  import '@prexorlabs/tokens/tokens.css';
  import '#lib/ui/fonts.css';
  import { m } from '#lib/paraglide/messages.js';
  import type { LayoutProps } from './$types';

  let { children }: LayoutProps = $props();
</script>

<svelte:head>
  <meta name="description" content={m.site_description()} />
</svelte:head>

{@render children()}

<style>
  :global(body) {
    margin: 0;
    background: var(--color-background);
    color: var(--color-text);
    font-family: var(--font-sans);
    font-size: var(--font-size-body);
    -webkit-font-smoothing: antialiased;
  }

  :global(:focus-visible) {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  :global(a) {
    color: inherit;
  }
</style>
