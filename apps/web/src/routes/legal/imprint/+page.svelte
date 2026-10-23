<script lang="ts">
  import { m } from '#lib/paraglide/messages.js';

  // The same in both languages, so it stays out of the message files.
  const provider = {
    name: '[NAME]',
    street: '[STREET AND NUMBER]',
    city: '[POSTCODE AND CITY]',
    country: 'Deutschland',
  };
</script>

<svelte:head>
  <title>{m.imprint_title()} · PrexorLabs</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<article class="wrap">
  <h1 class="serif">{m.imprint_title()}</h1>
  <h2>{m.imprint_provider()}</h2>
  <p>{provider.name}<br />{provider.street}<br />{provider.city}<br />{provider.country}</p>
  <h2>{m.imprint_contact()}</h2>
  <p><a class="link" href="mailto:contact@prexorlabs.dev">contact@prexorlabs.dev</a></p>
  <h2>{m.imprint_responsible()}</h2>
  <p>{provider.name}, {provider.street}, {provider.city}</p>
  <p class="note">{m.imprint_disclaimer()}</p>
</article>

<style>
  article {
    max-width: 760px;
    padding-top: 72px;
    padding-bottom: 96px;
  }

  h1 {
    margin: 0 0 40px;
    font-size: 64px;
    line-height: 1;
    letter-spacing: -0.03em;
  }

  h2 {
    margin: 32px 0 8px;
    font-size: 17px;
    font-weight: 600;
  }

  p {
    margin: 0;
  }

  .note {
    margin-top: 40px;
    color: var(--muted);
  }
</style>
