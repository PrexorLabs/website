<script lang="ts">
  import '@prexorlabs/tokens/tokens.css';
  import '#lib/ui/fonts.css';
  import geist from '#lib/ui/fonts/geist.woff2?url';
  import { onNavigate } from '$app/navigation';
  import { page } from '$app/state';
  import Footer from '#lib/site/Footer.svelte';
  import Header from '#lib/site/Header.svelte';
  import { m } from '#lib/paraglide/messages.js';
  import type { LayoutProps } from './$types';

  let { children }: LayoutProps = $props();

  // Cross-fades between pages where the browser supports it; elsewhere the router swaps them without one.
  onNavigate((navigation) => {
    if (!document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    return new Promise((resolve) => {
      document.startViewTransition(async () => {
        resolve();
        await navigation.complete;
      });
    });
  });
</script>

<svelte:head>
  <meta name="description" content={m.site_description()} />
  <!-- The headline is the largest element on most pages; loading its font early keeps it from painting twice. -->
  <link rel="preload" href={geist} as="font" type="font/woff2" crossorigin="anonymous" />
</svelte:head>

<Header namespace={page.data.namespace} />
<main>
  {@render children()}
</main>
<Footer />

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

  main {
    min-height: calc(100vh - 77px);
  }
</style>
