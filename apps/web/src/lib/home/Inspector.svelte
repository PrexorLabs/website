<script lang="ts">
  import type { InventoryItem } from '#lib/inventory.js';
  import Button from '#lib/ui/Button.svelte';
  import Icon from '#lib/ui/Icon.svelte';
  import { m } from '#lib/paraglide/messages.js';

  let { item, open, onclose }: { item: InventoryItem; open: boolean; onclose: () => void } = $props();

  let closeButton: HTMLButtonElement | undefined = $state();

  // On a phone the inspector slides up over the page; the focus follows it so the keyboard and screen readers land
  // in the sheet, and the inventory gets it back on close.
  $effect(() => {
    if (open) closeButton?.focus();
  });
</script>

<svelte:window onkeydown={(event) => open && event.key === 'Escape' && onclose()} />

<aside class={['inspector', item.kind, { open }]} aria-label={m.inspector_label()} aria-live="polite">
  <button type="button" class="close" bind:this={closeButton} onclick={onclose}>{m.inspector_close()}</button>
  <div class="head">
    <div class="icon"><Icon name={item.icon} size={44} stroke={1.3} /></div>
    <div class="title">
      <span class="namespaced">{item.namespaced}</span>
      <h2>{item.name}</h2>
      <span class="lore">{item.lore}</span>
    </div>
  </div>
  <p>{item.description}</p>
  {#if item.stats.length}
    <dl>
      {#each item.stats as stat (stat.label)}
        <dt>{stat.label}</dt>
        <dd>{stat.value}</dd>
      {/each}
    </dl>
  {/if}
  <div class="links">
    {#each item.links as link (link.href)}
      <Button href={link.href} variant={link.primary ? 'primary' : 'secondary'}>{link.label}</Button>
    {/each}
  </div>
</aside>

<style>
  .inspector {
    flex: 1 1 360px;
    min-width: 0;
    box-sizing: border-box;
    padding: var(--space-5);
    border-radius: var(--radius-x-large);
    background: var(--color-surface-1);
    box-shadow: inset 0 0 0 1px color-mix(in srgb, currentColor 35%, transparent);
    color: var(--color-text-faint);
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .project {
    color: var(--color-accent);
  }

  .support {
    color: var(--color-accent-2);
  }

  .community {
    color: var(--color-text);
  }

  .close {
    display: none;
  }

  .head {
    display: flex;
    align-items: center;
    gap: 18px;
  }

  .icon {
    flex: none;
    width: 88px;
    height: 88px;
    border-radius: 14px;
    background: var(--color-surface-2);
    box-shadow: inset 0 0 0 1px var(--color-surface-4);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .title {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .namespaced {
    font-family: var(--font-mono);
    font-size: var(--font-size-small);
    color: var(--color-text-faint);
  }

  h2 {
    margin: 0;
    font-size: 30px;
    line-height: 34px;
    font-weight: 600;
    letter-spacing: -0.03em;
  }

  .experiment h2 {
    color: var(--color-text-muted);
  }

  .lore,
  p {
    color: var(--color-text-muted);
  }

  .lore {
    font-size: 14px;
  }

  p {
    margin: 0;
    font-size: 15px;
    line-height: 23px;
  }

  dl {
    margin: 0;
    display: grid;
    grid-template-columns: 110px minmax(0, 1fr);
    gap: var(--space-2) var(--space-3);
    font-family: var(--font-mono);
    font-size: var(--font-size-small);
  }

  dt {
    color: var(--color-text-faint);
  }

  dd {
    margin: 0;
    color: var(--color-text);
  }

  .links {
    margin-top: auto;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  @media (max-width: 720px) {
    .inspector {
      position: fixed;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 30;
      max-height: 85vh;
      overflow-y: auto;
      border-radius: 18px 18px 0 0;
      padding: 20px 20px calc(20px + env(safe-area-inset-bottom));
      translate: 0 110%;
      visibility: hidden;
      transition:
        translate var(--duration-slow) cubic-bezier(0.2, 0.8, 0.2, 1),
        visibility 0s var(--duration-slow);
    }

    .inspector.open {
      translate: 0 0;
      visibility: visible;
      transition: translate var(--duration-slow) cubic-bezier(0.2, 0.8, 0.2, 1);
    }

    .close {
      align-self: flex-end;
      display: inline-flex;
      align-items: center;
      height: 36px;
      padding: 0 12px;
      border: 0;
      border-radius: var(--radius-medium);
      background: var(--color-surface-2);
      box-shadow: inset 0 0 0 1px var(--color-line-strong);
      color: var(--color-text);
      font: inherit;
      font-size: var(--font-size-label);
      cursor: pointer;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .inspector,
    .inspector.open {
      transition: none;
    }
  }
</style>
