<script lang="ts">
  import Crafting from '#lib/home/Crafting.svelte';
  import Inventory from '#lib/home/Inventory.svelte';
  import LabChat from '#lib/home/LabChat.svelte';
  import { m } from '#lib/paraglide/messages.js';
  import { localizeHref } from '#lib/paraglide/runtime.js';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();
</script>

<svelte:head>
  <title>PrexorLabs · {m.home_title_before()}{m.home_title_lab()}{m.home_title_after()}</title>
</svelte:head>

<section class="hero" aria-labelledby="home-title">
  <h1 id="home-title">{m.home_title_before()}<span class="lab">{m.home_title_lab()}</span>{m.home_title_after()}</h1>
  <p>{m.home_intro()}</p>
</section>

<section class="wrap inventory" aria-label={m.inventory_label()}>
  <Inventory items={data.inventory} />
</section>

<section class="wrap crafting" aria-labelledby="crafting-title">
  <Crafting />
</section>

<section class="wrap lab-feed" aria-labelledby="lab-title">
  <div class="lab-head">
    <h2 id="lab-title">{m.lab_title()}</h2>
    <a href={localizeHref('/lab/')}>{m.lab_all()} →</a>
  </div>
  <LabChat events={data.events} projects={data.projects} />
</section>

<style>
  .wrap,
  .hero {
    box-sizing: border-box;
    max-width: 1240px;
    margin: 0 auto;
    padding-left: var(--space-5);
    padding-right: var(--space-5);
  }

  .hero {
    padding-top: 72px;
    padding-bottom: 40px;
    display: grid;
    grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
    align-items: end;
    gap: var(--space-5) 48px;
  }

  h1 {
    margin: 0;
    font-size: clamp(52px, 8vw, 104px);
    line-height: 0.9;
    font-weight: 600;
    letter-spacing: -0.06em;
  }

  .lab {
    color: var(--color-accent);
  }

  .hero p {
    margin: 0;
    font-size: 17px;
    line-height: 1.55;
    color: var(--color-text-muted);
  }

  .inventory {
    padding-bottom: 96px;
  }

  .crafting {
    padding-bottom: 112px;
  }

  .lab-feed {
    padding-bottom: 72px;
  }

  .lab-head {
    margin-bottom: 22px;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: baseline;
    gap: var(--space-3);
  }

  h2 {
    margin: 0;
    font-size: clamp(32px, 4vw, 44px);
    font-weight: 600;
    letter-spacing: -0.04em;
  }

  .lab-head a {
    font-family: var(--font-mono);
    font-size: var(--font-size-label);
    color: var(--color-accent);
    text-decoration: none;
  }

  @media (max-width: 720px) {
    .hero {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
