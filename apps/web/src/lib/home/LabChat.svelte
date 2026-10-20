<script lang="ts">
  import type { LabEvent } from '@prexorlabs/lab';
  import LabLog from '#lib/site/LabLog.svelte';
  import { m } from '#lib/paraglide/messages.js';
  import { localizeHref } from '#lib/paraglide/runtime.js';

  let { events, projects }: { events: LabEvent[]; projects: Record<string, string> } = $props();
</script>

<div class="chat">
  <LabLog {events} {projects} />

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
