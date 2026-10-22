<script lang="ts">
  import { describe, type LabEvent } from '@prexorlabs/lab';
  import { SvelteMap } from 'svelte/reactivity';
  import Icon from '#lib/ui/Icon.svelte';
  import type { IconName } from '#lib/ui/icons.js';
  import { labPageSize, senderOf } from '#lib/lab.js';
  import { m } from '#lib/paraglide/messages.js';
  import { getLocale, localizeHref } from '#lib/paraglide/runtime.js';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();

  type Filter = 'all' | 'release' | 'post' | 'idea' | 'goal';
  type Listing = { events: LabEvent[]; complete: boolean };

  const filters: { id: Filter; icon: IconName; name: () => string }[] = [
    { id: 'all', icon: 'projects', name: m.lab_filter_all },
    { id: 'release', icon: 'download', name: m.lab_filter_release },
    { id: 'post', icon: 'feedback', name: m.lab_filter_post },
    { id: 'idea', icon: 'idea', name: m.lab_filter_idea },
    { id: 'goal', icon: 'heart', name: m.lab_filter_goal },
  ];

  let filter = $state<Filter>('all');
  let loading = $state(false);
  let unreachable = $state(false);
  // What the browser fetched itself; the built page only carries the newest entries of every kind together.
  const fetched = new SvelteMap<Filter, Listing>();
  const listing = $derived(
    fetched.get(filter) ??
      (filter === 'all' ? { events: data.events, complete: data.events.length < labPageSize } : undefined),
  );

  const locale = $derived(getLocale());
  const date = $derived(new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' }));
  const month = $derived(new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }));

  const months = $derived.by(() => {
    const months: { name: string; events: LabEvent[] }[] = [];
    for (const event of listing?.events ?? []) {
      const name = month.format(new Date(event.occurredAt));
      const last = months.at(-1);
      if (last?.name === name) last.events.push(event);
      else months.push({ name, events: [event] });
    }
    return months;
  });

  // Ideas are discussed on Discord and goals belong to the donate page; other entries link to where they came from.
  function linkOf(event: LabEvent): string | undefined {
    if (event.data.url) return event.data.url;
    if (event.kind === 'idea') return '/discord';
    if (event.kind === 'goal') return localizeHref('/donate/');
  }

  async function show(next: Filter) {
    filter = next;
    unreachable = false;
    if (!listing) await fetchOlder();
  }

  async function fetchOlder() {
    const kind = filter;
    const shown = listing?.events ?? [];
    const oldest = shown.at(-1);
    const query = new URLSearchParams({
      limit: String(labPageSize),
      ...(kind !== 'all' && { kind }),
      ...(oldest && { before: oldest.occurredAt }),
    });

    loading = true;
    const response = await fetch(`/api/lab/v1/events?${query}`).catch(() => null);
    loading = false;
    if (!response?.ok) {
      unreachable = true;
      return;
    }
    const { events } = (await response.json()) as { events: LabEvent[] };
    fetched.set(kind, { events: [...shown, ...events], complete: events.length < labPageSize });
  }
</script>

<svelte:head>
  <title>{m.lab_title()} · PrexorLabs</title>
  <link rel="alternate" type="application/atom+xml" title="PrexorLabs" href="/lab.xml" />
  <link rel="alternate" type="application/feed+json" title="PrexorLabs" href="/lab.json" />
</svelte:head>

<section class="wrap hero" aria-labelledby="lab-title">
  <div class="intro">
    <h1 id="lab-title">{m.lab_page_before()}<span>{m.lab_page_lab()}</span>{m.lab_page_after()}</h1>
    <p>{m.lab_intro()}</p>
  </div>
  <nav class="feeds" aria-label={m.lab_feeds_label()}>
    <a href="/lab.xml{locale === 'de' ? '?lang=de' : ''}">/lab.xml (Atom)</a>
    <a href="/lab.json{locale === 'de' ? '?lang=de' : ''}">/lab.json</a>
  </nav>
</section>

