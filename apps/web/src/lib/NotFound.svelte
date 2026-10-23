<script lang="ts">
  import Drawing from '#lib/Drawing.svelte';
  import { m } from '#lib/paraglide/messages.js';
  import { localizeHref } from '#lib/paraglide/runtime.js';

  // Any other error than a missing page passes its own status and message.
  let { status = 404, message }: { status?: number; message?: string } = $props();

  const title = $derived(message ?? m.not_found_title());
</script>

<svelte:head>
  <title>{title} · PrexorLabs</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<section class="wrap">
  <span class="lens"><Drawing name="lens" size={120} /></span>
  <span class="code">{status}</span>
  <h1 class="serif">{title}</h1>
  {#if !message}<p>{m.not_found_text()}</p>{/if}
  <a class="link" href={localizeHref('/')}>{m.not_found_back()}</a>
</section>

<style>
  section {
    padding-top: 120px;
    padding-bottom: 120px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 18px;
  }

  .lens {
    transform: rotate(8deg);
    margin-bottom: 12px;
  }

  .code {
    font-variant-numeric: tabular-nums;
    color: var(--muted);
  }

  h1 {
    margin: 0;
    font-size: clamp(48px, 7vw, 88px);
    line-height: 1;
    letter-spacing: -0.03em;
  }

  p {
    margin: 0;
    max-width: 460px;
    color: var(--muted);
  }
</style>
