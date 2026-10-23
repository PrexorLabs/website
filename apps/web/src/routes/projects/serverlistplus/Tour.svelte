<script lang="ts">
  import { serverListPlus } from '#lib/projects.js';
  import { m } from '#lib/paraglide/messages.js';

  // Where each stop looks on the screenshot, in percent of its width and height, and how close.
  const stops = $derived([
    { title: m.tour_overview(), caption: m.tour_overview_caption(), alt: m.tour_overview_alt(), x: 50, y: 50, zoom: 1 },
    {
      title: m.tour_folders(),
      caption: m.tour_folders_caption(),
      alt: m.tour_folders_alt(),
      x: 46,
      y: 12.4,
      zoom: 2.3,
    },
    { title: m.tour_pins(), caption: m.tour_pins_caption(), alt: m.tour_pins_alt(), x: 46, y: 18.5, zoom: 2.7 },
    {
      title: m.tour_dividers(),
      caption: m.tour_dividers_caption(),
      alt: m.tour_dividers_alt(),
      x: 50,
      y: 31.3,
      zoom: 2.7,
    },
    { title: m.tour_players(), caption: m.tour_players_caption(), alt: m.tour_players_alt(), x: 70, y: 22, zoom: 3 },
    { title: m.tour_search(), caption: m.tour_search_caption(), alt: m.tour_search_alt(), x: 93, y: 12.4, zoom: 3 },
  ]);

  // The tour moves on when the running progress bar is full, so pausing the bar pauses the tour and reduced motion,
  // which turns the bar's animation off, keeps it still.
  let current = $state(0);
  let held = $state(false);
  const stop = $derived(stops[current]);

  // The camera never shows past the edge of the screenshot, so a stop near a corner is pulled inwards.
  const camera = $derived.by(() => {
    const half = 50 / stop.zoom;
    const x = Math.min(100 - half, Math.max(half, stop.x));
    const y = Math.min(100 - half, Math.max(half, stop.y));
    return `translate(50%, 50%) scale(${stop.zoom}) translate(-${x}%, -${y}%)`;
  });

  function next() {
    current = (current + 1) % stops.length;
  }
</script>

<section class="wrap" aria-label={m.tour_label()}>
  <div
    class="stage"
    role="img"
    aria-label={stop.alt}
    onpointerenter={() => (held = true)}
    onpointerleave={() => (held = false)}
  >
    <img src={serverListPlus.screenshot} alt="" width="1280" height="720" style:transform={camera} />
    <p class="caption" aria-live="polite">{stop.caption}</p>
  </div>
  <div
    class="stops"
    role="group"
    aria-label={m.tour_steps()}
    onpointerenter={() => (held = true)}
    onpointerleave={() => (held = false)}
    onfocusin={() => (held = true)}
    onfocusout={() => (held = false)}
  >
    {#each stops as item, index (item.title)}
      <button type="button" aria-pressed={index === current} onclick={() => (current = index)}>
        <span class="track">
          {#key current}
            <span
              class={['bar', { done: index < current, running: index === current, held }]}
              onanimationend={index === current ? next : undefined}
            ></span>
          {/key}
        </span>
        {item.title}
      </button>
    {/each}
  </div>
</section>

<style>
  section {
    padding-top: 56px;
  }

  .stage {
    position: relative;
    overflow: hidden;
    aspect-ratio: 16 / 9;
    border-radius: 20px;
    background: #0e0e10;
    box-shadow:
      0 1px 2px #0000001a,
      0 40px 80px -40px var(--drop);
  }

  img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform-origin: 0 0;
    transition: transform 1s cubic-bezier(0.65, 0, 0.35, 1);
  }

  .caption {
    position: absolute;
    left: 20px;
    bottom: 20px;
    max-width: 540px;
    margin: 0;
    padding: 12px 16px;
    border-radius: 10px;
    background: #111113eb;
    color: #ffffff;
    font-size: 17px;
    line-height: 1.4;
  }

  .stops {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 8px;
    margin-top: 14px;
  }

  button {
    all: unset;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 10px 4px 6px;
    font-size: 15px;
    font-weight: 600;
    color: var(--muted);
    cursor: pointer;
  }

  button:hover,
  button[aria-pressed='true'] {
    color: var(--ink);
  }

  button:focus-visible {
    outline: 2px solid var(--ink);
    outline-offset: 2px;
  }

  .track {
    height: 3px;
    border-radius: 2px;
    background: var(--line);
    overflow: hidden;
  }

  .bar {
    display: block;
    width: 0;
    height: 100%;
    background: var(--blue);
  }

  .bar.done {
    width: 100%;
    background: var(--edge);
  }

  .bar.running {
    animation: fill 3.6s linear forwards;
  }

  .bar.held {
    animation-play-state: paused;
  }

  @keyframes fill {
    to {
      width: 100%;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    img {
      transition: none;
    }

    .bar.running {
      animation: none;
      width: 100%;
    }
  }

  @media (max-width: 760px) {
    .stops {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .caption {
      left: 10px;
      right: 10px;
      bottom: 10px;
      font-size: 14px;
    }
  }
</style>
