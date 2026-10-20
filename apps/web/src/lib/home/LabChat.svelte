<script lang="ts">
  import { describe, type LabEvent, type LabLiveMessage } from '@prexorlabs/lab';
  import { onMount } from 'svelte';
  import { SvelteSet } from 'svelte/reactivity';
  import { labFeedUrl } from '#lib/lab.js';
  import { m } from '#lib/paraglide/messages.js';
  import { getLocale, localizeHref } from '#lib/paraglide/runtime.js';

  let { events, projects }: { events: LabEvent[]; projects: Record<string, string> } = $props();

  let fresh = $state<LabEvent[] | null>(null);
  const shown = $derived(fresh ?? events);
  const locale = $derived(getLocale());
  const date = $derived(new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' }));

  const arrived = new SvelteSet<string>();

  // The page was built with the entries of that moment. Once it is open, it fetches what is newer and then listens for
  // changes; after a dropped connection it fetches again for what it missed. If the feed cannot be reached, the built
  // entries are still true, just not the newest, so there is nothing to show the reader.
  onMount(() => {
    const limit = events.length || 6;
    let socket: WebSocket;
    let retry: ReturnType<typeof setTimeout> | undefined;
    let dropped = false;

    async function refresh() {
      const response = await fetch(`/api/lab/v1/events?limit=${limit}`, { cache: 'no-store' }).catch(() => null);
      if (response?.ok) fresh = (await response.json()).events;
    }

    // A changed event takes the place of the shown one and a new one goes in by date; the log keeps its length.
    function apply(message: LabLiveMessage) {
      if ('hidden' in message) {
        fresh = shown.filter((event) => event.id !== message.hidden);
        return;
      }
      const rest = shown.filter((event) => event.id !== message.event.id);
      if (rest.length === shown.length) arrived.add(message.event.id);
      fresh = [message.event, ...rest].toSorted((a, b) => b.occurredAt.localeCompare(a.occurredAt)).slice(0, limit);
    }

    function listen() {
      socket = new WebSocket(`${labFeedUrl.replace(/^http/, 'ws')}/v1/live`);
      socket.onopen = () => {
        if (dropped) refresh();
      };
      socket.onmessage = ({ data }) => apply(JSON.parse(data));
      socket.onclose = () => {
        dropped = true;
        retry = setTimeout(listen, 15_000);
      };
    }

    refresh();
    listen();
    return () => {
      clearTimeout(retry);
      socket.onclose = null;
      socket.close();
    };
  });

  function sender(event: LabEvent) {
    if (event.kind === 'release') return { name: 'PrexorLabs', tone: 'release' };
    if (event.kind === 'idea') return { name: 'Ideas', tone: 'community' };
    if (event.kind === 'goal') return { name: 'Donate', tone: 'community' };
    return { name: 'Lab', tone: 'lab' };
  }
</script>

<div class="chat">
  <div class="log" role="log">
    {#each shown as event (event.id)}
      {@const from = sender(event)}
      {@const text = describe(event, locale, (event.project && projects[event.project]) || (event.project ?? ''))}
      <p class:arrived={arrived.has(event.id)}>
        <time datetime={event.occurredAt}>{date.format(new Date(event.occurredAt))}</time>
        <span class={from.tone}>[{from.name}]</span>
        {#if event.data.url}<a href={event.data.url}>{text}</a>{:else}{text}{/if}
      </p>
    {:else}
      <p class="empty">{m.lab_empty()}</p>
    {/each}
  </div>

  <div class="input" aria-hidden="true">
    <span class="prompt">&gt;</span><span class="typed">/donate</span><span class="caret"></span>
  </div>
  <nav aria-label={m.lab_commands()}>
    <a href={localizeHref('/donate/')}>/donate</a>
    <a href="/discord">/discord</a>
    <a href="/github">/github</a>
    <a href={localizeHref('/serverlistplus/')}>/serverlistplus</a>
  </nav>
</div>

<style>
  .chat {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 18px;
    border-radius: 14px;
    background: rgb(0 0 0 / 0.63);
    box-shadow: inset 0 0 0 1px var(--color-line);
    font-family: var(--font-mono);
    font-size: 15px;
    line-height: 30px;
    overflow-wrap: anywhere;
  }

  .log {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  p {
    margin: 0;
  }

  .arrived {
    animation: arrive 3s ease-out;
  }

  time,
  .empty {
    color: var(--color-text-faint);
  }

  .release {
    color: var(--color-accent);
  }

  .community {
    color: var(--color-accent-2);
  }

  .lab {
    color: var(--color-text-muted);
  }

  p a {
    text-decoration: none;
  }

  p a:hover {
    color: var(--color-accent);
  }

  .input {
    height: 44px;
    margin-top: var(--space-3);
    padding: 0 14px;
    border-radius: var(--radius-medium);
    background: var(--color-surface-1);
    box-shadow: inset 0 0 0 1px var(--color-line-strong);
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .prompt {
    color: var(--color-text-faint);
  }

  .typed {
    display: inline-block;
    width: 7ch;
    overflow: hidden;
    white-space: nowrap;
    color: var(--color-accent);
    animation: type 5s steps(7) infinite;
  }

  .caret {
    width: 2px;
    height: 18px;
    margin-left: -8px;
    background: var(--color-text);
    animation: blink 1s step-end infinite;
  }

  nav {
    margin-top: 10px;
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  nav a {
    height: 36px;
    padding: 0 12px;
    border-radius: 6px;
    background: var(--color-surface-2);
    display: inline-flex;
    align-items: center;
    font-size: var(--font-size-label);
    text-decoration: none;
    transition:
      background-color var(--duration-fast) ease,
      color var(--duration-fast) ease;
  }

  nav a:hover {
    background: var(--color-accent);
    color: var(--color-on-accent);
  }

  @keyframes type {
    0%,
    10% {
      width: 0;
    }
    30%,
    100% {
      width: 7ch;
    }
  }

  @keyframes arrive {
    from {
      background: color-mix(in srgb, var(--color-accent) 18%, transparent);
    }
  }

  @keyframes blink {
    50% {
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .typed,
    .caret,
    .arrived {
      animation: none;
    }
  }
</style>
