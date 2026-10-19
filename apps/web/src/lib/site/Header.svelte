<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import Icon from '#lib/ui/Icon.svelte';
  import type { IconName } from '#lib/ui/icons.js';
  import Logo from '#lib/ui/Logo.svelte';
  import { m } from '#lib/paraglide/messages.js';
  import { deLocalizeHref, getLocale, localizeHref } from '#lib/paraglide/runtime.js';

  let { namespace }: { namespace: string } = $props();

  type Slot = { icon: IconName; name: string; href: string; external: boolean; phone: boolean };

  const slots: Slot[] = $derived([
    { icon: 'home', name: m.nav_home(), href: localizeHref('/'), external: false, phone: true },
    { icon: 'projects', name: m.nav_projects(), href: localizeHref('/serverlistplus/'), external: false, phone: true },
    { icon: 'lab', name: m.nav_lab(), href: localizeHref('/lab/'), external: false, phone: true },
    { icon: 'heart', name: m.nav_donate(), href: localizeHref('/donate/'), external: false, phone: true },
    { icon: 'discord', name: 'Discord', href: '/discord', external: true, phone: true },
    { icon: 'github', name: 'GitHub', href: '/github', external: true, phone: false },
  ]);

  const path = $derived(deLocalizeHref(page.url.pathname));
  const locale = $derived(getLocale());

  function isCurrent(slot: Slot) {
    if (slot.external) return false;
    const target = deLocalizeHref(slot.href);
    return target === '/' ? path === '/' : path.startsWith(target);
  }

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

<header>
  <div class="bar">
    <a class="brand" href={localizeHref('/')} aria-label={m.home_link()}>
      <Logo height={24} />
      <span class="wordmark">prexor<span class="labs">labs</span></span>
    </a>
    <span class="namespace">{namespace}</span>

    <nav class="hotbar" aria-label={m.nav_label()}>
      {#each slots as slot, index (slot.icon)}
        <a
          href={slot.href}
          class={['slot', { current: isCurrent(slot), desktop: !slot.phone, donate: slot.icon === 'heart' }]}
          aria-current={isCurrent(slot) ? 'page' : undefined}
          aria-label={slot.name}
        >
          <span class="key" aria-hidden="true">{index + 1}</span>
          <Icon name={slot.icon} size={20} />
          <span class="name" aria-hidden="true">{slot.name}</span>
        </a>
      {/each}
    </nav>

    <nav class="language" aria-label={m.language_label()}>
      <a href={localizeHref(path, { locale: 'en' })} hreflang="en" lang="en" aria-current={locale === 'en'}>EN</a>
      <span aria-hidden="true">/</span>
      <a href={localizeHref(path, { locale: 'de' })} hreflang="de" lang="de" aria-current={locale === 'de'}>DE</a>
    </nav>
  </div>
</header>

<style>
  header {
    border-bottom: 1px solid var(--color-surface-2);
  }

  .bar {
    box-sizing: border-box;
    max-width: 1240px;
    height: 76px;
    margin: 0 auto;
    padding: 0 var(--space-5);
    display: flex;
    align-items: center;
    gap: var(--space-5);
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
    height: 44px;
    text-decoration: none;
  }

  .wordmark {
    font-size: 19px;
    font-weight: 600;
    letter-spacing: -0.045em;
  }

  .labs {
    color: var(--color-accent);
  }

  .namespace {
    flex: 1;
    font-family: var(--font-mono);
    font-size: var(--font-size-small);
    color: var(--color-text-faint);
  }

  /* Like the game's hotbar: it floats at the bottom of the screen and stays there while the page scrolls. */
  .hotbar {
    position: fixed;
    left: 50%;
    bottom: var(--space-4);
    z-index: 20;
    translate: -50% 0;
    display: flex;
    gap: var(--space-1);
    padding: 6px;
    border-radius: 14px;
    background: color-mix(in srgb, var(--color-surface-1) 94%, transparent);
    box-shadow:
      inset 0 0 0 1px var(--color-line),
      0 20px 40px -12px #000;
  }

  .slot {
    position: relative;
    box-sizing: border-box;
    width: 48px;
    height: 48px;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-muted);
    text-decoration: none;
    box-shadow: inset 0 0 0 1px var(--color-line);
    transition:
      background-color var(--duration-fast) ease,
      box-shadow var(--duration-fast) ease;
  }

  .slot.donate {
    color: var(--color-accent-2);
  }

  .slot:hover,
  .slot:focus-visible,
  .slot.current {
    background: var(--color-surface-3);
    box-shadow: inset 0 0 0 2px var(--color-text);
  }

  .slot.current:not(.donate) {
    color: var(--color-accent);
  }

  .key {
    position: absolute;
    left: 5px;
    top: 3px;
    font-family: var(--font-mono);
    font-size: 9px;
    color: var(--color-text-faint);
  }

  .name {
    position: absolute;
    bottom: calc(100% + 8px);
    left: 50%;
    z-index: 10;
    translate: -50% 0;
    padding: 4px 8px;
    border-radius: 6px;
    background: var(--color-surface-2);
    box-shadow: inset 0 0 0 1px var(--color-line-strong);
    color: var(--color-text);
    font-size: var(--font-size-small);
    font-weight: 500;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity var(--duration-fast) ease;
  }

  .slot:hover .name,
  .slot:focus-visible .name {
    opacity: 1;
  }

  .language {
    display: flex;
    align-items: center;
    font-family: var(--font-mono);
    font-size: var(--font-size-label);
    color: var(--color-line-strong);
  }

  .language a {
    min-width: 36px;
    height: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-faint);
    text-decoration: none;
  }

  .language a:hover,
  .language a[aria-current='true'] {
    color: var(--color-text);
  }

  /* On a phone the hotbar becomes the tab bar at the bottom of the screen, with names under the icons. */
  @media (max-width: 720px) {
    .namespace {
      display: none;
    }

    .language {
      margin-left: auto;
    }

    .hotbar {
      left: 0;
      right: 0;
      bottom: 0;
      translate: none;
      z-index: 20;
      padding: 6px 6px calc(6px + env(safe-area-inset-bottom));
      border-radius: 0;
      box-shadow: 0 -1px 0 var(--color-line);
    }

    .slot {
      flex: 1;
      height: 56px;
      flex-direction: column;
      gap: var(--space-1);
      box-shadow: none;
    }

    .slot.desktop,
    .key {
      display: none;
    }

    .name {
      position: static;
      translate: none;
      padding: 0;
      background: none;
      box-shadow: none;
      font-size: 11px;
      opacity: 1;
    }
  }
</style>
