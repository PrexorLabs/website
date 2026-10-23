<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { m } from '#lib/paraglide/messages.js';
  import { deLocalizeHref, getLocale, localizeHref } from '#lib/paraglide/runtime.js';

  const other = $derived(getLocale() === 'de' ? 'en' : 'de');

  // Starts out null: before hydration the button cannot know which theme the CSS picked.
  let dark = $state<boolean | null>(null);

  onMount(() => {
    const chosen = document.documentElement.dataset.theme;
    dark = chosen ? chosen === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  });

  function toggleTheme() {
    dark = !dark;
    const theme = dark ? 'dark' : 'light';
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('theme', theme);
    } catch {
      // Storage can be blocked; the theme then holds for this visit only.
    }
  }
</script>

<header class="wrap">
  <a class="mark serif" href={localizeHref('/')} aria-label={m.home_link()}>PrexorLabs</a>
  <div class="tools">
    <a class="link" href="/github">GitHub</a>
    <a
      class="link"
      href={localizeHref(deLocalizeHref(page.url.pathname), { locale: other })}
      hreflang={other}
      lang={other}
      aria-label={m.other_language_label()}>{m.other_language()}</a
    >
    {#if dark !== null}
      <button type="button" onclick={toggleTheme} aria-label={dark ? m.theme_to_light() : m.theme_to_dark()}>
        <svg width="20" height="20" viewBox="0 0 16 16" aria-hidden="true">
          {#if dark}
            <path
              d="M5.5 5.5h5v5h-5zM8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.5 1.5M11.5 11.5 13 13M3 13l1.5-1.5M11.5 4.5 13 3"
            />
          {:else}
            <path d="M13.5 10A6 6 0 0 1 6 2.5 6 6 0 1 0 13.5 10z" />
          {/if}
        </svg>
      </button>
    {/if}
  </div>
</header>

<style>
  header {
    height: 76px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
  }

  .mark {
    font-size: 24px;
    letter-spacing: -0.01em;
    text-decoration: none;
  }

  .tools {
    display: flex;
    align-items: center;
    gap: 20px;
    font-size: 15px;
  }

  button {
    all: unset;
    box-sizing: border-box;
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--muted);
    cursor: pointer;
  }

  button:hover {
    color: var(--ink);
    background: var(--line);
  }

  button:focus-visible {
    outline: 2px solid var(--ink);
  }

  path {
    fill: none;
    stroke: currentColor;
    stroke-width: 1.333;
    stroke-linecap: square;
  }
</style>
