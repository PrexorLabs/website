<script lang="ts">
  import '#lib/theme.css';
  import { onNavigate } from '$app/navigation';
  import Footer from '#lib/Footer.svelte';
  import Header from '#lib/Header.svelte';
  import Hotbar from '#lib/Hotbar.svelte';
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
</svelte:head>

<Header />
<main>
  {@render children()}
</main>
<Footer />
<Hotbar />

<style>
  main {
    min-height: calc(100vh - 76px);
  }
</style>
