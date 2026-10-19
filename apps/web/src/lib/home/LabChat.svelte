<script lang="ts">
  import type { LabEvent } from '@prexorlabs/lab';
  import { m } from '#lib/paraglide/messages.js';
  import { getLocale, localizeHref } from '#lib/paraglide/runtime.js';

  let { events, projects }: { events: LabEvent[]; projects: Record<string, string> } = $props();

  const platforms = { modrinth: 'Modrinth', curseforge: 'CurseForge', github: 'GitHub' };
  const date = $derived(new Intl.DateTimeFormat(getLocale(), { day: 'numeric', month: 'short', year: 'numeric' }));

  function sender(event: LabEvent) {
    if (event.kind === 'release') return { name: 'PrexorLabs', tone: 'release' };
    if (event.kind === 'idea') return { name: 'Ideas', tone: 'community' };
    if (event.kind === 'goal') return { name: 'Donate', tone: 'community' };
    return { name: 'Lab', tone: 'lab' };
  }

  function line(event: LabEvent) {
    const project = (event.project && projects[event.project]) ?? event.project ?? '';
    switch (event.kind) {
      case 'release':
        return m.lab_release({
          project,
          version: event.data.version ?? '',
          platform: platforms[event.data.platform ?? 'modrinth'],
        });
      case 'idea':
        return m.lab_idea({ title: event.data.title ?? '' });
      case 'goal':
        return m.lab_goal({ goal: event.data.goal ?? '' });
      case 'unlocked':
        return m.lab_unlocked({ project });
      case 'post':
      case 'teaser':
        return event.text?.[getLocale()] ?? '';
    }
  }
</script>

<div class="chat">
  {#each events as event (event.id)}
    {@const from = sender(event)}
    <p>
      <time datetime={event.occurredAt}>{date.format(new Date(event.occurredAt))}</time>
      <span class={from.tone}>[{from.name}]</span>
      {#if event.data.url}<a href={event.data.url}>{line(event)}</a>{:else}{line(event)}{/if}
    </p>
  {:else}
    <p class="empty">{m.lab_empty()}</p>
  {/each}

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

  p {
    margin: 0;
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

  @keyframes blink {
    50% {
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .typed,
    .caret {
      animation: none;
    }
  }
</style>
