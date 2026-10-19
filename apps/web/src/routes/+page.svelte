<script lang="ts">
  import { page } from '$app/state';
  import Logo from '#lib/ui/Logo.svelte';
  import { m } from '#lib/paraglide/messages.js';
  import { getLocale, localizeHref } from '#lib/paraglide/runtime.js';

  const other = $derived(getLocale() === 'en' ? 'de' : 'en');
</script>

<svelte:head>
  <title>PrexorLabs</title>
</svelte:head>

<main>
  <header>
    <Logo height={28} />
    <span class="wordmark">prexor<span class="labs">labs</span></span>
    <a class="language" href={localizeHref(page.url.pathname, { locale: other })} hreflang={other} lang={other}>
      {m.language_switch()}
    </a>
  </header>

  <section>
    <span class="id">prexorlabs:home</span>
    <h1>{m.home_title()}</h1>
    <p>{m.home_status()}</p>
  </section>
</main>

<style>
  main {
    box-sizing: border-box;
    min-height: 100vh;
    max-width: 1200px;
    margin: 0 auto;
    padding: var(--space-5);
    display: flex;
    flex-direction: column;
  }

  header {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .wordmark {
    font-size: 20px;
    font-weight: 600;
    letter-spacing: -0.045em;
  }

  .labs {
    color: var(--color-accent);
  }

  .language {
    margin-left: auto;
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    font-family: var(--font-mono);
    font-size: var(--font-size-label);
    color: var(--color-text-muted);
    text-decoration: none;
  }

  .language:hover {
    color: var(--color-text);
  }

  section {
    margin: auto 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .id {
    font-family: var(--font-mono);
    font-size: var(--font-size-label);
    color: var(--color-text-faint);
  }

  h1 {
    margin: 0;
    max-width: 14ch;
    font-size: clamp(48px, 9vw, 112px);
    line-height: 0.92;
    font-weight: 600;
    letter-spacing: -0.06em;
  }

  p {
    margin: 0;
    font-size: 18px;
    color: var(--color-text-muted);
  }
</style>
