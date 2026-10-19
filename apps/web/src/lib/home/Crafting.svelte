<script lang="ts">
  import Button from '#lib/ui/Button.svelte';
  import Icon from '#lib/ui/Icon.svelte';
  import type { IconName } from '#lib/ui/icons.js';
  import { m } from '#lib/paraglide/messages.js';
  import { localizeHref } from '#lib/paraglide/runtime.js';

  // A plus-shaped recipe: four ingredients around donations in the middle, which go in last and complete it.
  const recipe: { slot: number; icon: IconName; name: () => string; donation?: boolean }[] = [
    { slot: 1, icon: 'idea', name: m.ingredient_idea },
    { slot: 3, icon: 'code', name: m.ingredient_code },
    { slot: 5, icon: 'lab', name: m.ingredient_tests },
    { slot: 7, icon: 'feedback', name: m.ingredient_feedback },
    { slot: 4, icon: 'heart', name: m.ingredient_donations, donation: true },
  ];

  let running = $state(false);

  // The animation starts when the table scrolls into view, so it is not half over before anyone sees it.
  function startWhenVisible(table: HTMLElement) {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      running = true;
      observer.disconnect();
    });
    observer.observe(table);
    return () => observer.disconnect();
  }
</script>

<div class="crafting">
  <div class="text">
    <span class="namespace">prexorlabs:recipe/serverlistplus</span>
    <h2 id="crafting-title">{m.craft_title()}</h2>
    <p>{m.craft_text()}</p>
    <ul>
      {#each recipe as ingredient (ingredient.slot)}
        <li class={{ donation: ingredient.donation }}><Icon name={ingredient.icon} size={18} />{ingredient.name()}</li>
      {/each}
    </ul>
    <Button href={localizeHref('/donate/')} variant="primary">{m.craft_cta()}</Button>
  </div>

  <div class={['table', { running }]} role="img" aria-label={m.craft_alt()} {@attach startWhenVisible}>
    <div class="grid-area">
      <span class="namespace">{m.craft_crafting()}</span>
      <div class="grid">
        {#each { length: 9 }, slot (slot)}
          {@const ingredient = recipe.find((entry) => entry.slot === slot)}
          <div class={['cell', { center: slot === 4 }]}>
            {#if ingredient}
              <span
                class={['placed', { donation: ingredient.donation }]}
                style:animation-delay="{recipe.indexOf(ingredient) * 0.55}s"
              >
                <Icon name={ingredient.icon} size={30} stroke={1.4} />
              </span>
            {/if}
          </div>
        {/each}
      </div>
    </div>
    <span class="arrow"><Icon name="arrow" size={36} stroke={1.5} /></span>
    <div class="result"><span class="made"><Icon name="serverList" size={44} stroke={1.3} /></span></div>
  </div>
</div>

<style>
  .crafting {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 48px 72px;
  }

  .text {
    flex: 1 1 380px;
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 22px;
  }

  .namespace {
    font-family: var(--font-mono);
    font-size: var(--font-size-small);
    color: var(--color-text-faint);
  }

  h2 {
    margin: 0;
    font-size: clamp(40px, 5vw, 72px);
    line-height: 0.95;
    font-weight: 600;
    letter-spacing: -0.055em;
  }

  p {
    margin: 0;
    max-width: 440px;
    font-size: 17px;
    line-height: 1.55;
    color: var(--color-text-muted);
  }

  ul {
    margin: 0;
    padding: 0;
    list-style: none;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px var(--space-5);
    font-size: 15px;
  }

  li {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .donation {
    color: var(--color-accent-2);
  }

  .table {
    flex: none;
    display: flex;
    align-items: center;
    gap: var(--space-5);
    padding: var(--space-5);
    border-radius: 18px;
    background: var(--color-surface-1);
    box-shadow: inset 0 0 0 1px var(--color-line);
  }

  .grid-area {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(3, 68px);
    gap: 6px;
  }

  .cell {
    width: 68px;
    height: 68px;
    border-radius: 10px;
    background: var(--color-surface-1);
    box-shadow: inset 0 0 0 1px var(--color-surface-3);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .cell.center {
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--color-accent-2) 35%, transparent);
  }

  .arrow {
    margin-top: 26px;
    color: var(--color-line-strong);
  }

  .result {
    width: 92px;
    height: 92px;
    margin-top: 26px;
    border-radius: 14px;
    background: var(--color-surface-1);
    box-shadow: inset 0 0 0 2px color-mix(in srgb, var(--color-accent) 35%, transparent);
    color: var(--color-accent);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Until the table is in view (and without JavaScript) the finished recipe stands still. */
  .placed,
  .made {
    display: flex;
  }

  .running .placed {
    animation: place 9s cubic-bezier(0.3, 1.3, 0.5, 1) infinite both;
  }

  .running .made {
    animation: made 9s cubic-bezier(0.3, 1.3, 0.5, 1) infinite both;
  }

  @keyframes place {
    0%,
    4% {
      opacity: 0;
      transform: scale(0.4);
    }
    8%,
    88% {
      opacity: 1;
      transform: none;
    }
    94%,
    100% {
      opacity: 0;
    }
  }

  @keyframes made {
    0%,
    52% {
      opacity: 0;
      transform: scale(0.4);
    }
    58% {
      opacity: 1;
      transform: scale(1.14);
    }
    62%,
    88% {
      opacity: 1;
      transform: none;
    }
    94%,
    100% {
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .running .placed,
    .running .made {
      animation: none;
    }
  }

  @media (max-width: 720px) {
    .table {
      gap: var(--space-3);
      padding: var(--space-4);
    }

    .grid {
      grid-template-columns: repeat(3, 52px);
    }

    .cell {
      width: 52px;
      height: 52px;
    }

    .result {
      width: 72px;
      height: 72px;
    }
  }
</style>
