<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { m } from '#lib/paraglide/messages.js';
  import { deLocalizeHref, localizeHref } from '#lib/paraglide/runtime.js';

  type Slot = { name: string; href: string; icon: string; external: boolean };

  // Drawn on the same 16 × 16 grid as the illustrations: straight and 45° lines only.
  const slots: Slot[] = $derived([
    {
      name: m.nav_home(),
      href: localizeHref('/'),
      icon: 'M2 8 8 2l6 6M3.5 6.5V14h9V6.5M6.5 14v-4h3v4',
      external: false,
    },
    {
      name: m.nav_projects(),
      href: localizeHref('/projects/'),
      icon: 'M2 3.5h4.5L8 5h6v8.5H2zM4.5 8h7M4.5 10.5h4.5',
      external: false,
    },
    { name: m.nav_discord(), href: '/discord', icon: 'M2 2.5h12V11H7l-3 3v-3H2zM5.5 6.5h.5M10 6.5h.5', external: true },
    {
      name: m.nav_github(),
      href: '/github',
      icon: 'M4.5 4.5v7M11.5 4.5v1L8 9H4.5M3 1.5h3v3H3zM3 11.5h3v3H3zM10 1.5h3v3h-3z',
      external: true,
    },
  ]);

  const path = $derived(deLocalizeHref(page.url.pathname));
  const currentSlot = $derived(path === '/' ? 0 : path.startsWith('/projects/') ? 1 : -1);

  // Number keys pick a slot, as in the game. Typing in a field or holding a modifier never triggers it.
  function pickSlot(event: KeyboardEvent) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.target instanceof Element && event.target.closest('input, textarea, select, [contenteditable]')) return;
    const slot = slots[Number(event.key) - 1];
    if (!slot) return;
    if (slot.external) location.assign(slot.href);
    else goto(slot.href);
  }
</script>

<svelte:window onkeydown={pickSlot} />

<nav aria-label={m.nav_label()}>
  {#each slots as slot, index (slot.href)}
    {@const current = index === currentSlot}
    <a href={slot.href} class={{ current }} aria-current={current ? 'page' : undefined} aria-label={slot.name}>
      <span class="key" aria-hidden="true">{index + 1}</span>
      <svg width="24" height="24" viewBox="0 0 16 16" aria-hidden="true"><path d={slot.icon} /></svg>
      <span class="name" aria-hidden="true">{slot.name}</span>
    </a>
  {/each}
</nav>

<style>
  nav {
    position: fixed;
    z-index: 10;
    left: 50%;
    bottom: 20px;
    transform: translateX(-50%);
    display: flex;
    gap: 2px;
    padding: 5px;
    border-radius: 14px;
    background: color-mix(in srgb, var(--card) 92%, transparent);
    box-shadow:
      0 0 0 1px var(--line),
      0 12px 32px -12px #00000040;
    backdrop-filter: blur(8px);
  }

  a {
    position: relative;
    width: 48px;
    height: 48px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--muted);
  }

  a:hover,
  a:focus-visible {
    color: var(--ink);
    background: var(--line);
  }

  a.current {
    color: var(--ink);
    background: var(--line);
  }

  a.current::after {
    content: '';
    position: absolute;
    bottom: 5px;
    left: 50%;
    width: 14px;
    height: 2px;
    margin-left: -7px;
    border-radius: 1px;
    background: var(--blue);
  }

  .key {
    position: absolute;
    left: 6px;
    top: 4px;
    font-size: 10px;
    font-weight: 600;
    line-height: 1;
    color: var(--muted);
  }

  path {
    fill: none;
    stroke: currentColor;
    stroke-width: 1.333;
    stroke-linecap: square;
  }

  .name {
    position: absolute;
    bottom: calc(100% + 10px);
    left: 50%;
    transform: translateX(-50%);
    padding: 5px 10px;
    border-radius: 7px;
    background: var(--ink);
    color: var(--paper);
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.15s;
  }

  a:hover .name,
  a:focus-visible .name {
    opacity: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    .name {
      transition: none;
    }
  }
</style>
