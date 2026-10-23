<script lang="ts">
  import { m } from '#lib/paraglide/messages.js';
  import { localizeHref } from '#lib/paraglide/runtime.js';
</script>

<footer class="wrap">
  <p>© 2026 PrexorLabs. {m.footer_notice()}</p>
  <nav aria-label={m.footer_label()}>
    <a class="link" href={localizeHref('/legal/imprint/')}>{m.footer_imprint()}</a>
    <a class="link" href={localizeHref('/legal/privacy/')}>{m.footer_privacy()}</a>
    <a class="link" href="mailto:contact@prexorlabs.dev">contact@prexorlabs.dev</a>
  </nav>
</footer>

<style>
  footer {
    /* Room underneath for the hotbar, which floats over the bottom of the screen. */
    padding-top: 24px;
    padding-bottom: 112px;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 12px 32px;
    border-top: 1px solid var(--line);
    font-size: 14px;
    color: var(--muted);
  }

  p {
    margin: 0;
    max-width: 640px;
  }

  nav {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
  }
</style>
