<script lang="ts">
  import { page } from '$app/state';
  import Button from '#lib/ui/Button.svelte';
  import { m } from '#lib/paraglide/messages.js';
  import { localizeHref } from '#lib/paraglide/runtime.js';

  // Every page is built ahead, so almost any error here is an address that does not exist.
  const missing = $derived(page.status === 404);
</script>

<svelte:head>
  <title>{missing ? m.not_found_title() : page.error?.message} · PrexorLabs</title>
</svelte:head>

<section>
  <div class="slot" aria-hidden="true"><span>0</span></div>
  <span class="code">{page.status} · minecraft:air</span>
  <h1>{missing ? m.not_found_title() : page.error?.message}</h1>
  {#if missing}<p>{m.not_found_text()}</p>{/if}
  <div class="actions">
    <Button href={localizeHref('/')} variant="primary">{m.in_the_lab_back()}</Button>
    <Button href={localizeHref('/lab/')}>{m.lab_title()}</Button>
  </div>
</section>

<style>
  section {
    box-sizing: border-box;
    padding: 96px var(--space-5);
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 22px;
  }

  .slot {
    position: relative;
    width: 120px;
    height: 120px;
    border-radius: 18px;
    background: var(--color-surface-1);
    box-shadow: inset 0 0 0 2px var(--color-text);
    animation: hover 3s ease-in-out infinite;
  }

  .slot span {
    position: absolute;
    right: 10px;
    bottom: 6px;
    font-family: var(--font-mono);
    font-size: 15px;
    color: var(--color-text-faint);
  }

  .code {
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--color-text-faint);
  }

  h1 {
    margin: 0;
    font-size: clamp(40px, 6vw, 72px);
    line-height: 1;
    font-weight: 600;
    letter-spacing: -0.05em;
  }

  p {
    margin: 0;
    max-width: 440px;
    font-size: 17px;
    line-height: 1.55;
    color: var(--color-text-muted);
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
  }

  @keyframes hover {
    50% {
      transform: translateY(-6px);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .slot {
      animation: none;
    }
  }
</style>
