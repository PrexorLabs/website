<script lang="ts">
  import Drawing, { type DrawingName } from '#lib/Drawing.svelte';
  import { formatDate, serverListPlus as slp } from '#lib/projects.js';
  import { m } from '#lib/paraglide/messages.js';
  import { localizeHref } from '#lib/paraglide/runtime.js';
  import Tour from './Tour.svelte';

  const features: { drawing: DrawingName; title: string; text: string }[] = $derived([
    { drawing: 'folder', title: m.feature_folders(), text: m.feature_folders_text() },
    { drawing: 'lens', title: m.feature_search(), text: m.feature_search_text() },
    { drawing: 'server', title: m.feature_bulk(), text: m.feature_bulk_text() },
    { drawing: 'note', title: m.feature_notes(), text: m.feature_notes_text() },
    { drawing: 'flask', title: m.feature_direct(), text: m.feature_direct_text() },
    { drawing: 'heart', title: m.feature_style(), text: m.feature_style_text() },
  ]);

  // The search terms are typed into the game as they are, so only their explanations are translated.
  const terms = $derived([
    { term: 'survival', matches: m.term_word() },
    { term: '"mini games"', matches: m.term_phrase() },
    { term: 'tag:pvp', matches: m.term_tag() },
    { term: 'folder:friends', matches: m.term_folder() },
    { term: 'note:base', matches: m.term_note() },
    { term: 'has:notes', matches: m.term_has() },
    { term: 'is:pinned', matches: m.term_pinned() },
    { term: 'is:hidden', matches: m.term_hidden() },
    { term: 'is:online', matches: m.term_online() },
    { term: 'ping:<100', matches: m.term_ping() },
    { term: 'played:>2h', matches: m.term_played() },
    { term: 'last:<7d', matches: m.term_last() },
    { term: 'domain:example.com', matches: m.term_domain() },
    { term: '-tag:modded', matches: m.term_not() },
  ]);

  const versions = $derived([
    {
      version: '1.2.0',
      date: '2026-10-18',
      notes: [m.notes_120_select(), m.notes_120_tabs(), m.notes_120_update(), m.notes_120_thanks()],
    },
    { version: '1.1.1', date: '2026-10-17', notes: [m.notes_111_logo()] },
    {
      version: '1.1.0',
      date: '2026-10-16',
      notes: [m.notes_110_symbol(), m.notes_110_reminder(), m.notes_110_filters()],
    },
    { version: '1.0.0', date: '2026-10-13', notes: [m.notes_100_folders(), m.notes_100_pins(), m.notes_100_direct()] },
  ]);

  const minecraft = [
    { from: '1.20.5', to: '1.20.6' },
    { from: '1.21', to: '1.21.11' },
    { from: '26.1', to: '26.3' },
  ];
</script>

<svelte:head>
  <title>ServerListPlus · PrexorLabs</title>
  <meta name="description" content={m.slp_tagline()} />
</svelte:head>

<section class="wrap hero" aria-labelledby="title">
  <nav class="crumbs" aria-label={m.breadcrumb_label()}>
    <a class="link" href={localizeHref('/projects/')}>{m.projects_title()}</a>
    <span aria-hidden="true">/</span>
    <span aria-current="page">{slp.name}</span>
  </nav>
  <div class="intro">
    <div class="lead">
      <span class="badge">
        <img class="icon" src={slp.icon} alt="" width="88" height="88" />
        <span class="muted"
          ><span class="number">{slp.number}</span> · {m.project_released({ date: formatDate(slp.released) })}</span
        >
      </span>
      <h1 id="title" class="serif">{slp.name}</h1>
      <p class="tagline">{m.slp_tagline()}</p>
    </div>
    <div class="get">
      <div class="actions">
        <a class="button" href={slp.download}>{m.slp_download({ version: slp.version })}</a>
        <a class="link" href={slp.repository}>{m.slp_source()}</a>
      </div>
      <p class="muted small">{m.slp_meta(slp.minecraft)}</p>
    </div>
  </div>
</section>

<Tour />

