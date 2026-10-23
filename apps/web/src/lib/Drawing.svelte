<script lang="ts" module>
  // The lab's own drawings, on the 16 × 16 grid of the hotbar icons: straight and 45° lines with square ends, filled
  // with the two colours of the ServerListPlus icon. Coordinates are in grid units.
  const drawings = {
    flask: {
      fills: [{ d: 'M2.6 10.5h10.8V13.4H2.6z', tone: 'blue' }],
      line: 'M5.5 2h5M6.5 2v4L2 10.5V14h12v-3.5L9.5 6V2M2 10.5h12',
    },
    folder: {
      fills: [
        { d: 'M2 5h12v8.5H2z', tone: 'fill' },
        { d: 'M4 8h2.5v2.5H4z', tone: 'orange' },
      ],
      line: 'M2 3.5h4.5L8 5h6v8.5H2zM8.5 9.2h3.5',
    },
    heart: {
      fills: [{ d: 'M8 14 2 8V4.5L4.5 2h1L8 4.5 10.5 2h1L14 4.5V8z', tone: 'orange' }],
      line: 'M8 14 2 8V4.5L4.5 2h1L8 4.5 10.5 2h1L14 4.5V8z',
    },
    note: {
      fills: [{ d: 'M2.5 2.5h11v11h-11z', tone: 'note' }],
      line: 'M2.5 2.5h11v11h-11zM5 6h6M5 8.5h6M5 11h3.5',
    },
    server: {
      fills: [
        { d: 'M1.5 5.5h13v5h-13z', tone: 'blue' },
        { d: 'M3.5 7h2v2h-2z', tone: 'orange' },
      ],
      line: 'M1.5 5.5h13v5h-13zM11 6.8v2.4M9.8 8h2.4',
    },
    lens: {
      fills: [{ d: 'M3 3h6.5v6.5H3z', tone: 'fill' }],
      line: 'M3 3h6.5v6.5H3zM9.5 9.5 13.5 13.5',
    },
  } as const;

  export type DrawingName = keyof typeof drawings;
</script>

<script lang="ts">
  let { name, size }: { name: DrawingName; size: number } = $props();

  const drawing = $derived(drawings[name]);
</script>

<svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
  {#each drawing.fills as fill (fill.d)}
    <path d={fill.d} fill="var(--{fill.tone})" />
  {/each}
  {#if name === 'flask'}
    <circle class="bubble" cx="6" cy="12.6" r="0.55" />
    <circle class="bubble" cx="8.6" cy="12.8" r="0.4" style="animation-delay: 0.8s" />
    <circle class="bubble" cx="10.2" cy="12.4" r="0.5" style="animation-delay: 1.6s" />
  {/if}
  <path class="line" d={drawing.line} />
</svg>

<style>
  svg {
    display: block;
    overflow: visible;
  }

  .line {
    fill: none;
    stroke: var(--ink);
    stroke-width: 2.5;
    stroke-linecap: square;
    vector-effect: non-scaling-stroke;
  }

  .bubble {
    fill: var(--paper);
    opacity: 0;
    transform-box: fill-box;
    animation: rise 2.4s ease-in infinite;
  }

  /* Distances inside the drawing are grid units, so 5px here means five units, not five screen pixels. */
  @keyframes rise {
    15% {
      opacity: 1;
    }
    100% {
      transform: translateY(-5px);
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .bubble {
      animation: none;
    }
  }
</style>
