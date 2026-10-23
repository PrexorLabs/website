<script lang="ts">
  import { m } from '#lib/paraglide/messages.js';

  const sections = $derived([
    { title: m.privacy_controller_title(), text: m.privacy_controller_text() },
    { title: m.privacy_hosting_title(), text: m.privacy_hosting_text() },
    { title: m.privacy_storage_title(), text: m.privacy_storage_text() },
    { title: m.privacy_links_title(), text: m.privacy_links_text() },
    { title: m.privacy_mail_title(), text: m.privacy_mail_text() },
    { title: m.privacy_rights_title(), text: m.privacy_rights_text() },
  ]);
</script>

<svelte:head>
  <title>{m.privacy_title()} · PrexorLabs</title>
</svelte:head>

<article class="wrap">
  <h1 class="serif">{m.privacy_title()}</h1>
  <p class="intro">{m.privacy_intro()}</p>
  {#each sections as section (section.title)}
    <h2>{section.title}</h2>
    <p>{section.text}</p>
  {/each}
</article>

<style>
  article {
    max-width: 760px;
    padding-top: 72px;
    padding-bottom: 96px;
  }

  h1 {
    margin: 0 0 24px;
    font-size: 64px;
    line-height: 1;
    letter-spacing: -0.03em;
  }

  .intro {
    font-size: 20px;
    color: var(--muted);
  }

  h2 {
    margin: 36px 0 8px;
    font-size: 17px;
    font-weight: 600;
  }

  p {
    margin: 0;
  }
</style>
