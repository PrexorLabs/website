<script lang="ts">
  import LabLog from '#lib/site/LabLog.svelte';
  import Button from '#lib/ui/Button.svelte';
  import Icon from '#lib/ui/Icon.svelte';
  import { m } from '#lib/paraglide/messages.js';
  import { getLocale, localizeHref } from '#lib/paraglide/runtime.js';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();

  const locale = $derived(getLocale());
  const date = $derived(new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' }));

  // Modrinth only answers for a project once it is approved; until then the lab feed has no stats for it and the
  // downloads are on GitHub.
  const onModrinth = $derived(data.stats !== null);

  function range(versions: string[] = []): string | undefined {
    return versions.length > 1 ? `${versions[0]} – ${versions.at(-1)}` : versions[0];
  }

  // A fact the feed does not know yet is left out rather than shown empty.
  const facts = $derived(
    [
      { label: m.slp_fact_version(), value: data.stats?.version ?? data.releases[0]?.data.version },
      { label: m.slp_fact_minecraft(), value: range(data.stats?.gameVersions) },
      { label: m.slp_fact_loader(), value: 'Fabric, NeoForge' },
      {
        label: m.slp_fact_downloads(),
        value: data.stats?.downloads == null ? undefined : new Intl.NumberFormat(locale).format(data.stats.downloads),
      },
      { label: m.slp_fact_license(), value: 'MIT' },
    ].filter((fact) => fact.value),
  );

  const shots = $derived([
    { file: 'server-list', alt: m.slp_shot_list() },
    { file: 'search', alt: m.slp_shot_search() },
    { file: 'settings', alt: m.slp_shot_settings() },
  ]);
</script>

<svelte:head>
  <title>ServerListPlus · PrexorLabs</title>
</svelte:head>

<section class="wrap hero" aria-labelledby="slp-title">
  <div class="slot"><Icon name="serverList" size={72} stroke={1.2} /></div>
  <div class="intro">
    <div class="status">
      <span class="experiment">{m.slp_experiment()}</span>
      {#if !onModrinth}<span class="review">{m.slp_in_review()}</span>{/if}
    </div>
    <h1 id="slp-title">ServerListPlus</h1>
    <p>{m.slp_intro()}</p>
    <ul aria-label={m.slp_features_label()}>
      <li>{m.slp_feature_folders()}</li>
      <li>{m.slp_feature_search()}</li>
      <li>{m.slp_feature_notes()}</li>
    </ul>
    <div class="actions">
      {#if onModrinth}
        <Button href="https://modrinth.com/mod/server-list-plus" variant="primary">{m.slp_get_modrinth()}</Button>
      {:else}
        <Button href="https://github.com/PrexorLabs/ServerListPlus/releases" variant="primary">
          {m.slp_get_github()}
        </Button>
      {/if}
      <Button href="https://www.curseforge.com/minecraft/mc-mods/serverlistplus">CurseForge</Button>
      <Button href="https://github.com/PrexorLabs/ServerListPlus">{m.slp_source()}</Button>
    </div>
  </div>
</section>

<section class="wrap facts" aria-label={m.slp_facts_label()}>
  <dl>
    {#each facts as fact (fact.label)}
      <div>
        <dt>{fact.label}</dt>
        <dd>{fact.value}</dd>
      </div>
    {/each}
  </dl>
  <p class="note">{m.slp_facts_source()}</p>
</section>

<section class="wrap shots" aria-labelledby="shots-title">
  <h2 id="shots-title">{m.slp_shots_title()}</h2>
  <div class="grid">
    {#each shots as shot (shot.file)}
      <img
        src="/images/serverlistplus/{shot.file}-1280.avif"
        srcset="/images/serverlistplus/{shot.file}-640.avif 640w, /images/serverlistplus/{shot.file}-1280.avif 1280w"
        sizes="(max-width: 720px) 100vw, 800px"
        width="1280"
        height="720"
        loading="lazy"
        decoding="async"
        alt={shot.alt}
      />
    {/each}
  </div>
</section>

<section class="wrap columns">
  <div class="column" aria-labelledby="versions-title">
    <h2 id="versions-title">{m.slp_versions_title()}</h2>
    <div class="table">
      <table>
        <thead>
          <tr>
            <th scope="col">{m.slp_fact_version()}</th>
            <th scope="col">{m.slp_fact_minecraft()}</th>
            <th scope="col">{m.slp_released()}</th>
          </tr>
        </thead>
        <tbody>
          {#each data.releases as release (release.id)}
            <tr>
              <td class="mono"><a href={release.data.url}>{release.data.version}</a></td>
              <td class="mono muted">{range(release.data.gameVersions) ?? '–'}</td>
              <td class="muted"
                ><time datetime={release.occurredAt}>{date.format(new Date(release.occurredAt))}</time></td
              >
            </tr>
          {:else}
            <tr><td colspan="3" class="muted">{m.slp_versions_empty()}</td></tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>

  <div class="column" aria-labelledby="slp-lab-title">
    <div class="head">
      <h2 id="slp-lab-title">{m.slp_lab_title()}</h2>
      <a href={localizeHref('/lab/')}>{m.lab_all()} →</a>
    </div>
    <div class="chat">
      <LabLog events={data.events} projects={{ serverlistplus: 'ServerListPlus' }} project="serverlistplus" />
    </div>
  </div>
</section>

<section class="wrap">
  <div class="support">
    <div class="support-text">
      <span class="support-icon"><Icon name="heart" size={26} stroke={1.4} /></span>
      <div>
        <h2>{m.slp_donate_title()}</h2>
        <p>{m.slp_donate_text()}</p>
      </div>
    </div>
    <Button href={localizeHref('/donate/')} variant="primary">{m.nav_donate()}</Button>
  </div>
</section>

<style>
  .wrap {
    box-sizing: border-box;
    max-width: 1240px;
    margin: 0 auto;
    padding: 0 var(--space-5) 96px;
  }

  .hero {
    padding-top: 72px;
    padding-bottom: 56px;
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: 40px 56px;
  }

  .slot {
    flex: none;
    width: 168px;
    height: 168px;
    border-radius: 22px;
    background: var(--color-surface-2);
    box-shadow:
      inset 0 0 0 2px var(--color-accent),
      0 30px 60px -30px color-mix(in srgb, var(--color-accent) 33%, transparent);
    color: var(--color-accent);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .intro {
    flex: 1 1 420px;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .status {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    font-family: var(--font-mono);
  }

  .experiment {
    font-size: 13px;
    color: var(--color-text-faint);
  }

  .review {
    height: 26px;
    padding: 0 10px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--color-warn) 10%, transparent);
    color: var(--color-warn);
    font-size: 12px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .review::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }

  h1 {
    margin: 0;
    font-size: clamp(48px, 7vw, 96px);
    line-height: 0.9;
    font-weight: 600;
    letter-spacing: -0.06em;
    color: var(--color-accent);
  }

  .intro p {
    margin: 0;
    max-width: 560px;
    font-size: 18px;
    line-height: 1.55;
    color: var(--color-text-muted);
  }

  ul {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-family: var(--font-mono);
    font-size: 14px;
    color: var(--color-accent-2);
  }

  li::before {
    content: '+ ';
  }

  .actions {
    margin-top: 6px;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .facts {
    padding-bottom: 72px;
  }

  dl {
    margin: 0;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 1px;
    border-radius: 12px;
    overflow: hidden;
    background: var(--color-line);
    box-shadow: 0 0 0 1px var(--color-line);
  }

  dl div {
    padding: 18px 20px;
    background: var(--color-background);
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  dt {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--color-text-faint);
  }

  dd {
    margin: 0;
    font-size: 17px;
    font-weight: 500;
  }

  .note {
    margin: 10px 0 0;
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--color-text-faint);
  }

  h2 {
    margin: 0;
    font-size: clamp(30px, 3.6vw, 44px);
    font-weight: 600;
    letter-spacing: -0.04em;
  }

  .shots h2 {
    margin-bottom: 22px;
  }

  .grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    grid-template-rows: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .grid img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 12px;
    background: var(--color-surface-1);
    box-shadow: inset 0 0 0 1px var(--color-line);
    image-rendering: pixelated;
  }

  .grid img:first-child {
    grid-row: span 2;
  }

  .columns {
    display: flex;
    flex-wrap: wrap;
    gap: 40px 56px;
  }

  .column {
    flex: 1 1 420px;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .table {
    overflow-x: auto;
    border-radius: 12px;
    box-shadow: inset 0 0 0 1px var(--color-line);
  }

  table {
    width: 100%;
    min-width: 400px;
    border-collapse: collapse;
    font-size: 14px;
  }

  th {
    padding: 12px 18px;
    border-bottom: 1px solid var(--color-line);
    text-align: left;
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 400;
    color: var(--color-text-faint);
  }

  td {
    padding: 12px 18px;
    border-bottom: 1px solid var(--color-surface-2);
  }

  td a {
    text-decoration: none;
  }

  td a:hover {
    color: var(--color-accent);
  }

  .mono {
    font-family: var(--font-mono);
  }

  .muted {
    color: var(--color-text-muted);
  }

  .head {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: baseline;
    gap: var(--space-3);
  }

  .head a {
    font-family: var(--font-mono);
    font-size: var(--font-size-label);
    color: var(--color-accent);
    text-decoration: none;
  }

  .chat {
    padding: 16px;
    border-radius: 12px;
    background: rgb(0 0 0 / 0.63);
    box-shadow: inset 0 0 0 1px var(--color-line);
  }

  .support {
    padding: 28px 32px;
    border-radius: 16px;
    background: var(--color-surface-1);
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--color-accent-2) 27%, transparent);
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 20px 40px;
  }

  .support-text {
    display: flex;
    align-items: center;
    gap: 18px;
  }

  .support-icon {
    flex: none;
    width: 56px;
    height: 56px;
    border-radius: 12px;
    background: var(--color-surface-2);
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--color-accent-2) 40%, transparent);
    color: var(--color-accent-2);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .support h2 {
    font-size: 20px;
    letter-spacing: -0.01em;
  }

  .support p {
    margin: 4px 0 0;
    font-size: 15px;
    color: var(--color-text-muted);
  }

  @media (max-width: 720px) {
    .slot {
      width: 112px;
      height: 112px;
    }

    .grid {
      grid-template-columns: minmax(0, 1fr);
      grid-template-rows: none;
    }

    .grid img:first-child {
      grid-row: auto;
    }
  }
</style>
