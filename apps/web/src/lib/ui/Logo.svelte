<script lang="ts">
  let { height }: { height: number } = $props();

  // Each logo needs its own gradient id, or every copy would point at the first one.
  const gradient = $props.id();
</script>

<svg width={Math.round((height * 6) / 7)} {height} viewBox="40 30 120 140" aria-hidden="true">
  <defs>
    <linearGradient id={gradient} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="var(--color-accent)" />
      <stop offset="1" stop-color="var(--color-accent-2)" />
    </linearGradient>
  </defs>
  <path
    fill="var(--color-text)"
    fill-rule="evenodd"
    d="M62 40H102A42 42 0 0 1 102 124H92V160H62Z M116 82A14 14 0 1 0 88 82A14 14 0 1 0 116 82Z"
  />
  <circle cx="132" cy="148" r="12" fill="url(#{gradient})" />
</svg>

<style>
  svg {
    flex-shrink: 0;
  }
</style>
