<script lang="ts">
  import { onMount } from 'svelte';
  import Drawing, { type DrawingName } from '#lib/Drawing.svelte';
  import { m } from '#lib/paraglide/messages.js';

  const version = '1.2.0';
  const repository = 'https://github.com/PrexorLabs/ServerListPlus';

  // Position in the hero, size in pixels, resting angle, and how far each drawing gives way to the pointer.
  // Small drawings move more than big ones, which reads as depth.
  const drawings: { name: DrawingName; x: string; y: string; size: number; angle: number; depth: number }[] = [
    { name: 'flask', x: '2%', y: '8%', size: 128, angle: -8, depth: 26 },
    { name: 'folder', x: '6%', y: '56%', size: 120, angle: 6, depth: 18 },
    { name: 'heart', x: '22%', y: '80%', size: 72, angle: -12, depth: 34 },
    { name: 'note', x: '80%', y: '6%', size: 112, angle: 10, depth: 22 },
    { name: 'server', x: '84%', y: '50%', size: 132, angle: -6, depth: 14 },
    { name: 'lens', x: '68%', y: '78%', size: 84, angle: 8, depth: 30 },
  ];

  const shots = $derived([
    { src: '/images/serverlistplus/server-list.avif', alt: m.shot_list() },
    { src: '/images/serverlistplus/search.avif', alt: m.shot_search() },
    { src: '/images/serverlistplus/settings.avif', alt: m.shot_settings() },
  ]);

  let shown = $state(0);
  let hero: HTMLElement;

  onMount(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setInterval(() => (shown = (shown + 1) % shots.length), 3200);
    return () => clearInterval(timer);
  });

  // Written straight to CSS variables: a state change per pointer move would re-render the hero for nothing.
  function follow(event: PointerEvent) {
    if (event.pointerType !== 'mouse') return;
    const box = hero.getBoundingClientRect();
    hero.style.setProperty('--px', String(((event.clientX - box.left) / box.width) * 2 - 1));
    hero.style.setProperty('--py', String(((event.clientY - box.top) / box.height) * 2 - 1));
  }

  function rest() {
    hero.style.setProperty('--px', '0');
    hero.style.setProperty('--py', '0');
  }
</script>

<svelte:head>
  <title>PrexorLabs</title>
</svelte:head>

