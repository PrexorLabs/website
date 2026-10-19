<!-- Stands in for the pages that are built later (milestone M5), so every link in the hotbar already leads somewhere. -->
<script lang="ts">
  import Button from '#lib/ui/Button.svelte';
  import { m } from '#lib/paraglide/messages.js';
  import { localizeHref } from '#lib/paraglide/runtime.js';
</script>

<svelte:head>
  <title>{m.in_the_lab_title()} · PrexorLabs</title>
</svelte:head>

<section>
  <h1>{m.in_the_lab_title()}</h1>
  <p>{m.in_the_lab_text()}</p>
  <Button href={localizeHref('/')} variant="primary">{m.in_the_lab_back()}</Button>
</section>

<style>
  section {
    box-sizing: border-box;
    max-width: 1240px;
    margin: 0 auto;
    padding: 96px var(--space-5);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }

  h1 {
    margin: 0;
    font-size: clamp(40px, 6vw, 72px);
    line-height: 1;
    font-weight: 600;
    letter-spacing: -0.05em;
  }

  p {
    margin: 0;
    max-width: 520px;
    font-size: 17px;
    line-height: 1.55;
    color: var(--color-text-muted);
  }
</style>