<section class="wrap block" aria-labelledby="features">
  <h2 id="features" class="serif">{m.slp_features_title()}</h2>
  <ul class="features">
    {#each features as feature (feature.title)}
      <li>
        <Drawing name={feature.drawing} size={44} />
        <span>
          <strong>{feature.title}</strong>
          <span class="muted">{feature.text}</span>
        </span>
      </li>
    {/each}
  </ul>
</section>

<section class="wrap block split" aria-labelledby="search">
  <div class="side">
    <h2 id="search" class="serif">{m.slp_search_title()}</h2>
    <p class="muted">{m.slp_search_text()}</p>
    <code class="example">tag:pvp ping:&lt;100 -is:hidden "mini games"</code>
    <p class="muted small">{m.slp_search_hint()}</p>
  </div>
  <div class="scroll">
    <table>
      <thead>
        <tr><th scope="col">{m.search_term()}</th><th scope="col">{m.search_matches()}</th></tr>
      </thead>
      <tbody>
        {#each terms as row (row.term)}
          <tr><td class="term">{row.term}</td><td>{row.matches}</td></tr>
        {/each}
      </tbody>
    </table>
  </div>
</section>

<section class="wrap block split" aria-labelledby="install">
  <div class="side">
    <h2 id="install" class="serif">{m.slp_install_title()}</h2>
    <ol>
      <li>{m.install_loader()}</li>
      <li>{m.install_download()}</li>
      <li>{m.install_mods({ folder: 'mods' })}</li>
    </ol>
  </div>
  <table>
    <thead>
      <tr><th scope="col">{m.fact_minecraft()}</th><th scope="col">Fabric</th><th scope="col">NeoForge</th></tr>
    </thead>
    <tbody>
      {#each minecraft as range (range.from)}
        <tr><td class="number">{m.fact_range(range)}</td><td>{m.install_yes()}</td><td>{m.install_yes()}</td></tr>
      {/each}
    </tbody>
  </table>
</section>

<section class="wrap block" aria-labelledby="versions">
  <div class="heading">
    <h2 id="versions" class="serif">{m.slp_versions_title()}</h2>
    <a class="link small" href={slp.releases}>{m.slp_versions_all()}</a>
  </div>
  {#each versions as release (release.version)}
    <div class="release">
      <div class="when">
        <span class="serif version">{release.version}</span>
        <span class="muted small">{formatDate(release.date)}</span>
      </div>
      <ul>
        {#each release.notes as note (note)}<li>{note}</li>{/each}
      </ul>
    </div>
  {/each}
</section>

<section class="wrap block split last" aria-labelledby="data">
  <h2 id="data" class="serif">{m.slp_data_title()}</h2>
  <div class="side">
    <p>{m.slp_data_file({ file: 'config/serverlistplus/servers.json', vanilla: 'servers.dat' })}</p>
    <p class="muted">{m.slp_data_update()}</p>
    <p class="muted">{m.slp_data_help()}</p>
  </div>
</section>

<style>
  .hero {
    padding-top: 48px;
  }

  .crumbs {
    display: flex;
    gap: 8px;
    font-size: 15px;
    color: var(--muted);
  }

  .intro {
    margin-top: 40px;
    display: grid;
    grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
    gap: 48px;
    align-items: end;
  }

  .lead,
  .get,
  .side {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .badge {
    display: flex;
    align-items: center;
    gap: 20px;
    font-size: 15px;
  }

  .icon {
    border-radius: 22px;
    box-shadow: 0 18px 36px -18px var(--drop);
  }

  h1 {
    margin: 0;
    font-size: 96px;
    line-height: 0.95;
    letter-spacing: -0.035em;
  }

  .tagline {
    margin: 0;
    max-width: 560px;
    font-size: 21px;
    color: var(--muted);
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 22px;
    font-size: 15px;
  }

  .button {
    display: inline-flex;
    align-items: center;
    height: 52px;
    padding: 0 24px;
    border-radius: 12px;
    background: var(--ink);
    color: var(--paper);
    font-size: 17px;
    font-weight: 600;
    text-decoration: none;
  }

  .button:hover {
    opacity: 0.88;
  }

  p {
    margin: 0;
  }

  .muted {
    color: var(--muted);
  }

  .small {
    font-size: 15px;
  }

  .number {
    font-variant-numeric: tabular-nums;
  }

  .block {
    padding-top: 128px;
  }

  .last {
    padding-bottom: 96px;
  }

  h2 {
    margin: 0;
    font-size: 48px;
    line-height: 1.05;
    letter-spacing: -0.025em;
  }

  .features {
    margin: 28px 0 0;
    padding: 0;
    list-style: none;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 56px;
  }

  .features li {
    display: grid;
    grid-template-columns: 52px minmax(0, 1fr);
    gap: 18px;
    padding: 26px 0;
    border-top: 1px solid var(--line);
  }

  .features span {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  strong {
    font-size: 19px;
    font-weight: 600;
  }

  .split {
    display: grid;
    grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
    gap: 56px;
    align-items: start;
  }

  .example,
  .term {
    font-family: var(--mono);
    font-size: 15px;
  }

  .example {
    display: block;
    padding: 16px 18px;
    border-radius: 12px;
    background: var(--card);
    box-shadow: 0 0 0 1px var(--line);
  }

  .scroll {
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th {
    padding: 0 16px 10px 0;
    border-bottom: 1px solid var(--ink);
    text-align: left;
    font-size: 14px;
    font-weight: 600;
    color: var(--muted);
  }

  td {
    padding: 11px 16px 11px 0;
    border-bottom: 1px solid var(--line);
    vertical-align: top;
  }

  .term {
    white-space: nowrap;
    color: var(--blue);
  }

  ol {
    margin: 0;
    padding-left: 22px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .heading {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: baseline;
    gap: 20px;
    margin-bottom: 20px;
  }

  .release {
    display: grid;
    grid-template-columns: 200px minmax(0, 1fr);
    gap: 32px;
    padding: 28px 0;
    border-top: 1px solid var(--line);
  }

  .when {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .version {
    font-size: 36px;
    line-height: 1;
  }

  .release ul {
    margin: 0;
    padding-left: 20px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  @media (max-width: 900px) {
    .intro,
    .split,
    .features {
      grid-template-columns: minmax(0, 1fr);
    }

    h1 {
      font-size: 60px;
    }

    h2 {
      font-size: 38px;
    }

    .block {
      padding-top: 96px;
    }

    .release {
      grid-template-columns: minmax(0, 1fr);
      gap: 8px;
    }
  }
</style>
