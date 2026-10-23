<script lang="ts">
  import Drawing from '#lib/Drawing.svelte';
  import { formatDate, nextExperiment, serverListPlus as slp } from '#lib/projects.js';
  import { m } from '#lib/paraglide/messages.js';
  import { localizeHref } from '#lib/paraglide/runtime.js';
</script>

<svelte:head>
  <title>{m.projects_title()} · PrexorLabs</title>
  <meta name="description" content={m.projects_intro()} />
</svelte:head>

<section class="wrap hero" aria-labelledby="title">
  <span class="drawing folder" aria-hidden="true"><Drawing name="folder" size={112} /></span>
  <span class="drawing lens" aria-hidden="true"><Drawing name="lens" size={72} /></span>
  <h1 id="title" class="serif">{m.projects_title()}</h1>
  <p>{m.projects_intro()}</p>
</section>

<div class="wrap list">
  <a class="project" href={localizeHref(slp.path)}>
    <span class="text">
      <span class="muted small"
        ><span class="number">{slp.number}</span> · {m.project_released({ date: formatDate(slp.released) })}</span
      >
      <span class="name">
        <img src={slp.icon} alt="" width="68" height="68" />
        <span class="serif">{slp.name}</span>
      </span>
      <span class="muted tagline">{m.slp_tagline()}</span>
      <dl>
        <div>
          <dt>{m.fact_version()}</dt>
          <dd>{m.fact_version_value({ version: slp.version, date: formatDate(slp.updated) })}</dd>
        </div>
        <div>
          <dt>{m.fact_minecraft()}</dt>
          <dd>{m.fact_range(slp.minecraft)}</dd>
        </div>
        <div>
          <dt>{m.fact_loaders()}</dt>
          <dd>Fabric, NeoForge</dd>
        </div>
        <div>
          <dt>{m.fact_runs()}</dt>
          <dd>{m.fact_runs_value()}</dd>
        </div>
      </dl>
      <span class="link small open">{m.project_open()}</span>
    </span>
    <span class="shot"><img src={slp.screenshot} alt={m.shot_list()} width="1280" height="720" /></span>
  </a>

  <div class="pair">
    <a class="card next" href="/discord">
      <span class="sketch"><Drawing name="flask" size={92} /></span>
      <span class="text">
        <span class="muted small status"
          ><span class="pulse" aria-hidden="true"></span>{nextExperiment.number} · {m.fan_next()}</span
        >
        <span class="serif title faint">{m.next_name()}</span>
        <span class="muted">{m.next_page_text()}</span>
      </span>
    </a>
    <a class="card idea" href="/discord">
      <span class="sketch"><Drawing name="server" size={104} /></span>
      <span class="text">
        <span class="muted small">{m.idea_number()}</span>
        <span class="serif title">{m.fan_idea()}</span>
        <span class="muted">{m.idea_text()}</span>
      </span>
    </a>
  </div>
</div>

<style>
  .hero {
    position: relative;
    padding-top: 96px;
    padding-bottom: 72px;
  }

  .drawing {
    position: absolute;
  }

  .folder {
    right: 6%;
    top: 40px;
    transform: rotate(10deg);
  }

  .lens {
    right: 22%;
    top: 150px;
    transform: rotate(-12deg);
  }

  .drawing :global(svg) {
    animation: drift 3.2s ease-in-out infinite alternate;
  }

  .lens :global(svg) {
    animation-duration: 2.7s;
    animation-delay: -1s;
  }

  @keyframes drift {
    to {
      transform: translateY(-10px) rotate(3deg);
    }
  }

  h1 {
    margin: 0;
    font-size: 104px;
    line-height: 0.95;
    letter-spacing: -0.035em;
  }

  .hero p {
    margin: 22px 0 0;
    max-width: 520px;
    font-size: 19px;
    color: var(--muted);
  }

  .list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding-bottom: 96px;
  }

  .project {
    display: grid;
    grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
    gap: 48px;
    align-items: center;
    padding: 44px;
    border-radius: 24px;
    background: var(--card);
    box-shadow:
      0 1px 2px #0000000f,
      0 30px 60px -36px var(--drop);
    text-decoration: none;
  }

  .text {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .project .text {
    gap: 22px;
  }

  .name {
    display: flex;
    align-items: center;
    gap: 18px;
    font-size: 52px;
    line-height: 1;
    letter-spacing: -0.03em;
  }

  .name img {
    border-radius: 17px;
  }

  .tagline {
    font-size: 19px;
  }

  dl {
    margin: 0;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px 24px;
  }

  dt {
    font-size: 14px;
    color: var(--muted);
  }

  dd {
    margin: 0;
  }

  .open {
    align-self: flex-start;
    font-weight: 600;
  }

  .project:hover .open {
    text-decoration-color: currentColor;
  }

  .shot {
    border-radius: 12px;
    overflow: hidden;
    box-shadow:
      0 1px 2px #0000001a,
      0 24px 48px -24px var(--drop);
    transform: rotate(1.5deg);
    transition: transform 0.45s ease;
  }

  .shot img {
    display: block;
    width: 100%;
    height: auto;
  }

  .project:hover .shot {
    transform: rotate(0) scale(1.02);
  }

  .pair {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  .card {
    display: flex;
    align-items: center;
    gap: 28px;
    padding: 32px;
    border-radius: 24px;
    text-decoration: none;
    transition: transform 0.3s ease;
  }

  .card:hover {
    transform: translateY(-4px);
  }

  .next {
    background: var(--card);
    box-shadow:
      0 1px 2px #0000000f,
      0 30px 60px -36px var(--drop);
  }

  .idea {
    box-shadow: inset 0 0 0 2px var(--edge);
  }

  .sketch {
    flex: none;
    width: 132px;
    height: 132px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .next .sketch {
    background: var(--fill);
  }

  .status {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .title {
    font-size: 32px;
    line-height: 1.1;
    letter-spacing: -0.02em;
  }

  .muted {
    color: var(--muted);
  }

  .faint {
    color: var(--faint);
  }

  .small {
    font-size: 14px;
  }

  .number {
    font-variant-numeric: tabular-nums;
  }

  .pulse {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--blue);
    animation: pulse 1.6s ease-in-out infinite;
  }

  @keyframes pulse {
    50% {
      opacity: 0.35;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .drawing :global(svg),
    .pulse {
      animation: none;
    }

    .shot,
    .card {
      transition: none;
    }
  }

  @media (max-width: 900px) {
    .drawing {
      display: none;
    }

    h1 {
      font-size: 64px;
    }

    .project,
    .pair {
      grid-template-columns: minmax(0, 1fr);
    }

    .project {
      padding: 24px;
    }

    .name {
      font-size: 40px;
    }

    .sketch {
      width: 88px;
      height: 88px;
    }
  }
</style>
