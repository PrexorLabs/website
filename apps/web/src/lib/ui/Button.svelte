<script lang="ts">
  import type { Snippet } from 'svelte';
  import Icon from './Icon.svelte';
  import type { IconName } from './icons';

  let {
    href,
    variant = 'secondary',
    icon,
    onclick,
    children,
  }: {
    href?: string;
    variant?: 'primary' | 'secondary';
    icon?: IconName;
    onclick?: () => void;
    children: Snippet;
  } = $props();
</script>

{#if href}
  <a {href} class={variant}>
    {#if icon}<Icon name={icon} />{/if}
    {@render children()}
  </a>
{:else}
  <button type="button" class={variant} {onclick}>
    {#if icon}<Icon name={icon} />{/if}
    {@render children()}
  </button>
{/if}

<style>
  a,
  button {
    box-sizing: border-box;
    height: 44px;
    padding: 0 18px;
    border: 0;
    border-radius: var(--radius-medium);
    font: inherit;
    font-size: 15px;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    white-space: nowrap;
    text-decoration: none;
    cursor: pointer;
    transition: background-color var(--duration-fast) ease;
  }

  .primary {
    background: var(--color-accent);
    color: var(--color-on-accent);
  }

  .primary:hover {
    background: var(--color-accent-hover);
  }

  .secondary {
    background: var(--color-surface-2);
    color: var(--color-text);
    box-shadow: inset 0 0 0 1px var(--color-line-strong);
  }

  .secondary:hover {
    background: var(--color-surface-3);
  }
</style>
