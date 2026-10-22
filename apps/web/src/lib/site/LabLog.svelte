<script lang="ts">
  import { describe, type LabEvent, type LabLiveMessage } from '@prexorlabs/lab';
  import { onMount } from 'svelte';
  import { SvelteSet } from 'svelte/reactivity';
  import { labFeedUrl, senderOf } from '#lib/lab.js';
  import { m } from '#lib/paraglide/messages.js';
  import { getLocale } from '#lib/paraglide/runtime.js';

  let { events, projects, project }: { events: LabEvent[]; projects: Record<string, string>; project?: string } =
    $props();

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
    const filter = project ? `&project=${project}` : '';
    let socket: WebSocket;
    let retry: ReturnType<typeof setTimeout> | undefined;
    let dropped = false;

    async function refresh() {
      const response = await fetch(`/api/lab/v1/events?limit=${limit}${filter}`, { cache: 'no-store' }).catch(
        () => null,
      );
      if (response?.ok) fresh = (await response.json()).events;
    }

    // A changed event takes the place of the shown one and a new one goes in by date; the log keeps its length.
    function apply(message: LabLiveMessage) {
      if ('hidden' in message) {
        fresh = shown.filter((event) => event.id !== message.hidden);
        return;
      }
      if (project && message.event.project !== project) return;
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
</script>

<div class="log" role="log">
  {#each shown as event (event.id)}
    {@const from = senderOf(event)}
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

<style>
  .log {
    display: flex;
    flex-direction: column;
    gap: 2px;
    font-family: var(--font-mono);
    font-size: 15px;
    line-height: 30px;
    overflow-wrap: anywhere;
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

  a {
    text-decoration: none;
  }

  a:hover {
    color: var(--color-accent);
  }

  @keyframes arrive {
    from {
      background: color-mix(in srgb, var(--color-accent) 18%, transparent);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .arrived {
      animation: none;
    }
  }
</style>
