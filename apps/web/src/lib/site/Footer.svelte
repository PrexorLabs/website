<script lang="ts">
  import { m } from '#lib/paraglide/messages.js';
  import { localizeHref } from '#lib/paraglide/runtime.js';
</script>

<footer>
  <div class="bar">
    <div class="about">
      <span class="namespace">prexorlabs:footer</span>
      <p>{m.footer_line()}</p>
      <p class="notice">© 2026 PrexorLabs · {m.footer_notice()}</p>
    </div>
    <nav aria-label={m.footer_label()}>
      <a href={localizeHref('/legal/imprint/')}>{m.footer_imprint()}</a>
      <a href={localizeHref('/legal/privacy/')}>{m.footer_privacy()}</a>
      <a href="/lab.xml">RSS</a>
      <a href="/github">GitHub</a>
      <a href="/discord">Discord</a>
      <a href="mailto:contact@prexorlabs.dev">contact@prexorlabs.dev</a>
    </nav>
  </div>
</footer>

<style>
  footer {
    border-top: 1px solid var(--color-surface-2);
  }

  .bar {
    box-sizing: border-box;
    max-width: 1240px;
    margin: 0 auto;
    /* Room for the hotbar, which floats over the bottom of the screen. */
    padding: var(--space-6) var(--space-5) 112px;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: var(--space-5) 48px;
  }

  .about {
    max-width: 520px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .namespace,
  .notice {
    font-family: var(--font-mono);
    font-size: var(--font-size-small);
    color: var(--color-text-faint);
  }

  p {
    margin: 0;
    font-size: 14px;
    line-height: 21px;
    color: var(--color-text-muted);
  }

  .notice {
    line-height: 18px;
  }

  nav {
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    gap: 0 var(--space-5);
    font-size: 14px;
  }

  nav a {
    min-height: 44px;
    display: inline-flex;
    align-items: center;
    color: var(--color-text-muted);
    text-decoration: none;
  }

  nav a:hover {
    color: var(--color-text);
  }
</style>
