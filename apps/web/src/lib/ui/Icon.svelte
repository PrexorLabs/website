<script lang="ts">
  import { icons, type IconName } from './icons';

  let { name, size = 16, stroke = 1.5 }: { name: IconName; size?: number; stroke?: number } = $props();
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 16 16"
  fill="none"
  stroke="currentColor"
  stroke-width={stroke}
  stroke-linecap="square"
  stroke-linejoin="round"
  aria-hidden="true"
>
  <path d={icons[name]} />
</svg>

<style>
  svg {
    flex-shrink: 0;
  }
</style>