<section class="hero wrap" bind:this={hero} onpointermove={follow} onpointerleave={rest} aria-labelledby="title">
  {#each drawings as drawing, index (drawing.name)}
    <span
      class="drawing"
      style:left={drawing.x}
      style:top={drawing.y}
      style:--angle="{drawing.angle}deg"
      style:--depth="{drawing.depth}px"
      style:--period="{2.6 + (index % 3) * 0.6}s"
      style:--delay="{-index * 0.7}s"
    >
      <Drawing name={drawing.name} size={drawing.size} />
    </span>
  {/each}
  <h1 id="title" class="serif">{m.home_title()}</h1>
  <p>{m.home_intro()}</p>
  <div class="actions">
    <a class="button" href="/discord">{m.home_discord()}</a>
    <a class="link" href="#projects">{m.home_projects()}</a>
  </div>
</section>

<section class="wrap" aria-label={m.fan_label()}>
  <div class="fan">
    <a class="card left" href="/discord">
      <span class="inner">
        <span class="picture sketch"><Drawing name="flask" size={150} /></span>
        <span class="bar"
          ><span class="pulse" aria-hidden="true"></span><span class="number">002</span>{m.fan_next()}</span
        >
      </span>
    </a>
    <a class="card middle" href={repository}>
      <span class="inner">
        <span class="picture">
          {#each shots as shot, index (shot.src)}
            <img
              src={shot.src}
              alt={index === shown ? shot.alt : ''}
              width="1280"
              height="720"
              class={{ shown: index === shown }}
              decoding="async"
            />
          {/each}
        </span>
        <span class="bar">
          <img class="icon" src="/images/serverlistplus/icon.avif" alt="" width="30" height="30" />
          <strong>ServerListPlus</strong>
          <span class="muted">{m.fan_latest({ version })}</span>
        </span>
      </span>
    </a>
    <a class="card right" href="/discord">
      <span class="inner idea">
        <span class="picture sketch"><Drawing name="server" size={160} /></span>
        <span class="bar"><strong>{m.fan_idea()}</strong><span class="muted">{m.fan_idea_hint()}</span></span>
      </span>
    </a>
  </div>
</section>

<section id="projects" class="wrap projects" aria-labelledby="projects-title">
  <h2 id="projects-title" class="serif">{m.projects_title()}</h2>
  <a class="row" href={repository}>
    <img src="/images/serverlistplus/icon.avif" alt="" width="56" height="56" />
    <span class="text">
      <span class="name serif">ServerListPlus</span>
      <span class="muted">{m.slp_text()}</span>
    </span>
    <span class="side number">{version}</span>
  </a>
  <div class="row">
    <span class="placeholder number" aria-hidden="true">002</span>
    <span class="text">
      <span class="name serif faint">{m.next_name()}</span>
      <span class="muted">{m.next_text()}</span>
    </span>
    <span class="side"><span class="pulse" aria-hidden="true"></span>{m.next_status()}</span>
  </div>
</section>

<section class="wrap who">
  <p class="serif">{m.who_lead()} <span class="faint">{m.who_rest()}</span></p>
</section>

<style>
  .hero {
    --px: 0;
    --py: 0;
    position: relative;
    height: 700px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  .drawing {
    position: absolute;
    transform: translate(calc(var(--px) * var(--depth) * -1), calc(var(--py) * var(--depth) * -1)) rotate(var(--angle));
    transition: transform 0.6s cubic-bezier(0.2, 0.7, 0.2, 1);
  }

  .drawing :global(svg) {
    animation: drift var(--period) ease-in-out var(--delay) infinite alternate;
  }

  @keyframes drift {
    to {
      transform: translateY(-10px) rotate(3deg);
    }
  }

  h1 {
    position: relative;
    margin: 0;
    max-width: 820px;
    font-size: 96px;
    line-height: 0.97;
    letter-spacing: -0.03em;
    text-wrap: balance;
  }

  .hero p {
    position: relative;
    margin: 24px 0 0;
    max-width: 480px;
    font-size: 19px;
    color: var(--muted);
  }

  .actions {
    position: relative;
    margin-top: 30px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
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

  .fan {
    position: relative;
    height: 470px;
  }

  .card {
    position: absolute;
    top: 40px;
    left: 50%;
    width: 44%;
    color: inherit;
    text-decoration: none;
    animation: spread 0.9s cubic-bezier(0.2, 0.7, 0.2, 1) 0.25s both;
  }

  .left {
    --to: translateX(-112%) rotate(-6deg);
  }

  .middle {
    --to: translateX(-50%) translateY(-24px);
    z-index: 1;
  }

  .right {
    --to: translateX(12%) rotate(6deg);
  }

  .left:hover,
  .left:focus-visible,
  .right:hover,
  .right:focus-visible {
    z-index: 2;
  }

  @keyframes spread {
    from {
      transform: translateX(-50%) translateY(30px);
    }
    to {
      transform: var(--to);
    }
  }

  .inner {
    display: block;
    border-radius: 14px;
    overflow: hidden;
    background: var(--card);
    box-shadow:
      0 1px 2px #0000001a,
      0 30px 60px -28px var(--drop);
    transition: transform 0.35s ease;
  }

  .left:hover .inner,
  .left:focus-visible .inner,
  .right:hover .inner,
  .right:focus-visible .inner {
    transform: translateY(-14px);
  }

  .idea {
    background: transparent;
    box-shadow: none;
    border: 2px dashed var(--edge);
  }

  .picture {
    position: relative;
    display: block;
    aspect-ratio: 16 / 9;
  }

  .picture img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    transition: opacity 0.8s ease;
  }

  .picture img.shown {
    opacity: 1;
  }

  .sketch {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--fill);
  }

  .idea .sketch {
    background: transparent;
  }

  /* The middle card covers the inner third of each side card, so their content keeps to the outer edge. */
  .left .sketch {
    justify-content: flex-start;
    padding-left: 14%;
  }

  .right .sketch {
    justify-content: flex-end;
    padding-right: 14%;
  }

  .bar {
    height: 58px;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 16px;
    font-size: 15px;
  }

  .right .bar {
    justify-content: flex-end;
  }

  .icon {
    border-radius: 8px;
  }

  .muted {
    color: var(--muted);
  }

  .faint {
    color: var(--faint);
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

  .projects {
    padding-top: 72px;
  }

  h2 {
    margin: 0 0 8px;
    font-size: 48px;
    letter-spacing: -0.02em;
  }

  .row {
    display: grid;
    grid-template-columns: 56px minmax(0, 1fr) auto;
    gap: 24px;
    align-items: center;
    padding: 24px 0;
    border-top: 1px solid var(--line);
    text-decoration: none;
  }

  .row:last-child {
    border-bottom: 1px solid var(--line);
  }

  .row img {
    border-radius: 14px;
  }

  a.row:hover .name {
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 6px;
  }

  .text {
    display: flex;
    flex-direction: column;
  }

  .name {
    font-size: 30px;
    letter-spacing: -0.02em;
  }

  .side {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: var(--muted);
  }

  .placeholder {
    width: 56px;
    height: 56px;
    box-sizing: border-box;
    border-radius: 14px;
    border: 2px dashed var(--edge);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    color: var(--muted);
  }

  .who {
    padding-top: 128px;
    padding-bottom: 72px;
    text-align: center;
  }

  .who p {
    margin: 0 auto;
    max-width: 860px;
    font-size: 36px;
    line-height: 1.25;
    letter-spacing: -0.015em;
  }

  @media (prefers-reduced-motion: reduce) {
    .drawing,
    .inner,
    .picture img {
      transition: none;
    }

    .drawing :global(svg),
    .pulse {
      animation: none;
    }

    .card {
      animation: none;
      transform: var(--to);
    }
  }

  @media (max-width: 900px) {
    .drawing {
      display: none;
    }

    .hero {
      height: auto;
      padding: 72px var(--gutter);
    }

    h1 {
      font-size: 52px;
    }

    .fan {
      height: auto;
      aspect-ratio: 16 / 10;
    }

    .left,
    .right {
      display: none;
    }

    .card {
      top: 0;
      width: 100%;
    }

    .middle {
      --to: translateX(-50%);
    }

    .row {
      grid-template-columns: 48px minmax(0, 1fr);
    }

    .row img,
    .placeholder {
      width: 48px;
      height: 48px;
    }

    .side {
      display: none;
    }

    .name {
      font-size: 24px;
    }

    .who p {
      font-size: 26px;
    }
  }
</style>
