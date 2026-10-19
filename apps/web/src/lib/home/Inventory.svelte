<script lang="ts">
  import { MediaQuery } from 'svelte/reactivity';
  import type { InventoryItem } from '#lib/inventory.js';
  import Icon from '#lib/ui/Icon.svelte';
  import { m } from '#lib/paraglide/messages.js';
  import Inspector from './Inspector.svelte';

  let { items }: { items: InventoryItem[] } = $props();

  // The game's inventory is 9 × 3. A phone shows 5 columns and three rows, which still leaves room for new items;
  // the markup always has all 27 slots so the prerendered page matches, and CSS hides the rest on a phone.
  const phone = new MediaQuery('max-width: 720px');
  const columns = $derived(phone.current ? 5 : 9);
  const reachable = $derived(phone.current ? 15 : 27);

  let selected = $state(0);
  let focused = $state(0);
  let pointed = $state<number | null>(null);
  let sheetOpen = $state(false);
  let slotElements: HTMLButtonElement[] = $state([]);

  function choose(index: number) {
    if (!items[index]) return;
    selected = index;
    if (phone.current) sheetOpen = true;
  }

  function moveFocus(event: KeyboardEvent) {
    const steps: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -columns,
      ArrowDown: columns,
      Home: -focused,
      End: reachable - 1 - focused,
    };
    const step = steps[event.key];
    if (step === undefined) return;
    event.preventDefault();
    focused = Math.min(reachable - 1, Math.max(0, focused + step));
    slotElements[focused]?.focus();
  }

  function closeSheet() {
    sheetOpen = false;
    slotElements[selected]?.focus();
  }
</script>

<div class="row">
  <div class="inventory">
    <div class="caption">
      <span>{m.inventory_label()}</span>
      <span>{m.inventory_count({ filled: items.length, total: 27 })}</span>
    </div>
    <div class="grid" role="group" aria-label={m.inventory_label()}>
      {#each { length: 27 }, index (index)}
        {@const item = items[index]}
        <button
          type="button"
          class={['slot', item?.kind, { selected: item && index === selected, flip: index % 9 >= 6 }]}
          bind:this={slotElements[index]}
          tabindex={index === focused ? 0 : -1}
          aria-label={item?.name ?? m.inventory_empty_slot()}
          aria-pressed={item ? index === selected : undefined}
          aria-describedby={item && pointed === index ? `tooltip-${index}` : undefined}
          onclick={() => choose(index)}
          onkeydown={moveFocus}
          onfocus={() => {
            focused = index;
            pointed = index;
          }}
          onblur={() => (pointed = null)}
          onpointerenter={() => (pointed = index)}
          onpointerleave={() => (pointed = null)}
        >
          {#if item}
            <Icon name={item.icon} size={30} stroke={1.4} />
            {#if pointed === index}
              <span class="tooltip" id="tooltip-{index}" role="tooltip">
                <span class="tooltip-name">{item.name}</span>
                <span>{item.lore}</span>
                <span class="tooltip-id">{item.namespaced}</span>
              </span>
            {/if}
          {/if}
        </button>
      {/each}
    </div>
    <p class="hint">{m.inventory_hint()}</p>
  </div>

  <Inspector item={items[selected]} open={sheetOpen} onclose={closeSheet} />
</div>

<style>
  .row {
    display: flex;
    flex-wrap: wrap;
    align-items: stretch;
    gap: var(--space-5);
  }

  .inventory {
    flex: none;
    box-sizing: border-box;
    width: 664px;
    padding: 20px;
    border-radius: var(--radius-x-large);
    background: var(--color-surface-1);
    box-shadow:
      inset 0 0 0 1px var(--color-line),
      0 40px 80px -30px #000;
  }

  .caption {
    height: 30px;
    display: flex;
    justify-content: space-between;
    font-family: var(--font-mono);
    font-size: var(--font-size-small);
    color: var(--color-text-faint);
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(9, 64px);
    gap: 6px;
  }

  .slot {
    position: relative;
    box-sizing: border-box;
    width: 64px;
    height: 64px;
    padding: 0;
    border: 0;
    border-radius: 10px;
    background: var(--color-surface-1);
    box-shadow: inset 0 0 0 1px var(--color-surface-3);
    color: var(--color-text);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition:
      background-color var(--duration-fast) ease,
      box-shadow var(--duration-fast) ease;
  }

  .slot:hover,
  .slot:focus-visible {
    background: var(--color-surface-3);
    box-shadow: inset 0 0 0 2px var(--color-text);
  }

  .slot.selected {
    background: var(--color-surface-3);
    box-shadow: inset 0 0 0 2px var(--color-accent);
  }

  .project {
    color: var(--color-accent);
  }

  .support {
    color: var(--color-accent-2);
  }

  .experiment {
    color: var(--color-text-faint);
  }

  .tooltip {
    position: absolute;
    left: calc(100% + 8px);
    top: -6px;
    z-index: 20;
    box-sizing: border-box;
    width: 250px;
    padding: 12px 14px;
    border-radius: 10px;
    background: color-mix(in srgb, var(--color-surface-2) 96%, transparent);
    box-shadow:
      inset 0 0 0 1px color-mix(in srgb, currentColor 40%, transparent),
      0 20px 40px -10px #000;
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    text-align: left;
    font-size: var(--font-size-label);
    line-height: 19px;
    color: var(--color-text-muted);
    pointer-events: none;
    animation: appear var(--duration-fast) ease-out both;
  }

  .flip .tooltip {
    left: auto;
    right: calc(100% + 8px);
  }

  .tooltip-name {
    font-size: 15px;
    font-weight: 600;
    color: var(--color-text);
  }

  .project .tooltip-name {
    color: var(--color-accent);
  }

  .support .tooltip-name {
    color: var(--color-accent-2);
  }

  .tooltip-id {
    margin-top: var(--space-1);
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--color-text-faint);
  }

  .hint {
    margin: 14px 0 0;
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--color-text-faint);
  }

  @keyframes appear {
    from {
      opacity: 0;
      translate: 0 4px;
    }
  }

  @media (max-width: 720px) {
    .inventory {
      width: 100%;
      padding: 14px;
    }

    .grid {
      grid-template-columns: repeat(5, minmax(0, 1fr));
    }

    .slot {
      width: auto;
      height: auto;
      aspect-ratio: 1;
    }

    .slot:nth-child(n + 16) {
      display: none;
    }

    /* The inspector sheet shows the same text, and a tooltip under a finger cannot be read anyway. */
    .tooltip {
      display: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .tooltip {
      animation: none;
    }
  }
</style>