<section class="wrap">
  <div class="filters" role="group" aria-label={m.lab_filter_label()}>
    {#each filters as option (option.id)}
      <button type="button" aria-pressed={filter === option.id} onclick={() => show(option.id)}>
        <Icon name={option.icon} />{option.name()}
      </button>
    {/each}
  </div>

  <div class="list" aria-busy={loading}>
    {#each months as group (group.name)}
      <h2>{group.name}</h2>
      {#each group.events as event (event.id)}
        {@const from = senderOf(event)}
        {@const href = linkOf(event)}
        {@const text = describe(
          event,
          locale,
          (event.project && data.projects[event.project]) || (event.project ?? ''),
        )}
        <svelte:element this={href ? 'a' : 'div'} {href} class="entry">
          <time datetime={event.occurredAt}>{date.format(new Date(event.occurredAt))}</time>
          <span class="sender {from.tone}">[{from.name}]</span>
          <span class="text">{text}</span>
          {#if href}<span class="arrow" aria-hidden="true">→</span>{/if}
        </svelte:element>
      {/each}
    {:else}
      {#if listing}<p class="note">{m.lab_none()}</p>{/if}
    {/each}
    {#if unreachable}<p class="note" role="status">{m.lab_unreachable()}</p>{/if}
  </div>

  {#if listing && !listing.complete}
    <button type="button" class="older" disabled={loading} onclick={fetchOlder}>{m.lab_older()}</button>
  {/if}
</section>

<style>
  .wrap {
    box-sizing: border-box;
    max-width: 1240px;
    margin: 0 auto;
    padding: 0 var(--space-5) 72px;
  }

  .hero {
    padding-top: 72px;
    padding-bottom: 40px;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: flex-end;
    gap: 24px;
  }

  .intro {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  h1 {
    margin: 0;
    max-width: 7em;
    font-size: clamp(52px, 8vw, 104px);
    line-height: 0.9;
    font-weight: 600;
    letter-spacing: -0.06em;
  }

  h1 span {
    color: var(--color-accent);
  }

  .intro p {
    margin: 0;
    max-width: 520px;
    font-size: 17px;
    line-height: 1.55;
    color: var(--color-text-muted);
  }

  .feeds {
    display: flex;
    gap: 18px;
    font-family: var(--font-mono);
    font-size: 13px;
  }

  .feeds a {
    color: var(--color-text-muted);
    text-decoration: none;
  }

  .feeds a:hover {
    color: var(--color-accent);
  }

  .filters {
    display: flex;
    gap: 4px;
    overflow-x: auto;
    border-bottom: 2px solid var(--color-surface-2);
  }

  .filters button {
    all: unset;
    box-sizing: border-box;
    flex: none;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    height: 44px;
    padding: 0 16px;
    border-radius: 10px 10px 0 0;
    font-size: 14px;
    font-weight: 500;
    color: var(--color-text-muted);
    cursor: pointer;
    transition: background var(--duration-fast);
  }

  .filters button:hover,
  .filters [aria-pressed='true'] {
    background: var(--color-surface-2);
  }

  .filters [aria-pressed='true'] {
    color: var(--color-text);
    box-shadow: inset 0 2px 0 var(--color-accent);
  }

  .filters button:focus-visible {
    outline-offset: -2px;
  }

  .list {
    display: flex;
    flex-direction: column;
    padding-top: 14px;
    font-size: 15px;
  }

  h2 {
    margin: 18px 18px 6px;
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 400;
    color: var(--color-text-faint);
  }

  .entry {
    display: grid;
    grid-template-columns: 120px 120px minmax(0, 1fr) auto;
    align-items: baseline;
    gap: 16px;
    padding: 14px 18px;
    border-radius: 10px;
    text-decoration: none;
    transition: background var(--duration-fast);
  }

  a.entry:hover {
    background: var(--color-surface-1);
  }

  time,
  .sender {
    font-family: var(--font-mono);
    font-size: 13px;
  }

  time,
  .arrow,
  .note {
    color: var(--color-text-faint);
  }

  .text {
    line-height: 23px;
    overflow-wrap: anywhere;
  }

  .release {
    color: var(--color-accent);
  }

  .community {
    color: var(--color-accent-2);
  }

  .lab {
    color: var(--color-text);
  }

  .note {
    margin: 24px 18px;
  }

  .older {
    all: unset;
    box-sizing: border-box;
    margin-top: 18px;
    display: inline-flex;
    align-items: center;
    height: 44px;
    padding: 0 18px;
    border-radius: var(--radius-medium);
    background: var(--color-surface-2);
    box-shadow: inset 0 0 0 1px var(--color-line-strong);
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
  }

  .older:hover {
    background: var(--color-surface-3);
  }

  .older:disabled {
    color: var(--color-text-faint);
    cursor: progress;
  }

  @media (max-width: 720px) {
    .entry {
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 4px 12px;
    }

    time {
      grid-column: 1 / -1;
    }
  }
</style>
